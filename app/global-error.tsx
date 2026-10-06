'use client';

import { AlertTriangle } from 'lucide-react';
import { CLASE_BOTON_PRINCIPAL, PantallaDeError } from '@/components/PantallaDeError';
import './globals.css';

/** Último recurso: si falla el propio layout raíz (donde se importan los
 * estilos y se registra el service worker), error.tsx ya no puede mostrarse.
 * Este reemplaza el documento completo, por eso lleva <html> y <body> y vuelve
 * a importar los estilos globales. */
export default function ErrorGlobal({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-dvh flex flex-col">
        <PantallaDeError
          icono={<AlertTriangle size={36} color="var(--bg)" strokeWidth={2.4} aria-hidden="true" />}
          titulo="Algo salió mal"
          mensaje="GymEvoApp no pudo cargar. Tu progreso en la cuenta está a salvo. Intenta de nuevo."
        >
          <button type="button" onClick={reset} className={CLASE_BOTON_PRINCIPAL}>
            Reintentar
          </button>
        </PantallaDeError>
      </body>
    </html>
  );
}
