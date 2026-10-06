'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { CLASE_BOTON_PRINCIPAL, CLASE_ENLACE_SECUNDARIO, PantallaDeError } from '@/components/PantallaDeError';
import { limpiarDatosLocales } from '@/lib/datos-locales';

/** Red de seguridad de toda la app: si algo falla al pintar una pantalla, la
 * persona ve esto en vez de una pantalla en blanco. Si el fallo viene de datos
 * locales dañados (el caso más probable en una PWA que guarda el progreso en el
 * teléfono), "Reintentar" no basta — por eso se ofrece, aparte y con
 * confirmación, borrar lo guardado solo en este dispositivo. */
export default function ErrorDeLaApp({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);

  function borrarYReintentar() {
    limpiarDatosLocales();
    // reset() vuelve a pintar la pantalla que falló ya con el almacenamiento
    // limpio; replace lleva a /app, que vuelve a leer todo desde cero (y desde
    // la cuenta si hay sesión).
    reset();
    router.replace('/app');
  }

  return (
    <PantallaDeError
      icono={<AlertTriangle size={36} color="var(--bg)" strokeWidth={2.4} aria-hidden="true" />}
      titulo="Algo salió mal"
      mensaje="No pudimos mostrar esta pantalla. Tu progreso en la cuenta está a salvo. Intenta de nuevo."
    >
      <button type="button" onClick={reset} className={CLASE_BOTON_PRINCIPAL}>
        Reintentar
      </button>
      <Link href="/" className={CLASE_ENLACE_SECUNDARIO}>
        Volver al inicio
      </Link>

      <details className="mt-4 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] px-4 py-3 text-left">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-secondary)]">¿Sigue fallando?</summary>
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Puedes borrar lo que GymEvoApp guardó solo en este dispositivo. Lo que ya está en tu cuenta se recupera al entrar; las series
          que no alcanzaron a subirse se perderían.
        </p>
        {confirmando ? (
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={borrarYReintentar}
              className="h-11 flex-1 rounded-xl bg-[var(--status-error)] text-sm font-semibold text-[var(--bg)]"
            >
              Sí, borrar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="h-11 flex-1 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-sm font-semibold text-[var(--text-primary)]"
            >
              Volver
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="mt-3 h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-sm font-semibold text-[var(--text-primary)]"
          >
            Borrar datos de este dispositivo
          </button>
        )}
      </details>
    </PantallaDeError>
  );
}
