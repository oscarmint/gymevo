'use client';

// Lo que hiciste (o no) un día concreto: estado, series hechas contra las que
// tocaban y cada serie registrada con su peso y repeticiones. Reemplaza al
// listado cronológico del antiguo Historial y a la página aparte del calendario.

import Link from 'next/link';
import { CalendarX2, Dumbbell, Moon } from 'lucide-react';
import { infoDelDia, type EstadoDia } from '@/lib/calendario';
import type { Progreso } from '@/lib/routine';

const TITULO: Record<EstadoDia, string> = {
  verde: 'Entrenamiento completo',
  amarillo: 'Entrenamiento parcial',
  descanso: 'Día libre',
  hoy_pendiente: 'Hoy todavía no entrenas',
  futuro: 'Este día aún no llega',
  sin_datos: 'Sin registros de este día',
};

const COLOR: Record<EstadoDia, string> = {
  verde: 'var(--status-success)',
  amarillo: 'var(--status-warning)',
  descanso: 'var(--text-tertiary)',
  hoy_pendiente: 'var(--accent)',
  futuro: 'var(--text-tertiary)',
  sin_datos: 'var(--text-tertiary)',
};

function etiquetaRir(rir: number): string {
  if (rir >= 3) return 'Ligera';
  if (rir === 2) return 'Buena';
  if (rir === 1) return 'Pesada';
  return 'Al límite';
}

function fechaLarga(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const t = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function DetalleDia({
  progreso,
  fecha,
  hoy,
  rutina,
  bloqueada,
  onHacerRutina,
}: {
  progreso: Progreso;
  fecha: string;
  hoy: string;
  /** Rutina del plan disponible en este día de la semana (null = ninguna). */
  rutina: { dia: number; nombre: string } | null;
  /** Ya empezó a entrenar hoy: no puede cambiar de rutina. */
  bloqueada: boolean;
  onHacerRutina: () => void;
}) {
  const info = infoDelDia(progreso, fecha, hoy);
  const unidad = progreso.unidadPeso;

  return (
    <section aria-label={`Detalle de ${fechaLarga(fecha)}`}>
      <h2 className="text-lg font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{fechaLarga(fecha)}</h2>

      <div className="mt-3 rounded-2xl border bg-[var(--surface)] p-5" style={{ borderColor: `color-mix(in oklab, ${COLOR[info.estado]} 55%, transparent)` }}>
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `color-mix(in oklab, ${COLOR[info.estado]} 20%, transparent)` }}
          >
            {info.estado === 'descanso' ? (
              <Moon size={20} color={COLOR[info.estado]} />
            ) : info.estado === 'sin_datos' || info.estado === 'futuro' ? (
              <CalendarX2 size={20} color={COLOR[info.estado]} />
            ) : (
              <Dumbbell size={20} color={COLOR[info.estado]} />
            )}
          </span>
          <div className="min-w-0">
            <p className="text-base font-semibold text-[var(--text-primary)]">{TITULO[info.estado]}</p>
            {info.nombreRutina && <p className="text-sm text-[var(--text-secondary)]">{info.nombreRutina}</p>}
          </div>
        </div>

        {info.porcentaje !== null && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{info.porcentaje}%</p>
              <p className="text-sm tabular-nums text-[var(--text-secondary)]">
                {info.seriesHechas} de {info.seriesPlan} series
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]">
              <div className="h-full rounded-full" style={{ width: `${info.porcentaje}%`, backgroundColor: COLOR[info.estado] }} />
            </div>
          </div>
        )}

        {info.estado === 'descanso' && (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            No registraste series este día. Entrenas los días que puedes — el descanso también es parte del plan: ahí es donde el músculo se recupera.
          </p>
        )}
        {info.estado === 'sin_datos' && <p className="mt-3 text-sm text-[var(--text-secondary)]">Es anterior a tu primer entrenamiento registrado.</p>}
        {info.estado === 'futuro' && <p className="mt-3 text-sm text-[var(--text-secondary)]">Cuando llegue, aquí verás cómo te fue.</p>}
      </div>

      {rutina && (
        <div className="mt-3 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[var(--chip-bg)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">Rutina disponible · Día {rutina.dia}</p>
          <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">{rutina.nombre}</p>
          {bloqueada ? (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Ya empezaste el entrenamiento de hoy: termínalo para elegir otra rutina.</p>
          ) : (
            <>
              <button
                type="button"
                onClick={onHacerRutina}
                className="boton-3d mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
              >
                Hacer esta rutina hoy
              </button>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Una vez que la hagas, no volverá a estar disponible esta semana.</p>
            </>
          )}
        </div>
      )}

      {info.ejercicios.length > 0 && (
        <ul className="mt-4 flex flex-col gap-3">
          {info.ejercicios.map((e) => (
            <li key={e.nombre} className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-base font-semibold text-[var(--text-primary)]">{e.nombre}</p>
                <p className="shrink-0 text-xs tabular-nums text-[var(--text-secondary)]">
                  {e.seriesHechas}
                  {e.seriesPlan !== null ? ` de ${e.seriesPlan}` : ''} series
                </p>
              </div>
              <ol className="mt-2 flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                {e.series.map((s, i) => (
                  <li key={i} className="flex items-center justify-between tabular-nums">
                    <span>Serie {i + 1}</span>
                    <span className="text-[var(--text-primary)]">
                      {s.peso > 0 ? `${s.peso} ${unidad} × ` : ''}
                      {s.reps} reps
                      {s.rir !== undefined && <span className="text-[var(--text-secondary)]"> · {etiquetaRir(s.rir)}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}

      {fecha <= hoy && (info.estado === 'hoy_pendiente' || info.estado === 'amarillo') && (
        <Link
          href="/app"
          className="boton-3d mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
        >
          {info.estado === 'amarillo' ? 'Seguir con mi plan' : 'Ir al plan de hoy'}
        </Link>
      )}
    </section>
  );
}
