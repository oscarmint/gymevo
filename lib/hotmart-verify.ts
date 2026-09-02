// Verificación del webhook de Hotmart — docs/sistema/18-VENTA-HOTMART.md
// "SEGURIDAD DEL WEBHOOK (implementación real)". Sin esto, cualquiera podría
// crear usuarios Pro gratis mandando un POST falso al endpoint.

import crypto from 'node:crypto';

/** Comparación en tiempo constante (anti timing-attack) — nunca `===`/`!==`. */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** Fail-secure: si falta el secreto, revienta AL RECIBIR una petición real
 * (no al importar el módulo) — `next build` evalúa cada route.ts para
 * recolectar su configuración, así que reventar a nivel de módulo rompería
 * el build entero sin necesidad. En Vercel con la variable puesta, esto
 * nunca se dispara; sin ella, el webhook falla fuerte en cuanto Hotmart
 * manda el primer evento, que es exactamente cuándo debe fallar. */
function hottokEsperado(): string {
  const hottok = process.env.HOTMART_HOTTOK;
  if (!hottok) throw new Error('FALTA HOTMART_HOTTOK — el webhook no puede operar de forma segura');
  return hottok;
}

export function verifyHotmart(hottok: string | undefined): boolean {
  if (!hottok) return false;
  return timingSafeEqualStr(hottok, hottokEsperado());
}

const REPLAY_WINDOW_MS = 5 * 60 * 1000;

/** Ventana anti-replay: si el evento trae fecha y es más vieja que esto, se
 * rechaza (defensa en profundidad — la idempotencia ya frena el reproceso). */
export function isFresh(eventTimestampMs?: number): boolean {
  if (!eventTimestampMs) return true;
  const age = Date.now() - eventTimestampMs;
  return age >= 0 && age <= REPLAY_WINDOW_MS;
}
