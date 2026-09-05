'use client';

// Contador anónimo para el embudo del panel de administrador (21-BACKOFFICE /
// 36-ANALÍTICA) — nunca guarda quién es la persona, solo suma 1 al tipo de
// evento (y, si existe, la campaña UTM que trajo a la persona — ver lib/utm.ts).
// Mismo criterio que ya declara la Política de Privacidad: sin cookies de
// rastreo, sin identificar a nadie.
import { leerUTM } from './utm';

export type EventoEmbudo = 'landing_view' | 'onboarding_start' | 'onboarding_complete';

export function registrarEvento(tipo: EventoEmbudo) {
  fetch('/api/analitica/visita', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tipo, utm: leerUTM() }),
  }).catch(() => {});
}
