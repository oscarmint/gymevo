import { NextResponse } from 'next/server';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';

// Adonde llega el usuario al tocar el link del correo (magic link de Supabase Auth).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/app';

  if (code) {
    const supabase = await crearClienteSupabaseServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Reconciliar el plan AQUÍ, antes de redirigir: si se hace recién en el
      // cliente al montar /app, proxy.ts revisaría el plan un instante antes
      // de que exista la fila del perfil — un usuario que acaba de pagar
      // vería el paywall otra vez en su primer clic. Ver lib/supabase/sync.ts.
      await supabase.rpc('reconciliar_membresia');
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
