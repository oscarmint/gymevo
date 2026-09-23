'use client';

// PROGRESO — Calendario + Historial fusionados (23/09/2026, pedido del
// usuario). Una sola pantalla con dos vistas:
//   · Calendario: el mes pintado día por día; al tocar un día, su detalle
//     (series y pesos) aparece justo debajo — el historial ES el calendario.
//   · Evolución: progreso corporal según la meta, volumen y, en Intermedio,
//     analítica avanzada.
// Arriba, siempre visible, la semana contra la meta y la racha en semanas.

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { diasDelMes, resumenDelMes } from '@/lib/calendario';
import { hoyISO } from '@/lib/routine';
import { useProgresoCalendario } from '@/lib/useProgresoCalendario';
import { CalendarioMes } from '@/components/progreso/CalendarioMes';
import { DetalleDia } from '@/components/progreso/DetalleDia';
import { Evolucion } from '@/components/progreso/Evolucion';
import { TarjetaSemana } from '@/components/progreso/TarjetaSemana';

type Vista = 'calendario' | 'evolucion';

const FECHA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

const VISTAS: { id: Vista; etiqueta: string }[] = [
  { id: 'calendario', etiqueta: 'Calendario' },
  { id: 'evolucion', etiqueta: 'Evolución' },
];

function ProgresoContenido() {
  const parametros = useSearchParams();
  const progreso = useProgresoCalendario();
  const hoy = hoyISO();

  const fechaParametro = FECHA_VALIDA.test(parametros.get('fecha') ?? '') ? (parametros.get('fecha') as string) : null;
  const [vista, setVista] = useState<Vista>(parametros.get('vista') === 'evolucion' ? 'evolucion' : 'calendario');
  const [elegida, setElegida] = useState<string | null>(fechaParametro);
  const [mesElegido, setMesElegido] = useState<{ anio: number; mes0: number } | null>(null);
  const detalleRef = useRef<HTMLDivElement>(null);
  const eligioDia = useRef(false);

  // Por defecto se ve la última sesión registrada (lo que una pantalla de
  // historial tiene que mostrar al abrirse); si aún no hay ninguna, hoy. Ir al
  // plan de hoy está a un toque en la barra de abajo.
  const ultimaConRegistros = progreso ? progreso.logs.reduce<string | null>((max, l) => (max === null || l.fecha > max ? l.fecha : max), null) : null;
  const seleccionada = elegida ?? (ultimaConRegistros && ultimaConRegistros <= hoy ? ultimaConRegistros : hoy);
  const mes = useMemo(
    () => mesElegido ?? { anio: Number(seleccionada.slice(0, 4)), mes0: Number(seleccionada.slice(5, 7)) - 1 },
    [mesElegido, seleccionada],
  );

  const anioHoy = Number(hoy.slice(0, 4));
  const mesHoy = Number(hoy.slice(5, 7)) - 1;
  const esMesActual = mes.anio === anioHoy && mes.mes0 === mesHoy;

  const dias = useMemo(() => (progreso ? diasDelMes(progreso, mes.anio, mes.mes0, hoy) : []), [progreso, mes, hoy]);
  const resumen = useMemo(() => resumenDelMes(dias), [dias]);

  // Al tocar un día, el detalle queda a la vista sin que la persona tenga que
  // buscarlo más abajo (solo tras un toque, no al cargar la pantalla).
  useEffect(() => {
    if (!eligioDia.current) return;
    eligioDia.current = false;
    detalleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [seleccionada]);

  function moverMes(delta: number) {
    const f = new Date(mes.anio, mes.mes0 + delta, 1);
    setMesElegido({ anio: f.getFullYear(), mes0: f.getMonth() });
  }

  function elegirDia(fecha: string) {
    eligioDia.current = true;
    setElegida(fecha);
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu progreso</p>
      {/* Mismo patrón que el ícono de Lottie junto al título de Plan de hoy:
          siempre visible, en su propia columna fuera del flujo del texto
          (pedido explícito del usuario cuando esto era Historial). */}
      <div className="mt-1 flex items-center gap-2">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Progreso</h1>
        {/* eslint-disable-next-line @next/next/no-img-element -- GIF propio, next/image no anima GIFs */}
        <img src="/animaciones/historial-spinner.gif" alt="" aria-hidden="true" className="size-14 shrink-0 motion-reduce:hidden" />
      </div>

      {progreso && (
        <>
          <TarjetaSemana progreso={progreso} />

          <div role="tablist" aria-label="Vista de progreso" className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-[var(--surface)] p-1">
            {VISTAS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={vista === v.id}
                onClick={() => setVista(v.id)}
                className={`h-11 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                  vista === v.id ? 'boton-3d-borde bg-[var(--chip-bg)] text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {v.etiqueta}
              </button>
            ))}
          </div>

          {vista === 'calendario' ? (
            <div className="mt-4">
              <CalendarioMes
                dias={dias}
                anio={mes.anio}
                mes0={mes.mes0}
                hoy={hoy}
                seleccionada={seleccionada}
                esMesActual={esMesActual}
                onSeleccionar={elegirDia}
                onMoverMes={moverMes}
              />
              {progreso.logs.length === 0 ? (
                <p className="mt-4 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)]">
                  Aún no hay entrenamientos registrados. Cuando registres tu primera serie, tus días empiezan a pintarse aquí.
                </p>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Este mes:</span> {resumen.verdes}{' '}
                  {resumen.verdes === 1 ? 'día completo' : 'días completos'} · {resumen.amarillos}{' '}
                  {resumen.amarillos === 1 ? 'parcial' : 'parciales'}
                </p>
              )}
              <div ref={detalleRef} className="mt-6 scroll-mb-24">
                <DetalleDia progreso={progreso} fecha={seleccionada} hoy={hoy} />
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <Evolucion progreso={progreso} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProgresoPage() {
  return (
    <Suspense fallback={null}>
      <ProgresoContenido />
    </Suspense>
  );
}
