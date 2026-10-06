import type { ReactNode } from 'react';

/** Pantalla de error con la marca de GymEvoApp — la usan not-found.tsx,
 * error.tsx y global-error.tsx. Antes no existía ninguna: una URL mala mostraba
 * el 404 en inglés de Next y un fallo en pantalla podía quedar en blanco, lo
 * que contradice la regla del proyecto "la app nunca muestra pantalla blanca"
 * (auditoría 05/10/2026). Sin hooks, así que sirve igual en servidor y cliente. */
export function PantallaDeError({
  icono,
  titulo,
  mensaje,
  children,
}: {
  icono: ReactNode;
  titulo: string;
  mensaje: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-6 py-12 text-center [font-family:var(--font-body)]">
      <span className="chip-3d flex size-20 items-center justify-center rounded-2xl bg-[var(--accent)]">{icono}</span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{titulo}</h1>
      <p className="mt-3 max-w-sm text-base text-[var(--text-secondary)]">{mensaje}</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">{children}</div>
    </main>
  );
}

/** Botón principal (acento) y enlace secundario, con los mismos estilos que el resto de la app. */
export const CLASE_BOTON_PRINCIPAL =
  'boton-3d flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)]';
export const CLASE_ENLACE_SECUNDARIO =
  'flex h-12 w-full items-center justify-center text-sm font-medium text-[var(--text-secondary)] underline-offset-2 hover:underline';
