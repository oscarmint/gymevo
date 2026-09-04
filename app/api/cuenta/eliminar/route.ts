// Elimina la cuenta del usuario autenticado — botón "Eliminar mi cuenta" en
// Perfil (47-LEGAL-FISCAL-Y-PRIVACIDAD: el derecho de eliminación necesita un
// CAMINO real, no solo la promesa de "escríbenos"). Borra todo lo que es del
// usuario (perfil, historial, foto, suscripciones push) y la cuenta de auth.
// `hotmart_purchases` NO se borra: es el registro de la compra que la ley nos
// obliga a conservar para nuestra propia contabilidad (se declara así en la
// política de privacidad) — no tiene más datos que el correo y el estado del
// pago, y deja de estar ligado a ninguna cuenta activa.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function DELETE() {
  const supabaseUsuario = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no autenticado' }, { status: 401 });

  const admin = clienteAdmin();
  const uid = user.id;

  await admin.from('push_subscriptions').delete().eq('user_id', uid);
  await admin.from('workout_logs').delete().eq('user_id', uid);

  const { data: archivos } = await admin.storage.from('avatars').list(uid);
  if (archivos && archivos.length > 0) {
    await admin.storage.from('avatars').remove(archivos.map((a) => `${uid}/${a.name}`));
  }

  await admin.from('profiles').delete().eq('id', uid);

  const { error: errorAuth } = await admin.auth.admin.deleteUser(uid);
  if (errorAuth) return NextResponse.json({ error: errorAuth.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
