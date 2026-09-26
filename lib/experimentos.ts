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
  // 26/09/2026: a pedido del dueño, solo se usa UNA landing (LandingV1, la del
  // mecanismo). El A/B queda apagado: todos ven 'a'. LandingV2 sigue en el repo
  // por si se retoma el experimento, pero ya no se muestra.
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CLAVE, 'a');
    } catch {
      // sin localStorage no pasa nada: la variante es fija.
    }
  }
  return 'a';
}

/** Variante para etiquetar eventos: con una sola landing siempre es 'a'. */
export function leerVarianteLanding(): VarianteLanding | null {
  return 'a';
}
