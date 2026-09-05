'use client';

// Atribución de campañas (21-BACKOFFICE / 36-ANALÍTICA, pedido explícito):
// captura utm_source/medium/campaign de la URL en el primer contacto y los
// recuerda durante todo el embudo — SOLO en localStorage (mismo dominio,
// nunca una cookie de terceros ni un píxel de anuncios; coherente con la
// Política de Privacidad, que promete "sin cookies de rastreo"). Se guardan
// UNA vez: si la persona vuelve después por otro link, no se pisa la
// campaña que la trajo la primera vez — eso es lo que de verdad responde
// "¿qué campaña convierte?", no la última que tocó antes de pagar.

const KEY = 'gymevo_utm';

export interface UTM {
  source: string;
  medium: string | null;
  campaign: string | null;
}

export function capturarUTMDesdeURL(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(KEY)) return; // ya hay uno guardado — first-touch, no se pisa
  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source');
  if (!source) return; // sin utm_source no hay campaña que atribuir
  const utm: UTM = {
    source,
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign'),
  };
  localStorage.setItem(KEY, JSON.stringify(utm));
}

export function leerUTM(): UTM | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UTM;
  } catch {
    return null;
  }
}
