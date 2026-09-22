'use client';

// CALENDARIO (21/09/2026) — cada día del mes pintado según cuánto de su rutina
// se hizo: rojo (no entrenó), amarillo (menos del 80%), verde (80% o más).
// Tocar un día abre su resumen (/app/calendario/[fecha]). La lógica vive en
// lib/calendario.ts; aquí solo se dibuja.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import { diasDelMes, huecosIniciales, resumenDelMes, type EstadoDia } from '@/lib/calendario';
import { hoyISO } from '@/lib/routine';
import { useProgresoCalendario } from '@/lib/useProgresoCalendario';

const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const ESTILO: Record<EstadoDia, string> = {
  verde:
    'border-[color-mix(in_oklab,var(--status-success)_60%,transparent)] bg-[color-mix(in_oklab,var(--status-success)_26%,transparent)] text-[var(--text-primary)]',
  amarillo:
    'border-[color-mix(in_oklab,var(--status-warning)_60%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_26%,transparent)] text-[var(--text-primary)]',
  rojo:
    'border-[color-mix(in_oklab,var(--status-error)_60%,transparent)] bg-[color-mix(in_oklab,var(--status-error)_24%,transparent)] text-[var(--text-primary)]',
  descanso:
    'border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_45%,transparent)] bg-[var(--surface)] text-[var(--text-secondary)]',
  hoy_pendiente: 'border-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)] bg-[var(--surface)] text-[var(--text-primary)]',
  futuro: 'border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] text-[var(--text-tertiary)]',
  sin_datos: 'border-[color-mix(in_oklab,var(--text-tertiary)_16%,transparent)] bg-[var(--surface)] text-[var(--text-tertiary)]',
};

const ETIQUETA: Record<EstadoDia, string> = {
  verde: 'entrenamiento completo',
  amarillo: 'entrenamiento parcial',
  rojo: 'sin entrenar',
  descanso: 'día de descanso recomendado',
  hoy_pendiente: 'hoy, aún sin entrenar',
  futuro: 'todavía no llega',
  sin_datos: 'sin registros',
};

function nombreMes(anio: number, mes0: number): string {
  const t = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date(anio, mes0, 1));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function Punto({ clase }: { clase: string }) {
  return <span aria-hidden="true" className={`inline-block size-3 rounded-full border ${clase}`} />;
}

export default function CalendarioPage() {
  const progreso = useProgresoCalendario();
  const hoy = hoyISO();
  const [anioHoy, mesHoy] = [Number(hoy.slice(0, 4)), Number(hoy.slice(5, 7)) - 1];
  const [vista, setVista] = useState<{ anio: number; mes0: number }>({ anio: anioHoy, mes0: mesHoy });

  const dias = useMemo(() => (progreso ? diasDelMes(progreso, vista.anio, vista.mes0, hoy) : []), [progreso, vista, hoy]);
  const resumen = useMemo(() => resumenDelMes(dias), [dias]);
  const huecos = huecosIniciales(vista.anio, vista.mes0);
  const esMesActual = vista.anio === anioHoy && vista.mes0 === mesHoy;
  const sinRegistros = progreso !== null && progreso.logs.length === 0;

  function moverMes(delta: number) {
    setVista((v) => {
      const f = new Date(v.anio, v.mes0 + delta, 1);
      return { anio: f.getFullYear(), mes0: f.getMonth() };
    });
  }

  return (
    <div className="px-5 pt-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Calendario</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Toca un día para ver su resumen.</p>

      <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => moverMes(-1)}
            aria-label="Mes anterior"
            className="flex size-11 items-center justify-center rounded-xl text-[var(--text-secondary)]"
          >
            <ChevronLeft size={20} />
          </button>
          <p className="text-base font-semibold text-[var(--text-primary)]" aria-live="polite">
            {nombreMes(vista.anio, vista.mes0)}
          </p>
          <button
            type="button"
            onClick={() => moverMes(1)}
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
            const clase = `relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm font-semibold tabular-nums ${ESTILO[d.estado]} ${
              esHoy ? 'outline outline-2 outline-offset-1 outline-[var(--accent)]' : ''
            }`;
            const etiqueta = `${numero} de ${nombreMes(vista.anio, vista.mes0).split(' ')[0].toLowerCase()}${
              d.porcentaje !== null ? `, ${d.porcentaje}%` : ''
            }, ${ETIQUETA[d.estado]}`;
            const contenido = (
              <>
                {numero}
                {d.estado === 'descanso' && <Moon size={10} aria-hidden="true" className="absolute bottom-1" />}
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
              <Link key={d.fecha} href={`/app/calendario/${d.fecha}`} className={clase} aria-label={etiqueta}>
                {contenido}
              </Link>
            );
          })}
        </div>
      </div>

      {sinRegistros ? (
        <p className="mt-4 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)]">
          Aún no hay entrenamientos registrados. Cuando registres tu primera serie, tus días empiezan a pintarse aquí.
        </p>
      ) : (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">Este mes:</span> {resumen.verdes}{' '}
          {resumen.verdes === 1 ? 'día completo' : 'días completos'} · {resumen.amarillos}{' '}
          {resumen.amarillos === 1 ? 'parcial' : 'parciales'} · {resumen.rojos}{' '}
          sin entrenar
        </p>
      )}

      <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-[var(--text-secondary)]">
        <li className="flex items-center gap-2">
          <Punto clase={ESTILO.verde} /> 80% o más de la rutina
        </li>
        <li className="flex items-center gap-2">
          <Punto clase={ESTILO.amarillo} /> Menos del 80%
        </li>
        <li className="flex items-center gap-2">
          <Punto clase={ESTILO.rojo} /> No entrenaste
        </li>
        <li className="flex items-center gap-2">
          <Punto clase={ESTILO.descanso} /> Día de descanso recomendado
        </li>
      </ul>
    </div>
  );
}
