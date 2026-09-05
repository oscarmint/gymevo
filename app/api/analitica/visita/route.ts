// Contador anónimo del embudo — para el panel de administrador (21-BACKOFFICE
// / 36-ANALÍTICA): "cuántos visitan y no se registran", "cuántos empiezan el
// cuestionario y no lo terminan". Nunca guarda IP, user-agent, ni ningún dato
// que identifique a la persona — solo suma 1 al tipo de evento, coherente con
// lo que la Política de Privacidad promete ("GymEvo no usa cookies de rastreo
// ni píxeles publicitarios"). Usa la llave de servidor porque un visitante
// anónimo no tiene sesión — event_log no permite insertar sin ella (a
// propósito, ver migración 0011).
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

// Lista blanca — nunca se inserta un `type` arbitrario que alguien mande.
const TIPOS_VALIDOS = ['landing_view', 'onboarding_start', 'onboarding_complete'] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const tipo = TIPOS_VALIDOS.includes(body?.tipo) ? body.tipo : 'landing_view';
    const utm = body?.utm;
    const metadata =
      utm && typeof utm === 'object' && typeof utm.source === 'string'
        ? { utm: { source: utm.source, medium: utm.medium ?? null, campaign: utm.campaign ?? null } }
        : null;
    const admin = clienteAdmin();
    await admin.from('event_log').insert({ type: tipo, metadata });
  } catch {
    // Un fallo acá nunca debe afectar al visitante real — es solo un contador.
  }
  return NextResponse.json({ ok: true });
}
