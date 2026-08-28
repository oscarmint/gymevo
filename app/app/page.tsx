'use client';

// PLAN DEL DÍA — M0 "el ritual diario" (56): la pantalla más vista de la app.
// UNA misión: completar el entrenamiento de hoy. Protagonista de la Sesión 5.

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Flame, RefreshCcw, X } from 'lucide-react';
import { leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import {
  completarEntrenamiento,
  ejerciciosDeHoy,
  guardarProgreso,
  leerProgreso,
  marcarHecho,
  nombreDeHoy,
  obtenerEjercicio,
  rachaEnRiesgo,
  registrarSerie,
  reemplazarEjercicio,
  tituloRuta,
  type Progreso,
} from '@/lib/routine';

export default function PlanDelDiaPage() {
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  useEffect(() => {
    setRespuestas(leerRespuestas());
    setProgreso(leerProgreso());
  }, []);

  if (!progreso) return null; // loading: evita parpadeo antes de leer localStorage

  const actualizarProgreso: Dispatch<SetStateAction<Progreso>> = (accion) =>
    setProgreso((prev) => (typeof accion === 'function' ? (accion as (p: Progreso) => Progreso)(prev as Progreso) : accion));

  return <PlanDelDia progreso={progreso} setProgreso={actualizarProgreso} respuestas={respuestas} />;
}

function PlanDelDia({
  progreso,
  setProgreso,
  respuestas,
}: {
  progreso: Progreso;
  setProgreso: Dispatch<SetStateAction<Progreso>>;
  respuestas: RespuestasOnboarding | null;
}) {
  const [descanso, setDescanso] = useState<{ ejercicioId: string; restante: number } | null>(null);
  const [pesos, setPesos] = useState<Record<string, string>>({});
  const [celebrarHito, setCelebrarHito] = useState<number | null>(null);
  const rachaAnteriorRef = useRef(progreso.racha);

  useEffect(() => {
    if (!descanso || descanso.restante <= 0) return;
    const t = setTimeout(() => setDescanso((d) => (d ? { ...d, restante: d.restante - 1 } : d)), 1000);
    return () => clearTimeout(t);
  }, [descanso]);

  // Hito de racha (M2, compilador sobrio): se detecta por CAMBIO de estado,
  // nunca dentro del updater — así una doble actualización rápida no lo dispara dos veces.
  useEffect(() => {
    if ([7, 30, 100].includes(progreso.racha) && progreso.racha !== rachaAnteriorRef.current) {
      setCelebrarHito(progreso.racha);
    }
    rachaAnteriorRef.current = progreso.racha;
  }, [progreso.racha]);

  const nivel = respuestas?.nivel ?? 'principiante';
  const meta = respuestas?.meta ?? 'musculo';

  const ejercicios = useMemo(() => ejerciciosDeHoy(progreso.diaActual), [progreso.diaActual]);

  // Actualización funcional: siempre parte del progreso MÁS RECIENTE, nunca del
  // capturado en el closure del render — evita perder un registro si dos taps
  // caen antes de que React vuelva a pintar (atomicidad, 25 → "TRANSACCIONES").
  function actualizar(updater: (p: Progreso) => Progreso) {
    setProgreso((prev) => {
      const next = updater(prev);
      guardarProgreso(next);
      return next;
    });
  }

  function registrar(ejercicioId: string) {
    const ej = obtenerEjercicio(ejercicioId);
    const pesoTexto = pesos[ejercicioId];
    const peso = pesoTexto ? Number(pesoTexto) : 0;
    actualizar((p) => marcarHecho(registrarSerie(p, { ejercicioId, peso, reps: Number(ej.reps) || 0, series: ej.series }), ejercicioId));
    setDescanso({ ejercicioId, restante: ej.descansoSeg });
  }

  function rescatar(ejercicioId: string) {
    actualizar((p) => reemplazarEjercicio(p, ejercicioId));
  }

  function finalizarEntrenamiento() {
    actualizar(completarEntrenamiento);
  }

  const idsHoy = ejercicios.map((e) => obtenerEjercicio(progreso.reemplazosHoy[e.id] ?? e.id));
  const todosHechos = idsHoy.every((e) => progreso.hechosHoy.includes(e.id));
  const enRiesgo = rachaEnRiesgo(progreso);

  return (
    <div className="px-5 pt-6">
      {/* (1) EL DATO DE HOY */}
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
        Día {progreso.diaActual} · {tituloRuta(nivel, meta)}
      </p>
      <h1 className="mt-1 text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
        Hoy toca {nombreDeHoy(progreso.diaActual)}
      </h1>

      {/* (3) ESTADO DE LA RACHA — M4 racha en riesgo si aplica */}
      <div
        className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${
          enRiesgo
            ? 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)]'
            : 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]'
        }`}
      >
        <Flame size={22} color={enRiesgo ? 'var(--text-tertiary)' : 'var(--accent)'} fill={enRiesgo ? 'none' : 'var(--accent)'} />
        <div>
          <p className={`text-sm font-semibold ${enRiesgo ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
            Racha: {progreso.racha} {progreso.racha === 1 ? 'día' : 'días'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {enRiesgo ? 'Falta el registro de hoy.' : 'Tu registro de hoy la mantiene viva.'}
          </p>
        </div>
      </div>

      {/* (2) LA ACCIÓN DE 1 TAP — la lista de ejercicios de hoy */}
      <div className="mt-6 flex flex-col gap-3 pb-28">
        {idsHoy.map((ej, i) => {
          const hecho = progreso.hechosHoy.includes(ej.id);
          return (
            <motion.div
              key={ej.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-base font-semibold ${
                      hecho ? 'text-[var(--text-tertiary)] line-through decoration-[var(--accent)] decoration-2' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {ej.nombre}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {ej.series}×{ej.reps} · descanso {ej.descansoSeg}s
                  </p>
                </div>
                {!hecho && (
                  <button
                    type="button"
                    aria-label={`Cambiar ${ej.nombre} por una alternativa`}
                    onClick={() => rescatar(ej.id)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]"
                  >
                    <RefreshCcw size={16} />
                  </button>
                )}
              </div>

              {!hecho ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    value={pesos[ej.id] ?? ''}
                    onChange={(e) => setPesos((p) => ({ ...p, [ej.id]: e.target.value }))}
                    className="h-11 w-20 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => registrar(ej.id)}
                    className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
                  >
                    <Check size={16} /> Registrar y descansar
                  </button>
                </div>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                  <Check size={15} /> Hecho
                </p>
              )}
            </motion.div>
          );
        })}

        <button
          type="button"
          disabled={!todosHechos}
          onClick={finalizarEntrenamiento}
          className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-35"
        >
          Terminar entrenamiento de hoy
        </button>
      </div>

      {/* Temporizador de descanso — banner fijo */}
      <AnimatePresence>
        {descanso && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-md items-center justify-between gap-3 bg-[var(--text-primary)] px-5 py-3.5"
          >
            <p className="text-sm font-semibold tabular-nums text-[var(--bg)]">
              Descanso: {Math.floor(descanso.restante / 60)}:{String(descanso.restante % 60).padStart(2, '0')}
            </p>
            <button type="button" onClick={() => setDescanso(null)} className="text-xs font-medium text-[var(--bg)] opacity-80">
              Saltar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* M2 (compilador sobrio: número que cuenta, sin confetti) — hito de racha */}
      <AnimatePresence>
        {celebrarHito && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg)] px-6"
          >
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setCelebrarHito(null)}
              className="absolute top-6 right-6 flex size-11 items-center justify-center text-[var(--text-secondary)]"
            >
              <X size={22} />
            </button>
            <span className="flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              <Flame size={30} color="var(--accent)" fill="var(--accent)" />
            </span>
            <p className="mt-6 text-5xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
              {celebrarHito}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">días seguidos</h2>
            <p className="mt-3 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Racha activa: {celebrarHito} días. Cada entrenamiento cuenta — sigue así.
            </p>
            <button
              type="button"
              onClick={() => setCelebrarHito(null)}
              className="mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
            >
              Seguir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
