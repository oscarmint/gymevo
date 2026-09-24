'use client';

// La semana de un vistazo (lunes a domingo, hoy marcado por defecto) y, debajo,
// las rutinas del plan: la persona toca cuál quiere hacer HOY. Sirve cuando no
// siguió el orden (ej. plan de 4 días, es viernes y solo entrenó el martes: elige
// el día de rutina que le conviene en vez de la "siguiente" en la fila).

import { Check } from 'lucide-react';
import { diasDeLaSemana, nombreDeSesion, sesionesDelPlan, type Progreso } from '@/lib/routine';

const LETRAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function SelectorDiaRutina({
  progreso,
  elegida,
  indiceActual,
  bloqueado,
  onElegir,
}: {
  progreso: Progreso;
  /** Índice elegido a mano (null = la siguiente del plan). */
  elegida: number | null;
  /** Índice de la sesión que se hará hoy (elegida o la siguiente). */
  indiceActual: number;
  /** Ya empezó a registrar hoy: cambiar de rutina mezclaría dos entrenamientos. */
  bloqueado: boolean;
  onElegir: (indice: number) => void;
}) {
  const semana = diasDeLaSemana(progreso);
  const ciclo = sesionesDelPlan(progreso.diasSemana);

  return (
    <div className="w-full text-left">
      <div className="flex justify-between gap-1" role="list" aria-label="Semana en curso">
        {semana.map((d, i) => (
          <div
            key={d.fecha}
            role="listitem"
            aria-current={d.esHoy ? 'date' : undefined}
            aria-label={`${d.fecha}${d.esHoy ? ', hoy' : ''}${d.entrenado ? ', entrenado' : ''}`}
            className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center rounded-xl border ${
              d.esHoy
                ? 'boton-3d border-transparent bg-[var(--accent)] text-[var(--bg)]'
                : 'border-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)] bg-[var(--surface)] text-[var(--text-secondary)]'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase">{LETRAS[i]}</span>
            <span className="text-base font-bold tabular-nums">{Number(d.fecha.slice(8))}</span>
            <span
              aria-hidden="true"
              className={`mt-0.5 size-1.5 rounded-full ${
                d.entrenado ? (d.esHoy ? 'bg-[var(--bg)]' : 'bg-[var(--accent)]') : 'bg-transparent'
              }`}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">Rutina de hoy</p>
      <div className="mt-2 flex flex-col gap-2">
        {ciclo.map((sesion, i) => {
          const activa = i === indiceActual;
          return (
            <button
              key={`${sesion}-${i}`}
              type="button"
              disabled={bloqueado && !activa}
              aria-pressed={activa}
              onClick={() => onElegir(i)}
              className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left text-sm font-semibold disabled:opacity-40 ${
                activa
                  ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                  : 'border-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)] bg-[var(--surface)] text-[var(--text-secondary)]'
              }`}
            >
              <span className="min-w-0">
                <span className="mr-2 text-xs font-medium text-[var(--text-tertiary)]">Día {i + 1}</span>
                {nombreDeSesion(sesion)}
              </span>
              {activa && <Check size={16} color="var(--accent)" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {bloqueado ? (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">Ya empezaste el entrenamiento de hoy: termínalo para cambiar de rutina.</p>
      ) : elegida === null ? (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">Sugerida según lo que llevas de la semana. Toca otra para cambiarla.</p>
      ) : null}
    </div>
  );
}
