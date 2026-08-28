'use client';

// HISTORIAL — registro de pesos/cargas (04-ARQUITECTURA → workout_logs).
// Estado vacío honesto si el usuario todavía no registró ninguna serie.

import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { leerProgreso, obtenerEjercicio, type Progreso } from '@/lib/routine';

export default function HistorialPage() {
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    setProgreso(leerProgreso());
  }, []);

  if (!progreso) return null;

  const porFecha = new Map<string, typeof progreso.logs>();
  for (const log of [...progreso.logs].reverse()) {
    const lista = porFecha.get(log.fecha) ?? [];
    lista.push(log);
    porFecha.set(log.fecha, lista);
  }

  return (
    <div className="px-5 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu progreso</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Historial</h1>

      {porFecha.size === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <History size={24} color="var(--accent)" />
          </span>
          <p className="mt-4 max-w-xs text-sm text-[var(--text-secondary)]">
            Todavía no registras ningún peso. En cuanto termines tu primer ejercicio, aparece aquí.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-5 pb-10">
          {Array.from(porFecha.entries()).map(([fecha, logs]) => (
            <div key={fecha}>
              <p className="text-xs font-semibold text-[var(--text-tertiary)]">{formatearFecha(fecha)}</p>
              <div className="mt-2 flex flex-col gap-2">
                {logs.map((log, i) => {
                  const ej = obtenerEjercicio(log.ejercicioId);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{ej.nombre}</span>
                      <span className="text-sm tabular-nums text-[var(--text-secondary)]">
                        {log.series}×{log.reps} · {log.peso > 0 ? `${log.peso} kg` : 'peso corporal'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso + 'T00:00:00');
  return fecha.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}
