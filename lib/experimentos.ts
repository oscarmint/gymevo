'use client';

// A/B de landing (12/09/2026, a pedido explícito del usuario) — LandingV1
// (mecanismo al frente) vs LandingV2 (miedo a mala técnica/identidad).
// Asignación 50/50 al azar, UNA sola vez por navegador, guardada en
// localStorage (NO una cookie — la Política de Privacidad promete "sin
// cookies de rastreo"; esto no rastrea nada entre sitios ni identifica a la
// persona, solo recuerda qué versión le tocó para que siempre vea la misma).
// Ver docs/sistema/37-FEATURE-FLAGS-Y-EXPERIMENTOS.md — regla dura: nunca
// Math.random() en cada carga, o la persona saltaría de variante y arruinaría
// el experimento.

export type VarianteLanding = 'a' | 'b';

const CLAVE = 'gymevo_landing_variante';

export function obtenerVarianteLanding(): VarianteLanding {
  if (typeof window === 'undefined') return 'a'; // SSR: el cliente decide de verdad en el useEffect
  try {
    const guardada = localStorage.getItem(CLAVE);
    if (guardada === 'a' || guardada === 'b') return guardada;
    const nueva: VarianteLanding = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(CLAVE, nueva);
    return nueva;
  } catch {
    // localStorage bloqueado (modo privado estricto, etc.) — no rompe la
    // landing, solo no se puede "recordar" la variante entre visitas.
    return Math.random() < 0.5 ? 'a' : 'b';
  }
}

/** Lee la variante ya asignada sin crear una nueva si no existe — para
 * etiquetar eventos en pantallas posteriores (onboarding) con la misma
 * variante que vio la persona en la landing. */
export function leerVarianteLanding(): VarianteLanding | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'a' || v === 'b' ? v : null;
  } catch {
    return null;
  }
}
