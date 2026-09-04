'use client';

// Precio en pesos colombianos junto al de dólares (landing + paywall) — la
// mayoría de la venta es en Colombia y un usuario que solo ve "$4.99" sin
// saber cuánto es en su moneda se va antes de comprar.

import { useEffect, useState } from 'react';

/** Hook: pide la TRM del día UNA vez (el endpoint propio cachea 1h). Si falla
 * por cualquier motivo, `trm` se queda en null y quien lo use simplemente no
 * muestra la conversión — nunca rompe la pantalla por esto. */
export function useTRM(): { trm: number | null } {
  const [trm, setTrm] = useState<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    fetch('/api/trm')
      .then((r) => r.json())
      .then((data: { valor: number | null }) => {
        if (!cancelado && typeof data.valor === 'number') {
          setTrm(data.valor);
        }
      })
      .catch(() => {
        // Sin TRM: se sigue mostrando solo el precio en dólares.
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return { trm };
}

/** Extrae el número de un precio en dólares tipo "$4.99" o "$29.99". */
export function extraerNumeroUSD(texto: string): number | null {
  const match = texto.match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

const FORMATO_COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/** "$4.99" + TRM → "≈ $19.500 COP". Redondea al peso, sin decimales (nadie
 * cobra centavos de peso colombiano). El sufijo "COP" es obligatorio (pedido
 * explícito del usuario): ambas monedas usan el símbolo "$", así que sin la
 * etiqueta de moneda un usuario puede confundir pesos con dólares. */
export function formatearCOP(precioUSD: string, trm: number): string | null {
  const numero = extraerNumeroUSD(precioUSD);
  if (numero === null) return null;
  return `${FORMATO_COP.format(numero * trm)} COP`;
}
