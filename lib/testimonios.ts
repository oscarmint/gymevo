// TESTIMONIOS REALES — regla del dueño (25/09/2026): aquí SOLO entran opiniones de personas
// reales que usaron GymEvo (beta cerrada) y AUTORIZARON por escrito que se publique su
// nombre y su frase. Nunca se inventan, se "mejoran" ni se completan. Mientras esta lista
// esté vacía, la sección NO aparece en la landing (ver components/landing/Testimonios.tsx).
//
// Cómo agregar uno: guarda el permiso (captura del formulario o mensaje) en tu archivo
// privado y agrega el objeto con la frase TAL CUAL la escribió la persona (solo se corrigen
// tildes o errores de tipeo evidentes).

export interface Testimonio {
  /** Frase textual de la persona. */
  frase: string;
  /** Nombre y apellido inicial, como autorizó (ej. "Camilo R."). */
  nombre: string;
  /** Ciudad o país, si lo autorizó (opcional). */
  lugar?: string;
  /** Detalle verificable (ej. "Beta · 30 días de uso"). */
  contexto?: string;
  /** Solo se muestra si es true: la persona autorizó publicarlo. */
  permisoPublicar: boolean;
}

export const TESTIMONIOS: Testimonio[] = [];
