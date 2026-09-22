'use client';

// RESUMEN DEL DÍA (21/09/2026) — lo que se abre al tocar un día del calendario:
// estado (completo / parcial / sin entrenar / descanso), series hechas contra
// las que tocaban, y cada serie registrada con su peso y repeticiones.

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { CalendarX2, ChevronLeft, Dumbbell, Moon } from 'lucide-react';
import { infoDelDia, type EstadoDia } from '@/lib/calendario';
import { hoyISO } from '@/lib/routine';
import { useProgresoCalendario } from '@/lib/useProgresoCalendario';

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

const TITULO: Record<EstadoDia, string> = {
  verde: 'Entrenamiento completo',
  amarillo: 'Entrenamiento parcial',
  rojo: 'No entrenaste este día',
  descanso: 'Día de descanso recomendado',
  hoy_pendiente: 'Hoy todavía no entrenas',
  futuro: 'Este día aún no llega',
  sin_datos: 'Sin registros de este día',
};

const COLOR: Record<EstadoDia, string> = {
  verde: 'var(--status-success)',
  amarillo: 'var(--status-warning)',
  rojo: 'var(--status-error)',
  descanso: 'var(--text-tertiary)',
  hoy_pendiente: 'var(--accent)',
  futuro: 'var(--text-tertiary)',
  sin_datos: 'var(--text-tertiary)',
};

function etiquetaRir(rir: number): string {
  if (rir >= 3) return 'Fácil';
  if (rir === 2) return 'Normal';
  if (rir === 1) return 'Duro';
  return 'Al fallo';
}

function fechaLarga(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const t = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function ResumenDiaPage() {
  const params = useParams<{ fecha: string }>();
  const fecha = params.fecha;
  const progreso = useProgresoCalendario();
  const hoy = hoyISO();

  const info = useMemo(
    () => (progreso && FECHA_VALIDA.test(fecha) ? infoDelDia(progreso, fecha, hoy) : null),
    [progreso, fecha, hoy],
  );

  const volver = (
    <Link href="/app/calendario" className="-ml-2 flex h-11 w-fit items-center gap-1 px-2 text-sm font-semibold text-[var(--text-secondary)]">
      <ChevronLeft size={18} /> Calendario
    </Link>
  );

  if (!FECHA_VALIDA.test(fecha)) {
    return (
      <div className="px-5 pt-4">
        {volver}
        <p className="mt-6 text-sm text-[var(--text-secondary)]">Esa fecha no es válida.</p>
      </div>
    );
  }

  const unidad = progreso?.unidadPeso ?? 'lb';
  const esHoyOPasado = fecha <= hoy;

  return (
    <div className="px-5 pt-4">
      {volver}
      <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{fechaLarga(fecha)}</h1>

      {info && (
        <>
          <div
            className="mt-4 rounded-2xl border bg-[var(--surface)] p-5"
            style={{ borderColor: `color-mix(in oklab, ${COLOR[info.estado]} 55%, transparent)` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `color-mix(in oklab, ${COLOR[info.estado]} 20%, transparent)` }}
              >
                {info.estado === 'descanso' ? (
                  <Moon size={20} color={COLOR[info.estado]} />
                ) : info.estado === 'rojo' || info.estado === 'sin_datos' || info.estado === 'futuro' ? (
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
                  <p className="text-3xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                    {info.porcentaje}%
                  </p>
                  <p className="text-sm tabular-nums text-[var(--text-secondary)]">
                    {info.seriesHechas} de {info.seriesPlan} series
                  </p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]">
                  <div className="h-full rounded-full" style={{ width: `${info.porcentaje}%`, backgroundColor: COLOR[info.estado] }} />
                </div>
              </div>
            )}

            {info.estado === 'rojo' && (
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                No hay series registradas este día. Lo importante es retomar: tu plan de hoy te espera.
              </p>
            )}
            {info.estado === 'descanso' && (
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Tu plan no tenía entrenamiento este día — el descanso también es parte del plan: ahí es donde el músculo se recupera.
              </p>
            )}
            {info.estado === 'sin_datos' && (
              <p className="mt-3 text-sm text-[var(--text-secondary)]">Es anterior a tu primer entrenamiento registrado.</p>
            )}
            {info.estado === 'futuro' && <p className="mt-3 text-sm text-[var(--text-secondary)]">Cuando llegue, aquí verás cómo te fue.</p>}
          </div>

          {info.ejercicios.length > 0 && (
            <ul className="mt-4 flex flex-col gap-3">
              {info.ejercicios.map((e) => (
                <li
                  key={e.nombre}
                  className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
                >
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

          {esHoyOPasado && (info.estado === 'hoy_pendiente' || info.estado === 'amarillo' || (info.estado === 'rojo' && fecha === hoy)) && (
            <Link
              href="/app"
              className="boton-3d mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
            >
              {info.estado === 'amarillo' ? 'Seguir con mi plan' : 'Ir al plan de hoy'}
            </Link>
          )}
        </>
      )}
    </div>
  );
}
