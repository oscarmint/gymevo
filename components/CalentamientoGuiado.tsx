'use client';

// CALENTAMIENTO GUIADO (23/09/2026, pedido del usuario): al tocar la lámina de
// calentamiento se abre una rutina paso a paso — cada ejercicio con su imagen y
// un contador regresivo de 1 minuto; al terminar, "Descansando" 15 segundos y
// sigue el próximo, hasta completar los 6. Sirve para calentamiento de tren
// superior e inferior. Las imágenes son recortes de las láminas originales
// (public/explicaciones/calentamiento/).

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Pause, Play, SkipForward, X } from 'lucide-react';

export type TrenCalentamientoGuiado = 'superior' | 'inferior';

const SEG_EJERCICIO = 60;
const SEG_DESCANSO = 15;

const NOMBRES: Record<TrenCalentamientoGuiado, string[]> = {
  superior: [
    'Círculos de brazos',
    'Tracción de resistencia de espalda',
    'Encogimientos de hombros',
    'Giros de tronco',
    'Extensión de tríceps',
    'Flexiones de pared banco',
  ],
  inferior: [
    'Sentadillas (sin peso)',
    'Zancadas',
    'Hip thrust sin peso',
    'Flexión lateral de pierna',
    'Levantamiento de pierna trasera',
    'Crunch simple',
  ],
};

/** Duración total en segundos (6 ejercicios + 5 descansos): para avisar "~7 min". */
export const DURACION_CALENTAMIENTO_MIN = Math.round((6 * SEG_EJERCICIO + 5 * SEG_DESCANSO) / 60);

function imagen(tren: TrenCalentamientoGuiado, i: number): string {
  return `/explicaciones/calentamiento/${tren}-${i + 1}.jpg`;
}

function minutosSegundos(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CalentamientoGuiado({ tren, onCerrar }: { tren: TrenCalentamientoGuiado; onCerrar: () => void }) {
  const nombres = NOMBRES[tren];
  const total = nombres.length;
  const reduce = useReducedMotion();
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<'ejercicio' | 'descanso' | 'fin'>('ejercicio');
  const [restante, setRestante] = useState(SEG_EJERCICIO);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || fase === 'fin') return;
    const t = setTimeout(() => {
      if (restante > 1) {
        setRestante(restante - 1);
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(150);
      if (fase === 'ejercicio') {
        if (indice === total - 1) {
          setFase('fin');
        } else {
          setFase('descanso');
          setRestante(SEG_DESCANSO);
        }
      } else {
        setIndice(indice + 1);
        setFase('ejercicio');
        setRestante(SEG_EJERCICIO);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [restante, fase, indice, pausado, total]);

  useEffect(() => {
    function alTeclado(e: KeyboardEvent) {
      if (e.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', alTeclado);
    return () => window.removeEventListener('keydown', alTeclado);
  }, [onCerrar]);

  function saltar() {
    if (fase === 'fin') return;
    if (fase === 'descanso') {
      setIndice(indice + 1);
      setFase('ejercicio');
      setRestante(SEG_EJERCICIO);
    } else if (indice === total - 1) {
      setFase('fin');
    } else {
      setFase('descanso');
      setRestante(SEG_DESCANSO);
    }
    setPausado(false);
  }

  const enDescanso = fase === 'descanso';
  // Durante el descanso se muestra ya el SIGUIENTE ejercicio (atenuado) para
  // que la persona se prepare.
  const mostrado = enDescanso ? indice + 1 : indice;
  const duracionFase = enDescanso ? SEG_DESCANSO : SEG_EJERCICIO;
  const avance = ((duracionFase - restante) / duracionFase) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Calentamiento guiado de tren ${tren}`}
      className="fixed inset-0 z-50 flex min-h-dvh flex-col bg-[var(--bg)] px-5 pt-5 pb-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--accent)]">Calentamiento tren {tren}</p>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            {fase === 'fin' ? 'Completado' : `Ejercicio ${Math.min(mostrado + 1, total)} de ${total}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar calentamiento"
          className="flex size-11 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {nombres.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              fase === 'fin' || i < indice || (i === indice && enDescanso)
                ? 'bg-[var(--accent)]'
                : i === indice
                  ? 'bg-[color-mix(in_oklab,var(--accent)_45%,transparent)]'
                  : 'bg-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]'
            }`}
          />
        ))}
      </div>

      {fase === 'fin' ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col items-center justify-center text-center"
        >
          <span className="flex size-20 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <Check size={40} color="var(--accent)" />
          </span>
          <h2 className="mt-6 text-3xl font-extrabold text-[var(--text-primary)] [font-family:var(--font-display)]">¡Calentamiento listo!</h2>
          <p className="mt-2 max-w-xs text-base text-[var(--text-secondary)]">Tu cuerpo ya está activado. Vamos con los ejercicios de hoy.</p>
          <button
            type="button"
            onClick={onCerrar}
            className="boton-3d mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
          >
            Empezar mis ejercicios
          </button>
        </motion.div>
      ) : (
        <>
          <div className="mt-4 flex min-h-0 flex-1 items-center">
          <div className="relative aspect-[4/5] max-h-full w-full overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--bg)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mostrado}-${enDescanso ? 'd' : 'e'}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: enDescanso ? 0.3 : 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                {/* Fondo difuminado de la misma imagen: llena la tarjeta alta sin
                    recortar nunca el cuerpo del ejercicio (la imagen real va
                    completa, con object-contain, encima). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen(tren, mostrado)} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagen(tren, mostrado)} alt={nombres[mostrado]} className="relative size-full object-contain" />
              </motion.div>
            </AnimatePresence>

            {enDescanso ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center">
                <p className="text-lg font-semibold text-[var(--text-primary)]">Descansando</p>
                <p className="text-7xl font-extrabold tabular-nums text-[var(--accent)] [font-family:var(--font-display)]" aria-live="off">
                  {restante}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">segundos</p>
                <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">Sigue: {nombres[mostrado]}</p>
              </div>
            ) : (
              <div className="absolute top-3 left-3 rounded-2xl bg-[color-mix(in_oklab,var(--bg)_78%,transparent)] px-4 py-1.5 backdrop-blur-sm">
                <p className="text-5xl font-extrabold tabular-nums text-[var(--accent)] [font-family:var(--font-display)]" aria-live="off">
                  {minutosSegundos(restante)}
                </p>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]" aria-hidden="true">
              <div className="h-full bg-[var(--accent)] transition-[width] duration-1000 ease-linear" style={{ width: `${avance}%` }} />
            </div>
          </div>
          </div>

          <p className="sr-only" aria-live="polite">
            {enDescanso ? `Descansando. Sigue ${nombres[mostrado]}` : nombres[mostrado]}
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setPausado((p) => !p)}
              className="boton-3d flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
            >
              {pausado ? <Play size={20} /> : <Pause size={20} />}
              {pausado ? 'Continuar' : 'Pausar'}
            </button>
            <button
              type="button"
              onClick={saltar}
              className="superficie-3d flex h-14 items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] px-5 text-base font-semibold text-[var(--text-secondary)]"
            >
              <SkipForward size={20} />
              Saltar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
