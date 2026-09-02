// Máquina de estados de la membresía — docs/sistema/18-VENTA-HOTMART.md.
// Un evento viejo reentregado nunca debe reactivar un refund/chargeback; la
// RPC `apply_hotmart_event` ya aplica esta misma regla del lado servidor
// (esto es la versión de referencia/documentación del lado del handler).

export type EstadoMembresia = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

// ⚠️ PLACEHOLDER — verificar en el panel de Hotmart (Herramientas → Webhook)
// antes de confiar en la métrica trial→pago. Ver 18-VENTA-HOTMART.md.
const TRIAL_START_EVENT = 'SUBSCRIPTION_TRIAL_START'; // (verificar el nombre real de tu cuenta)

const EVENT_TO_STATUS: Record<string, EstadoMembresia> = {
  [TRIAL_START_EVENT]: 'trialing',
  PURCHASE_APPROVED: 'active',
  PURCHASE_COMPLETE: 'active',
  PURCHASE_DELAYED: 'past_due',
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  PURCHASE_EXPIRED: 'expired',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
};

export function statusForEvent(event: string): EstadoMembresia | null {
  return EVENT_TO_STATUS[event] ?? null;
}

const TERMINAL_NEGATIVE: EstadoMembresia[] = ['refunded', 'chargeback'];
const FULL_ACCESS: EstadoMembresia[] = ['trialing', 'active'];

/** ¿Es legal pasar de `from` a `to`? Bloquea reactivaciones ilegales por
 * eventos viejos reentregados (ej. un PURCHASE_APPROVED tardío después de un
 * reembolso ya procesado). */
export function canTransition(from: EstadoMembresia | null, to: EstadoMembresia): boolean {
  if (from === null) return true;
  if (TERMINAL_NEGATIVE.includes(from) && (to === 'active' || to === 'trialing')) return false;
  return true;
}

export function hasFullAccess(status: EstadoMembresia, now: Date, accessUntil?: Date | null, graceEndsAt?: Date | null): boolean {
  if (FULL_ACCESS.includes(status)) return true;
  if (status === 'cancelled') return !!accessUntil && now < accessUntil;
  if (status === 'past_due') return !!graceEndsAt && now < graceEndsAt;
  return false;
}
