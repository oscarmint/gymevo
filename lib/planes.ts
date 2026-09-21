// Planes de pago único (21/09/2026): el usuario paga una vez por N meses de
// acceso (PSE, Nequi, Efecty, tarjeta o PayPal) y renueva pagando de nuevo —
// no hay cobro recurrente. Este módulo lo comparten el webhook (cuánto acceso
// da cada compra) y la UI.

export type PlanId = 'mensual' | 'semestral' | 'anual';

export const MESES_POR_PLAN: Record<PlanId, number> = { mensual: 1, semestral: 6, anual: 12 };

/** Días extra tras vencer antes de bloquear la app — margen para que alguien
 * con pago pendiente (PSE/Efecty) o distraído no pierda el acceso de golpe. */
export const DIAS_DE_GRACIA = 3;

const CHECKOUTS: Record<PlanId, string | undefined> = {
  mensual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_MENSUAL,
  semestral: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_SEMESTRAL,
  anual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL,
};

/** Código de oferta que va en el link de checkout de Hotmart (`?off=abc123`). */
function codigoDeOferta(link: string | undefined): string | null {
  if (!link) return null;
  try {
    return new URL(link).searchParams.get('off');
  } catch {
    return null;
  }
}

/** Meses de acceso que da una compra, según su código de oferta de Hotmart.
 * null si la oferta no corresponde a ninguno de los 3 links configurados. */
export function mesesDeOferta(codigo: string | undefined | null): number | null {
  if (!codigo) return null;
  for (const id of Object.keys(CHECKOUTS) as PlanId[]) {
    if (codigoDeOferta(CHECKOUTS[id]) === codigo) return MESES_POR_PLAN[id];
  }
  return null;
}

/** Nuevo vencimiento: los meses se SUMAN al acceso que ya le quedaba (quien
 * renueva antes de vencer no pierde días). */
export function calcularVencimiento(meses: number, vencimientoActual: Date | null, ahora = new Date()): Date {
  const base = vencimientoActual && vencimientoActual > ahora ? vencimientoActual : ahora;
  const fin = new Date(base);
  fin.setUTCMonth(fin.getUTCMonth() + meses);
  return fin;
}
