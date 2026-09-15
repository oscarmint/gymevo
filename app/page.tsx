'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { registrarEvento } from '@/lib/analitica';
import { capturarUTMDesdeURL } from '@/lib/utm';
import { obtenerVarianteLanding, type VarianteLanding } from '@/lib/experimentos';
import LandingV1 from '@/components/landing/LandingV1';
import LandingV2 from '@/components/landing/LandingV2';

export default function LandingGymEvo() {
  const router = useRouter();
  // Si la app se abre desde el ícono del celular (PWA) y la persona ya tiene
  // sesión iniciada, debe entrar directo a su plan — como Instagram/Facebook,
  // nunca de vuelta a la página de ventas. Sin esto, cada apertura "se siente"
  // como un cierre de sesión aunque el token siga vigente.
  const [verificandoSesion, setVerificandoSesion] = useState(true);
  // A/B de landing (12/09/2026) — se decide en el cliente (localStorage, ver
  // lib/experimentos.ts) para no necesitar cookies de servidor; null mientras
  // no se sabe todavía, así nunca se pinta la V1 "por defecto" un instante
  // antes de la V2 (evita el parpadeo/flash de contenido equivocado).
  const [variante, setVariante] = useState<VarianteLanding | null>(null);

  useEffect(() => {
    let activo = true;
    crearClienteSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (!activo) return;
        if (data.user) {
          router.replace('/app');
          return;
        }
        setVerificandoSesion(false);
      });
    return () => {
      activo = false;
    };
  }, [router]);

  useEffect(() => {
    if (verificandoSesion) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVariante(obtenerVarianteLanding());
  }, [verificandoSesion]);

  // Contador anónimo de visitas para el panel del dueño (nunca guarda IP ni
  // identifica a nadie — ver app/api/analitica/visita/route.ts). Una vez por
  // carga de página, no por cada re-render. Se etiqueta con la variante para
  // poder comparar V1 vs V2 en el panel de administrador.
  useEffect(() => {
    if (verificandoSesion || !variante) return;
    capturarUTMDesdeURL();
    registrarEvento('landing_view', variante);
  }, [verificandoSesion, variante]);

  if (verificandoSesion || !variante) return null;

  return variante === 'a' ? <LandingV1 /> : <LandingV2 />;
}
