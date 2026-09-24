'use client';

// EVOLUCIÓN — segunda mitad de la pantalla Progreso (antes vivía en Historial):
// tu progreso real según la meta (peso corporal o cintura), el volumen de tus
// últimas sesiones y, en Ruta Intermedio, la analítica avanzada. El día a día
// (qué hiciste cada fecha) vive en el calendario de la misma pantalla.
// Sesión 7 (auditoría, hallazgo #2): antes era una lista plana sin gráfico ni
// insight — ahora tiene un dato héroe (volumen) + un gráfico de área animado
// (serie temporal, ver 17-VISUALIZACION-DATOS) + insight interpretado.

import Link from 'next/link';
import { useMemo } from 'react';
import { useReducedMotion } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Award, History, TrendingDown, TrendingUp } from 'lucide-react';
import type { Meta } from '@/lib/onboarding';
import type { Progreso, RegistroLog } from '@/lib/routine';
import { progresionPorEjercicio, recordMasReciente, volumenPorGrupoMuscular } from '@/lib/analiticaAvanzada';
import { useConteo } from '@/lib/useConteo';

const NUM = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

function volumenDe(log: RegistroLog): number {
  return log.peso * log.reps * log.series;
}

function TooltipVolumen({
  active,
  payload,
  unidad,
}: {
  active?: boolean;
  payload?: { payload: { etiqueta: string; volumen: number } }[];
  unidad: 'kg' | 'lb';
}) {
  if (!active || !payload?.length) return null;
  const punto = payload[0].payload;
  return (
    <div className="rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-3 py-2 shadow-[var(--shadow-1)]">
      <p className="text-xs text-[var(--text-secondary)]">{punto.etiqueta}</p>
      <p className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
        {NUM.format(punto.volumen)} {unidad}
      </p>
    </div>
  );
}

export function Evolucion({ progreso }: { progreso: Progreso }) {
  const reduce = useReducedMotion();

  // Serie temporal para el gráfico: una sesión por fecha, volumen = Σ peso×reps×series
  // del día. Orden CRONOLÓGICO (viejo → nuevo) para que el área se dibuje de
  // izquierda a derecha con sentido.
  const sesiones = useMemo(() => {
    const porFecha = new Map<string, number>();
    for (const log of progreso.logs) porFecha.set(log.fecha, (porFecha.get(log.fecha) ?? 0) + volumenDe(log));
    return Array.from(porFecha.entries())
      .map(([fecha, volumen]) => ({
        fecha,
        etiqueta: new Date(fecha + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        volumen,
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-7); // máximo 7 puntos visibles en móvil (17-VISUALIZACION-DATOS)
  }, [progreso.logs]);

  const volumenSemana = sesiones.reduce((acc, s) => acc + s.volumen, 0);
  const sesionAnterior = sesiones.length >= 2 ? sesiones[sesiones.length - 2].volumen : null;
  const ultimaSesion = sesiones.length >= 1 ? sesiones[sesiones.length - 1].volumen : null;
  const cambioPct =
    sesionAnterior && sesionAnterior > 0 && ultimaSesion !== null
      ? Math.round(((ultimaSesion - sesionAnterior) / sesionAnterior) * 100)
      : null;

  const volumenMostrado = useConteo(volumenSemana);

  return (
    <div>
      {/* El progreso se ve DISTINTO según la ruta (pedido explícito): Ruta A
          compara el peso corporal contra el inicial (sube = éxito); Ruta B
          compara la cintura (el objetivo ahí es MANTENER las cargas, no
          subirlas). Vive siempre, incluso sin series registradas todavía. */}
      <TarjetaProgreso progreso={progreso} meta={progreso.meta} />

      {sesiones.length === 0 ? (
        <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--surface)] p-6 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <History size={28} color="var(--accent)" />
          </span>
          <p className="mt-4 max-w-xs text-base text-[var(--text-secondary)]">
            Todavía no registras ningún peso. En cuanto termines tu primer ejercicio, aparece aquí.
          </p>
          <Link
            href="/app"
            className="boton-3d mt-6 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
          >
            Ir a mi plan de hoy
          </Link>
        </div>
      ) : (
        <>
          {/* Dato héroe + gráfico — un objeto principal, con su insight (17-VISUALIZACION-DATOS) */}
          <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
              Volumen de tus últimas {sesiones.length} sesiones
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
              {NUM.format(Math.round(volumenMostrado))} <span className="text-lg font-semibold text-[var(--text-secondary)]">{progreso.unidadPeso}</span>
            </p>
            <p className="mt-1.5 text-sm font-medium text-[var(--text-secondary)]">
              {cambioPct === null
                ? 'Sigue registrando: la comparación aparece desde tu segunda sesión.'
                : cambioPct >= 0
                  ? `↑ ${cambioPct}% vs tu sesión anterior — vas para arriba.`
                  : `↓ ${Math.abs(cambioPct)}% vs tu sesión anterior.`}
            </p>

            <div className="mt-4 -mx-1 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sesiones} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                  <defs>
                    <linearGradient id="volumenFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="etiqueta" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} />
                  <Tooltip content={<TooltipVolumen unidad={progreso.unidadPeso} />} cursor={{ stroke: 'var(--accent)', strokeOpacity: 0.2 }} />
                  <Area
                    type="monotone"
                    dataKey="volumen"
                    stroke="var(--accent)"
                    strokeWidth={2.5}
                    fill="url(#volumenFill)"
                    dot={{ r: 3, fill: 'var(--accent)', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={!reduce}
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Alternativa accesible — mismos datos en tabla, para lectores de pantalla */}
            <table className="sr-only">
              <caption>Volumen de entrenamiento por sesión</caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Volumen ({progreso.unidadPeso})</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((s) => (
                  <tr key={s.fecha}>
                    <th scope="row">{s.etiqueta}</th>
                    <td>{s.volumen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Opción B de "sentir la diferencia entre niveles" (15/09/2026,
              ver ESTADO.md): solo Ruta Intermedio ve esta sección — un
              principiante se motiva con la racha, no con datos. */}
          {progreso.nivel === 'intermedio' && <ProgresoAvanzado logs={progreso.logs} unidadPeso={progreso.unidadPeso} />}
        </>
      )}
    </div>
  );
}

/** Analítica avanzada de Ruta Intermedio — ver lib/analiticaAvanzada.ts. Se
 * calcula con TODOS los logs (no solo los últimos 7 días como el gráfico de
 * arriba): el volumen por músculo sí se acota a la semana adentro de
 * `volumenPorGrupoMuscular`, pero la progresión de fuerza necesita ver desde
 * el primer registro para tener un "antes" real con el que comparar. */
function ProgresoAvanzado({ logs, unidadPeso }: { logs: RegistroLog[]; unidadPeso: 'kg' | 'lb' }) {
  const volumenGrupos = useMemo(() => volumenPorGrupoMuscular(logs), [logs]);
  const progresiones = useMemo(() => progresionPorEjercicio(logs), [logs]);
  const record = useMemo(() => recordMasReciente(progresiones), [progresiones]);
  const maxVolumen = volumenGrupos[0]?.volumen ?? 0;

  if (volumenGrupos.length === 0 && progresiones.length === 0) return null;

  return (
    <div className="mt-8 flex flex-col gap-5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu progreso avanzado</p>

      {record && (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--chip-bg)] p-4">
          <div className="flex items-center gap-2">
            <Award size={18} color="var(--accent)" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Nueva marca en {record.nombre}</p>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Tu fuerza estimada llegó a {record.e1rmActual}
            {unidadPeso} — la mejor que has registrado en este ejercicio.
          </p>
        </div>
      )}

      {volumenGrupos.length > 0 && (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Qué trabajaste más esta semana</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {volumenGrupos.slice(0, 6).map((g) => (
              <div key={g.grupo}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-primary)]">{g.etiqueta}</span>
                  <span className="text-xs tabular-nums text-[var(--text-secondary)]">
                    {new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(g.volumen)} {unidadPeso}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--chip-bg)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${maxVolumen > 0 ? Math.max(4, Math.round((g.volumen / maxVolumen) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {progresiones.length > 0 && (
        <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Progresión de fuerza estimada</p>
          <div className="mt-3 flex flex-col gap-3">
            {progresiones.map((p) => (
              <div key={p.ejercicioId} className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-primary)]">{p.nombre}</span>
                <div className="flex items-center gap-1.5">
                  {p.deltaPct !== null && p.deltaPct !== 0 && (
                    p.deltaPct > 0 ? <TrendingUp size={14} color="var(--accent)" /> : <TrendingDown size={14} color="var(--status-warning)" />
                  )}
                  <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                    {p.e1rmActual}
                    {unidadPeso}
                  </span>
                  {p.deltaPct !== null && (
                    <span className="text-xs tabular-nums text-[var(--text-tertiary)]">
                      ({p.deltaPct >= 0 ? '+' : ''}
                      {p.deltaPct}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            Fuerza estimada = el peso máximo que podrías levantar 1 vez, calculado desde tus series reales — no hace falta probarlo de verdad.
          </p>
        </div>
      )}
    </div>
  );
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso + 'T00:00:00');
  return fecha.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Progreso real, distinto por ruta — nunca un número inventado: si el
 * usuario no ha registrado la medida relevante todavía (o solo la puso una
 * vez, sin nada con qué compararla), se lo dice tal cual en vez de mostrar
 * un 0 que parezca un dato real. */
function TarjetaProgreso({ progreso, meta }: { progreso: Progreso; meta: Meta }) {
  // Ruta A y Ruta B despachan a un componente propio cada una (no una rama
  // if/else dentro de la MISMA función) para que useConteo() de cada delta
  // se llame siempre igual — si `meta` cambia entre renders, alternar la
  // rama aquí adentro habría cambiado el orden de hooks (regla de hooks).
  return meta === 'musculo' ? (
    <TarjetaProgresoMusculo progreso={progreso} />
  ) : (
    <TarjetaProgresoCintura progreso={progreso} />
  );
}

function TarjetaProgresoMusculo({ progreso }: { progreso: Progreso }) {
  const desde = progreso.fechaInicioMedidas ? ` desde el ${formatearFecha(progreso.fechaInicioMedidas)}` : '';
  const hayDato = progreso.pesoInicialKg !== null && progreso.pesoKg !== null;
  const deltaKg = hayDato ? Math.round((progreso.pesoKg! - progreso.pesoInicialKg!) * 10) / 10 : null;
  const deltaKgMostrado = useConteo(deltaKg ?? 0);
  return (
    <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu progreso · Ganar músculo</p>
      {deltaKg === null ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Registra tu peso en Perfil — la próxima vez que lo actualices, vas a ver aquí cuánto cambió.
        </p>
      ) : (
        <>
          <div className="mt-1 flex items-center gap-2">
            {deltaKg >= 0 ? <TrendingUp size={20} color="var(--accent)" /> : <TrendingDown size={20} color="var(--status-warning)" />}
            <p className="text-3xl font-bold tabular-nums leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
              {deltaKg >= 0 ? '+' : ''}
              {Math.round(deltaKgMostrado * 10) / 10} kg
            </p>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            de peso corporal{desde}. Subir entre 300 y 800 g al mes es un buen ritmo. Cuando completes tus series con buena técnica, sube un poco el peso que levantas.
          </p>
        </>
      )}
    </div>
  );
}

function TarjetaProgresoCintura({ progreso }: { progreso: Progreso }) {
  const desde = progreso.fechaInicioMedidas ? ` desde el ${formatearFecha(progreso.fechaInicioMedidas)}` : '';
  const hayDato = progreso.cinturaInicialCm !== null && progreso.cinturaCm !== null;
  const deltaCm = hayDato ? Math.round((progreso.cinturaCm! - progreso.cinturaInicialCm!) * 10) / 10 : null;
  const deltaCmMostrado = useConteo(deltaCm ?? 0);
  return (
    <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu progreso · Bajar grasa</p>
      {deltaCm === null ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Anota la medida de tu cintura en Perfil. Es la mejor forma de ver que estás bajando grasa.
        </p>
      ) : (
        <>
          <div className="mt-1 flex items-center gap-2">
            {deltaCm <= 0 ? <TrendingDown size={20} color="var(--accent)" /> : <TrendingUp size={20} color="var(--status-warning)" />}
            <p className="text-3xl font-bold tabular-nums leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
              {deltaCm > 0 ? '+' : ''}
              {Math.round(deltaCmMostrado * 10) / 10} cm
            </p>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            {deltaCm === 0
              ? `de cambio en tu cintura${desde}. Todavía no hay diferencia: mídete de nuevo en un par de semanas.`
              : deltaCm < 0
                ? `menos en tu cintura${desde}. ¡Vas bajando grasa!`
                : `más en tu cintura${desde}. Tranquilo: sigue entrenando y cuidando la comida, y mídete de nuevo en unas semanas.`}
            {' '}Sigue levantando el mismo peso: así conservas tu músculo mientras baja la grasa.
          </p>
        </>
      )}
    </div>
  );
}
