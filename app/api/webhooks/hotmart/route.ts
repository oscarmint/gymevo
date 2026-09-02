// Webhook de Hotmart — activa/desactiva el plan real del usuario cuando paga,
// cancela o pide reembolso. Ver docs/sistema/18-VENTA-HOTMART.md.
// Hallazgo crítico #1 de la auditoría (Sesión 7): antes de esto no existía
// ninguna forma de cobrar de verdad — el paywall no hacía nada.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { verifyHotmart, isFresh } from '@/lib/hotmart-verify';
import { statusForEvent } from '@/lib/membership-fsm';

export const runtime = 'nodejs'; // necesitamos node:crypto y el raw body (no Edge)

// Fail-secure, pero evaluado AL RECIBIR una petición (no al importar el
// módulo): `next build` recolecta la configuración de cada route.ts, y un
// throw a nivel de módulo rompería el build entero sin ninguna petición real
// de por medio. service_role: SOLO se usa aquí, en el servidor.
function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY — el webhook no puede operar sin ella');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

interface PayloadHotmart {
  event?: string;
  id?: string;
  event_id?: string;
  creation_date?: number;
  data?: {
    buyer?: { email?: string };
    purchase?: { transaction?: string; approved_date?: number };
    subscription?: { subscriber?: { code?: string }; trial?: { end_date?: number } };
  };
}

export async function POST(req: NextRequest) {
  const admin = clienteAdmin();

  // 1. RAW body — bytes exactos, antes de parsear (para el hash de auditoría).
  const rawBody = await req.text();

  // 2. Autenticidad — hottok en tiempo constante, sobre HTTPS.
  const hottok = req.headers.get('x-hotmart-hottok') ?? undefined;
  if (!verifyHotmart(hottok)) {
    await admin.from('webhook_log').insert({ result: 'unauthorized' });
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // 3. Parsear SOLO después de verificar.
  let payload: PayloadHotmart;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  // 4. Frescura (anti-replay).
  const ts = payload.creation_date ?? payload.data?.purchase?.approved_date;
  if (!isFresh(ts)) {
    return NextResponse.json({ error: 'stale' }, { status: 400 });
  }

  const event = payload.event ?? '';
  const email = payload.data?.buyer?.email;
  const subscriberCode = payload.data?.subscription?.subscriber?.code;
  const eventId =
    payload.id ?? payload.event_id ?? payload.data?.purchase?.transaction ?? `${event}:${email ?? ''}:${ts ?? ''}`;

  const newStatus = statusForEvent(event);
  if (!newStatus) {
    // Evento que no mapeamos todavía (ej. SWITCH_PLAN — ver 18-VENTA-HOTMART.md,
    // pendiente documentado en ESTADO.md): 200 para que Hotmart no reintente.
    return NextResponse.json({ received: true, ignored: event });
  }

  if (!email) {
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'missing email' }, { status: 400 });
  }

  const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
  const trialEndsAt = payload.data?.subscription?.trial?.end_date
    ? new Date(payload.data.subscription.trial.end_date).toISOString()
    : null;

  // 5. Idempotencia + transición legal + cambio de estado, TODO atómico en la RPC.
  const { data, error } = await admin.rpc('apply_hotmart_event', {
    p_event_id: eventId,
    p_event_type: event,
    p_payload_hash: payloadHash,
    p_email: email,
    p_subscriber_code: subscriberCode ?? null,
    p_new_status: newStatus,
    p_trial_ends_at: trialEndsAt,
    p_access_until: null,
  });

  if (error) {
    console.error('webhook hotmart error', { event, code: error.code }); // sin PII
    await admin.from('webhook_log').insert({ event_id: eventId, type: event, result: 'error' });
    return NextResponse.json({ error: 'processing failed' }, { status: 500 }); // 5xx → Hotmart reintenta
  }

  const status: string = data?.status ?? 'applied';
  const result = status === 'duplicate' ? 'duplicate' : status === 'illegal_transition' ? 'illegal' : 'applied';
  await admin.from('webhook_log').insert({ event_id: eventId, type: event, result });

  // 6. Siempre 200 cuando la decisión se tomó (incluido duplicate/illegal) —
  //    así Hotmart deja de reintentar. Solo 5xx en fallo real de verdad.
  return NextResponse.json({ received: true, result: status });
}
