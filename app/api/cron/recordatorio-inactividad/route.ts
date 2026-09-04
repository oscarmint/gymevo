// Cron diario (ver vercel.json): revisa quién lleva EXACTAMENTE 2 días sin
// completar un entrenamiento y le manda un push al mismo dispositivo donde
// lo activó. Protegido con CRON_SECRET — Vercel Cron agrega automáticamente
// el header "Authorization: Bearer <CRON_SECRET>" cuando esa variable existe.
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

// Copy elegido por el usuario — "Empática y Relajada": valida que a veces la
// vida se interpone, sin culpa, y anima a retomar hoy mismo.
const TITULO = '¿Todo bien por ahí? 👀';
const CUERPO = 'Llevas 2 días de descanso. Tomar un respiro está perfecto, pero no pierdas el ritmo. ¿Hacemos una rutina corta hoy?';

export async function GET(req: NextRequest) {
  // Fail-secure (auditoría de seguridad 04/09/2026): sin CRON_SECRET
  // configurado en Vercel, este endpoint quedaba abierto para cualquiera —
  // mismo criterio que ya usa el webhook de Hotmart (hotmart-verify.ts):
  // sin la clave, se rechaza a TODOS en vez de dejar pasar a todos.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET no configurado' }, { status: 500 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = clienteAdmin();

  const { data: usuarios, error: errUsuarios } = await admin.rpc('usuarios_para_recordatorio_inactividad');
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

    // Se marca como "avisado" aunque no tuviera ninguna suscripción activa —
    // la condición de la función SQL solo vuelve a cumplirse si el usuario
    // entrena de nuevo y luego pasan otros 2 días (no se reintenta a diario).
    await admin.from('profiles').update({ ultimo_recordatorio_inactividad: hoy }).eq('id', u.id);
  }

  return NextResponse.json({ procesados: usuarios.length, enviados });
}
