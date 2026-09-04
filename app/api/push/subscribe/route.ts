// Guarda/borra la suscripción push de ESTE dispositivo para el usuario
// autenticado. Usa el cliente con la sesión del usuario (no service role) a
// propósito: el RLS de `push_subscriptions` ya garantiza que solo pueda
// tocar sus propias filas — la app nunca podría insertar a nombre de otro.
import { NextRequest, NextResponse } from 'next/server';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';

interface SuscripcionEntrante {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function POST(req: NextRequest) {
  const supabase = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no autenticado' }, { status: 401 });

  const body: SuscripcionEntrante = await req.json();
  if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
    return NextResponse.json({ error: 'suscripción inválida' }, { status: 400 });
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
    { onConflict: 'endpoint' }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no autenticado' }, { status: 401 });

  const { endpoint }: { endpoint?: string } = await req.json();
  if (!endpoint) return NextResponse.json({ error: 'falta endpoint' }, { status: 400 });

  const { error } = await supabase.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
