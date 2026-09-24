'use client';

// Cuadrícula del mes: cada día pintado según cuánto de su rutina se hizo
// (lib/calendario.ts). Tocar un día lo selecciona — su detalle aparece justo
// debajo, en la misma pantalla (antes abría otra página).

import { ChevronLeft, ChevronRight, Dumbbell, Moon } from 'lucide-react';
import { huecosIniciales, type EstadoDia, type InfoDia } from '@/lib/calendario';

const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const ESTILO_DIA: Record<EstadoDia, string> = {
  verde:
    'border-[color-mix(in_oklab,var(--status-success)_60%,transparent)] bg-[color-mix(in_oklab,var(--status-success)_26%,transparent)] text-[var(--text-primary)]',
  amarillo:
    'border-[color-mix(in_oklab,var(--status-warning)_60%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_26%,transparent)] text-[var(--text-primary)]',
  descanso:
    'border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] text-[var(--text-secondary)]',
  hoy_pendiente: 'border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] text-[var(--text-primary)]',
  futuro: 'border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] text-[var(--text-tertiary)]',
  sin_datos: 'border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] text-[var(--text-tertiary)]',
};

const ESTILO_DISPONIBLE =
  'border-[color-mix(in_oklab,var(--accent)_70%,transparent)] bg-[var(--chip-bg)] text-[var(--text-primary)]';

const ETIQUETA: Record<EstadoDia, string> = {
  verde: 'entrenamiento completo',
  amarillo: 'entrenamiento parcial',
  descanso: 'día libre',
  hoy_pendiente: 'hoy, aún sin entrenar',
  futuro: 'todavía no llega',
  sin_datos: 'sin registros',
};

export function nombreMes(anio: number, mes0: number): string {
  const t = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date(anio, mes0, 1));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function Punto({ clase }: { clase: string }) {
  return <span aria-hidden="true" className={`inline-block size-3 rounded-full border ${clase}`} />;
}

export function CalendarioMes({
  dias,
  anio,
  mes0,
  hoy,
  seleccionada,
  esMesActual,
  disponibles,
  onSeleccionar,
  onMoverMes,
}: {
  dias: InfoDia[];
  anio: number;
  mes0: number;
  hoy: string;
  seleccionada: string;
  esMesActual: boolean;
  /** Fechas de esta semana con una rutina del plan aún por hacer (fecha → nº de día del plan). */
  disponibles: Record<string, number>;
  onSeleccionar: (fecha: string) => void;
  onMoverMes: (delta: number) => void;
}) {
  const huecos = huecosIniciales(anio, mes0);
  return (
    <div>
      <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onMoverMes(-1)}
            aria-label="Mes anterior"
            className="flex size-11 items-center justify-center rounded-xl text-[var(--text-secondary)]"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="text-base font-semibold text-[var(--text-primary)]" aria-live="polite">
            {nombreMes(anio, mes0)}
          </p>
          <button
            type="button"
            onClick={() => onMoverMes(1)}
            disabled={esMesActual}
            aria-label="Mes siguiente"
            className="flex size-11 items-center justify-center rounded-xl text-[var(--text-secondary)] disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-[var(--text-tertiary)]">
          {SEMANA.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {Array.from({ length: huecos }).map((_, i) => (
            <span key={`h${i}`} aria-hidden="true" />
          ))}
          {dias.map((d) => {
            const numero = Number(d.fecha.slice(8, 10));
            const esHoy = d.fecha === hoy;
            const activa = d.fecha === seleccionada;
            const dia = disponibles[d.fecha];
            const disponible = dia !== undefined && d.estado !== 'verde' && d.estado !== 'amarillo';
            const clase = `relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold tabular-nums ${disponible ? ESTILO_DISPONIBLE : ESTILO_DIA[d.estado]} ${
              activa ? 'outline outline-2 outline-offset-1 outline-[var(--accent)]' : ''
            }`;
            const etiqueta = `${numero} de ${nombreMes(anio, mes0).split(' ')[0].toLowerCase()}${
              d.porcentaje !== null ? `, ${d.porcentaje}%` : ''
            }, ${disponible ? `rutina del día ${dia} disponible` : ETIQUETA[d.estado]}${esHoy ? ', hoy' : ''}`;
            const contenido = (
              <>
                {numero}
                {esHoy && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-[var(--accent)]" />}
                {disponible && <Dumbbell size={10} aria-hidden="true" className="absolute bottom-1 text-[var(--accent)]" />}
                {d.estado === 'descanso' && !disponible && <Moon size={10} aria-hidden="true" className="absolute bottom-1" />}
              </>
            );
            if (d.estado === 'futuro' || d.estado === 'sin_datos') {
              return (
                <span key={d.fecha} className={clase} aria-label={etiqueta}>
                  {contenido}
                </span>
              );
            }
            return (
              <button key={d.fecha} type="button" onClick={() => onSeleccionar(d.fecha)} className={clase} aria-label={etiqueta} aria-pressed={activa}>
                {contenido}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-3 grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-[var(--text-secondary)]">
        <li className="flex items-center gap-1.5">
          <Punto clase={ESTILO_DIA.verde} /> 80% o más
        </li>
        <li className="flex items-center gap-1.5">
          <Punto clase={ESTILO_DIA.amarillo} /> Parcial
        </li>
        <li className="flex items-center gap-1.5">
          <Punto clase={ESTILO_DIA.descanso} /> Día libre
        </li>
        <li className="flex items-center gap-1.5">
          <Punto clase={ESTILO_DISPONIBLE} /> Rutina disponible
        </li>
      </ul>
    </div>
  );
}
