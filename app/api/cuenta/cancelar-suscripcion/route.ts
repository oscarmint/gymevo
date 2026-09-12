// Cancela DE VERDAD la suscripción del usuario autenticado — botón
// "Desactivar" en Perfil. El subscriber_code NUNCA se recibe del cliente
// (sería falsificable): se busca en el servidor a partir del email de la
// sesión, igual que hace `apply_hotmart_event` con los webhooks entrantes.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { cancelarSuscripcionHotmart } from '@/lib/hotmart-api';

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('FALTA NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) throw new Error('FALTA SUPABASE_SERVICE_ROLE_KEY');
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function POST() {
  const supabaseUsuario = await crearClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'no autenticado' }, { status: 401 });

  const admin = clienteAdmin();

  const { data: compra } = await admin
    .from('hotmart_purchases')
    .select('hotmart_subscriber_code, status')
    .eq('email', user.email)
    .maybeSingle();

  if (!compra?.hotmart_subscriber_code) {
    return NextResponse.json({ error: 'No encontramos una suscripción activa de Hotmart para tu cuenta.' }, { status: 404 });
  }
  if (compra.status === 'cancelled') {
    return NextResponse.json({ ok: true, yaEstaba: true });
  }

  try {
    await cancelarSuscripcionHotmart(compra.hotmart_subscriber_code);
  } catch (e) {
    console.error('cancelar-suscripcion: Hotmart rechazó la cancelación', e);
    return NextResponse.json(
      { error: 'Hotmart no pudo cancelar tu suscripción ahora mismo. Intenta de nuevo en un momento.' },
      { status: 502 },
    );
  }

  // Reflejo inmediato en nuestra base — el webhook de Hotmart (CANCELLATION)
  // va a llegar también y confirma lo mismo, pero el usuario no debe esperar
  // a eso para ver el cambio en su propia pantalla.
  await admin.from('hotmart_purchases').update({ status: 'cancelled' }).eq('email', user.email);
  await admin.from('profiles').update({ membership_status: 'cancelled' }).eq('id', user.id);

  return NextResponse.json({ ok: true });
}
