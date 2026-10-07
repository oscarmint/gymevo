'use client';

import { useEffect, useState } from 'react';
import { HardDriveDownload } from 'lucide-react';
import { escribirLocal, leerLocal } from '@/lib/almacen';

const KEY_VISTO = 'gymevo_aviso_cache_visto';

/** Aviso de una sola vez: la app guarda en el teléfono (caché) las ilustraciones
 * y animaciones que la persona abre (ver public/sw.js). Se le dice qué se guarda
 * y para qué, antes de que ocurra, y que NO se descarga nada por adelantado.
 * Se descarta con "Entendido" y no vuelve a salir en este dispositivo. */
export function AvisoCache() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage no existe en el servidor: se lee solo en el cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (leerLocal(KEY_VISTO) !== '1') setVisible(true);
  }, []);

  if (!visible) return null;

  function entendido() {
    escribirLocal(KEY_VISTO, '1');
    setVisible(false);
  }

  return (
    <div
      role="region"
      aria-label="Aviso sobre lo que se guarda en tu teléfono"
      className="mt-4 flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--surface)] p-4"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chip-bg)]">
        <HardDriveDownload size={17} color="var(--accent)" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Guardamos en tu teléfono lo que abres</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          Las ilustraciones y animaciones de los ejercicios se guardan en la memoria del teléfono (caché), solo cuando las abres. Así cargan al
          instante, siguen funcionando si en tu gimnasio no hay señal y gastas menos datos. No descargamos nada por adelantado.
        </p>
        <button
          type="button"
          onClick={entendido}
          className="mt-1.5 inline-flex min-h-11 items-center text-xs font-semibold text-[var(--accent)]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
