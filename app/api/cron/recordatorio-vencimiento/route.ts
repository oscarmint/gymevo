// Cron diario (ver vercel.json): avisa por push a quien le quedan 7, 3 o 1
// días de acceso — y el mismo día que vence — para que renueve (pago único,
// sin cobro automático). Protegido con CRON_SECRET, igual que los otros crons.
// Como corre una vez al día y cada ventana cubre exactamente un día calendario
// (UTC), cada persona recibe cada aviso una sola vez sin necesitar columnas
// de "ya avisado".
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarPush } from '@/lib/push';

export const runtime = 'nodejs'; // web-push usa node:crypto

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

const DIA_MS = 86_400_000;

const AVISOS: { dias: number; titulo: string; cuerpo: string }[] = [
  { dias: 7, titulo: 'Tu acceso a GymEvo vence en 7 días', cuerpo: 'Renueva cuando quieras y no pierdas tu racha ni tu progreso.' },
  { dias: 3, titulo: 'Te quedan 3 días de acceso', cuerpo: 'Renueva con PSE, Nequi, tarjeta o Efecty en un minuto.' },
  { dias: 1, titulo: 'Tu acceso vence mañana', cuerpo: 'Renueva hoy y sigue entrenando sin interrupciones.' },
  { dias: 0, titulo: 'Tu acceso a GymEvo vence hoy', cuerpo: 'Renueva ahora — te damos unos días de gracia, pero no lo dejes pasar.' },
];

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = clienteAdmin();
  const hoy = new Date();
  const inicioHoy = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());

  let procesados = 0;
  let enviados = 0;

  for (const aviso of AVISOS) {
    const desde = new Date(inicioHoy + aviso.dias * DIA_MS).toISOString();
    const hasta = new Date(inicioHoy + (aviso.dias + 1) * DIA_MS).toISOString();
    const { data: usuarios, error } = await admin
      .from('profiles')
      .select('id')
      .eq('membership_status', 'active')
      .gte('access_until', desde)
      .lt('access_until', hasta);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    for (const u of usuarios ?? []) {
      procesados++;
      const { data: subs } = await admin
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('user_id', u.id);

      for (const sub of subs ?? []) {
        try {
          const ok = await enviarPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            { titulo: aviso.titulo, cuerpo: aviso.cuerpo, url: '/paywall?renovar=1' }
          );
          if (ok) enviados++;
          else await admin.from('push_subscriptions').delete().eq('id', sub.id);
        } catch {
          // Un fallo de red con un dispositivo no debe frenar al resto.
        }
      }
    }
  }

  return NextResponse.json({ procesados, enviados });
}
