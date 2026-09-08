// Cron: revisa quién dejó el entrenamiento de HOY a medias (ya registró al
// menos una serie, pero no lo terminó) y su último registro fue hace más de
// UMBRAL_MINUTOS — le manda un push recordándole que sigue en curso. La
// persona decide desde la app: seguir donde iba, o tocar "Cortar aquí" para
// darlo por terminado con lo que alcanzó a hacer (app/app/page.tsx).
// Mismo patrón que recordatorio-inactividad: protegido con CRON_SECRET.
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarPush } from '@/lib/push';

export const runtime = 'nodejs'; // web-push usa node:crypto

const UMBRAL_MINUTOS = 45;

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

const TITULO = 'Tienes una rutina en curso 💪';
const CUERPO = 'La dejaste a medias hace un rato. Retómala donde ibas, o ábrela y toca "Cortar aquí" para darla por terminada.';

export async function GET(req: NextRequest) {
  // Fail-secure (mismo criterio que el resto de crons y el webhook de Hotmart):
  // sin CRON_SECRET configurado, se rechaza a TODOS en vez de dejar pasar a todos.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = clienteAdmin();

  const { data: usuarios, error: errUsuarios } = await admin.rpc('usuarios_para_recordatorio_entrenamiento_a_medias', {
    minutos_inactividad: UMBRAL_MINUTOS,
  });
  if (errUsuarios) return NextResponse.json({ error: errUsuarios.message }, { status: 500 });
  if (!usuarios || usuarios.length === 0) {
    return NextResponse.json({ procesados: 0, enviados: 0 });
  }

  let enviados = 0;
  const hoy = new Date().toISOString().slice(0, 10);

  for (const u of usuarios as { id: string; nombre: string | null }[]) {
    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', u.id);

    for (const sub of subs ?? []) {
      try {
        const ok = await enviarPush(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          { titulo: TITULO, cuerpo: CUERPO, url: '/app' }
        );
        if (ok) {
          enviados++;
        } else {
          // Suscripción muerta (permiso revocado, navegador desinstalado) — se borra.
          await admin.from('push_subscriptions').delete().eq('id', sub.id);
        }
      } catch {
        // Un fallo de red puntual con un dispositivo no debe frenar al resto.
      }
    }

    // Se marca como "avisado hoy" aunque no tuviera ninguna suscripción activa —
    // así no se reintenta en cada corrida del cron durante el mismo día.
    await admin.from('profiles').update({ ultimo_recordatorio_a_medias: hoy }).eq('id', u.id);
  }

  return NextResponse.json({ procesados: usuarios.length, enviados });
}
