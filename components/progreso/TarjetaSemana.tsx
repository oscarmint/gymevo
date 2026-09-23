'use client';

// La semana de entrenamiento de un vistazo: cuántos días de su meta ya cumplió
// y su racha en semanas. Va arriba de la pantalla Progreso para que el
// calendario y la evolución se lean siempre contra la meta.

import { Flame } from 'lucide-react';
import { resumenSemana, semanasSeguidas, type Progreso } from '@/lib/routine';

export function TarjetaSemana({ progreso }: { progreso: Progreso }) {
  const semana = resumenSemana(progreso);
  const semanas = semanasSeguidas(progreso);
  const cumplida = semana.faltan === 0;

  return (
    <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)] p-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Esta semana</p>
        <p className="mt-1 text-2xl font-bold tabular-nums leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
          {semana.hechos} <span className="text-base font-semibold text-[var(--text-secondary)]">de {semana.meta}</span>
        </p>
        <div className="mt-2 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: semana.meta }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i < semana.hechos ? 'bg-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)]'}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          {cumplida ? '¡Meta de la semana cumplida!' : `Te ${semana.faltan === 1 ? 'falta 1 día' : `faltan ${semana.faltan} días`} para tu meta.`}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-[var(--surface)]">
          <Flame size={22} color="var(--accent)" fill={semanas > 0 ? 'var(--accent)' : 'none'} />
        </span>
        <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--text-primary)]">
          {semanas} {semanas === 1 ? 'semana' : 'semanas'}
        </p>
        <p className="text-xs text-[var(--text-tertiary)]">de racha</p>
      </div>
    </div>
  );
}
