'use client';

import { useEffect, useState } from 'react';
import { leerProgreso, type Progreso } from './routine';
import { leerProgresoRemoto } from './supabase/sync';

/** Progreso para el calendario: primero lo local (rápido, funciona sin red) y
 * luego el remoto si hay sesión, que trae los registros de todos los
 * dispositivos. `diasDescanso` solo existe en el dispositivo, así que se
 * conserva del local. Devuelve null hasta que monta (localStorage no existe
 * en el servidor). */
export function useProgresoCalendario(): Progreso | null {
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    const local = leerProgreso();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgreso(local);
    leerProgresoRemoto().then((remoto) => {
      if (remoto) setProgreso({ ...remoto, diasDescanso: local.diasDescanso });
    });
  }, []);

  return progreso;
}
