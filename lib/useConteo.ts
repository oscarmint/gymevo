'use client';

import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

/** Número héroe que cuenta desde 0 (o desde `desde`) hasta `valor` al montar
 * o cuando `valor` cambia (baseline obligatoria de movimiento, 14/22) —
 * mismo timing que ya usa la racha de Plan de hoy y los días del onboarding,
 * ahora compartido para no repetir el mismo useEffect en cada pantalla.
 * Se salta la animación con prefers-reduced-motion. */
export function useConteo(valor: number, desde = 0): number {
  const reduce = useReducedMotion();
  const [mostrado, setMostrado] = useState(reduce ? valor : desde);

  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMostrado(valor);
      return;
    }
    const controls = animate(desde, valor, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setMostrado(v),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, reduce]);

  return mostrado;
}
