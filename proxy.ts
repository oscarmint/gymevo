import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Refresca la sesión de Supabase en cada visita (26-AUTH-MODERNO: rotación de
// tokens transparente para el usuario) Y protege /app: sin sesión real, no se
// entra a la app interna — antes de esto, cualquiera con el link veía /app sin
// haber iniciado sesión, porque esas pantallas nunca revisaban si había usuario.
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/app')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('desde', 'app');
      return NextResponse.redirect(url);
    }

    // Hallazgo crítico de la auditoría de Sesión 7: antes de esto, cualquier
    // cuenta creada por magic link entraba a /app gratis para siempre — el
    // paywall no verificaba nada. `plan` lo fija reconciliar_membresia()
    // (ver lib/supabase/sync.ts y app/auth/callback/route.ts) según lo que
    // el webhook de Hotmart haya recibido para este correo.
    const { data: perfil } = await supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle();
    if (perfil?.plan !== 'pro') {
      const url = request.nextUrl.clone();
      url.pathname = '/paywall';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)'],
};
