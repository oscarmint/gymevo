'use client';

// HISTORIAL — registro de pesos/cargas (04-ARQUITECTURA → workout_logs).
// Sesión 7 (auditoría, hallazgo #2): antes era una lista plana sin gráfico ni
// insight — "vacío muerto" según la rúbrica de 17-VISUALIZACION-DATOS. Ahora
// tiene un dato héroe (volumen de la semana) + un gráfico de área animado
// (serie temporal: el tipo correcto para "evolución en el tiempo", ver la
// tabla de esa doctrina) + insight interpretado, con la lista detallada abajo.

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { History, TrendingDown, TrendingUp } from 'lucide-react';
import type { Meta } from '@/lib/onboarding';
import { leerProgreso, obtenerEjercicio, type Progreso, type RegistroLog } from '@/lib/routine';
import { leerProgresoRemoto } from '@/lib/supabase/sync';

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

export default function HistorialPage() {
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const reduce = useReducedMotion();

  // localStorage no existe en el servidor: leerlo en el initializer de
  // useState causa mismatch de hydration. Este efecto es la forma correcta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgreso(leerProgreso());
    // Si hay sesión, el historial remoto (Supabase) manda sobre el local —
    // es el que tiene los registros de todos los dispositivos.
    leerProgresoRemoto().then((remoto) => {
      if (remoto) setProgreso(remoto);
    });
  }, []);

  const porFecha = useMemo(() => {
    const mapa = new Map<string, RegistroLog[]>();
    for (const log of [...(progreso?.logs ?? [])].reverse()) {
      const lista = mapa.get(log.fecha) ?? [];
      lista.push(log);
      mapa.set(log.fecha, lista);
    }
    return mapa;
  }, [progreso]);

  // Serie temporal para el gráfico: una sesión por fecha, volumen = Σ peso×reps×series
  // del día. Orden CRONOLÓGICO (viejo → nuevo) para que el área se dibuje de
  // izquierda a derecha con sentido — la lista de abajo sigue en orden inverso
  // (más reciente arriba), que es lo que se lee al entrar a esta pantalla.
  const sesiones = useMemo(() => {
    return Array.from(porFecha.entries())
      .map(([fecha, logs]) => ({
        fecha,
        etiqueta: new Date(fecha + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' }),
        volumen: logs.reduce((acc, l) => acc + volumenDe(l), 0),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(-7); // máximo 7 puntos visibles en móvil (17-VISUALIZACION-DATOS)
  }, [porFecha]);

  const volumenSemana = sesiones.reduce((acc, s) => acc + s.volumen, 0);
  const sesionAnterior = sesiones.length >= 2 ? sesiones[sesiones.length - 2].volumen : null;
  const ultimaSesion = sesiones.length >= 1 ? sesiones[sesiones.length - 1].volumen : null;
  const cambioPct =
    sesionAnterior && sesionAnterior > 0 && ultimaSesion !== null
      ? Math.round(((ultimaSesion - sesionAnterior) / sesionAnterior) * 100)
      : null;

  if (!progreso) return null;

  return (
    <div className="px-5 pt-6 pb-10">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu progreso</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Historial</h1>

      {/* El progreso se ve DISTINTO según la ruta (pedido explícito): Ruta A
          compara el peso corporal contra el inicial (sube = éxito); Ruta B
          compara la cintura (el objetivo ahí es MANTENER las cargas, no
          subirlas). Vive siempre, incluso sin series registradas todavía. */}
      <TarjetaProgreso progreso={progreso} meta={progreso.meta} />

      {porFecha.size === 0 ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <History size={24} color="var(--accent)" />
          </span>
          <p className="mt-4 max-w-xs text-sm text-[var(--text-secondary)]">
            Todavía no registras ningún peso. En cuanto termines tu primer ejercicio, aparece aquí.
          </p>
          <Link
            href="/app"
            className="boton-3d mt-6 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
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
              {NUM.format(volumenSemana)} <span className="text-lg font-semibold text-[var(--text-secondary)]">{progreso.unidadPeso}</span>
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
                  <XAxis
                    dataKey="etiqueta"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
                  />
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

          {/* Detalle por sesión — más reciente primero. Cada log ahora es UNA
              serie (registro real serie por serie, no un agregado), así que
              se agrupan por ejercicio para mostrar el peso de cada serie. */}
          <div className="mt-6 flex flex-col gap-5">
            {Array.from(porFecha.entries()).map(([fecha, logs]) => {
              const porEjercicio = new Map<string, RegistroLog[]>();
              for (const log of logs) {
                const sets = porEjercicio.get(log.ejercicioId) ?? [];
                sets.push(log);
                porEjercicio.set(log.ejercicioId, sets);
              }
              return (
                <div key={fecha}>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)]">{formatearFecha(fecha)}</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {Array.from(porEjercicio.entries()).map(([ejercicioId, sets]) => {
                      const ej = obtenerEjercicio(ejercicioId);
                      const pesosTexto = sets.map((s) => (s.peso > 0 ? s.peso : '—')).join(' / ');
                      return (
                        <div
                          key={ejercicioId}
                          className="flex items-center justify-between rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
                        >
                          <span className="text-sm font-medium text-[var(--text-primary)]">{ej.nombre}</span>
                          <span className="text-sm tabular-nums text-[var(--text-secondary)]">
                            {sets.length} series · {pesosTexto} {progreso.unidadPeso}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
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
  const desde = progreso.fechaInicioMedidas ? ` desde el ${formatearFecha(progreso.fechaInicioMedidas)}` : '';

  if (meta === 'musculo') {
    const hayDato = progreso.pesoInicialKg !== null && progreso.pesoKg !== null;
    const deltaKg = hayDato ? Math.round((progreso.pesoKg! - progreso.pesoInicialKg!) * 10) / 10 : null;
    return (
      <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu progreso · Ruta A (ganar músculo)</p>
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
                {deltaKg} kg
              </p>
            </div>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              de peso corporal{desde}. Meta sana: +300 a +800 g al mes — sube el peso que levantas cuando completes tus series con buena técnica.
            </p>
          </>
        )}
      </div>
    );
  }

  const hayDato = progreso.cinturaInicialCm !== null && progreso.cinturaCm !== null;
  const deltaCm = hayDato ? Math.round((progreso.cinturaCm! - progreso.cinturaInicialCm!) * 10) / 10 : null;
  return (
    <div className="mt-5 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">Tu progreso · Ruta B (bajar grasa)</p>
      {deltaCm === null ? (
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Registra tu cintura en Perfil — en Ruta B el progreso se ve ahí, no en el peso que levantas.
        </p>
      ) : (
        <>
          <div className="mt-1 flex items-center gap-2">
            {deltaCm <= 0 ? <TrendingDown size={20} color="var(--accent)" /> : <TrendingUp size={20} color="var(--status-warning)" />}
            <p className="text-3xl font-bold tabular-nums leading-none text-[var(--text-primary)] [font-family:var(--font-display)]">
              {deltaCm > 0 ? '+' : ''}
              {deltaCm} cm
            </p>
          </div>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            de cintura{desde}. Mantén las cargas que ya levantas — en Ruta B el objetivo no es subir peso, es conservar el músculo mientras baja la grasa.
          </p>
        </>
      )}
    </div>
  );
}
