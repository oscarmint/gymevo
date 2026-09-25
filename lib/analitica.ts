'use client';

// Contador anónimo para el embudo del panel de administrador (21-BACKOFFICE /
// 36-ANALÍTICA) — nunca guarda quién es la persona, solo suma 1 al tipo de
// evento (y, si existe, la campaña UTM que trajo a la persona — ver lib/utm.ts).
// Mismo criterio que ya declara la Política de Privacidad: sin cookies de
// rastreo, sin identificar a nadie.
import { leerUTM } from './utm';

export type EventoEmbudo =
  | 'landing_view'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'plan_preview_view'
  | 'demo_rescate'
  | 'paywall_view'
  | 'checkout_click'
  | 'trial_click';

// `variante` es opcional: solo la landing y el onboarding (que heredan la
// variante ya asignada, ver lib/experimentos.ts) la mandan — sirve para
// comparar LandingV1 vs LandingV2 en el panel de administrador (A/B, 12/09/2026).
export function registrarEvento(tipo: EventoEmbudo, variante?: 'a' | 'b') {
  fetch('/api/analitica/visita', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, utm: leerUTM(), variante }),
  }).catch(() => {});
}
