'use client';

// PLAN DEL DÍA — M0 "el ritual diario" (56): la pantalla más vista de la app.
// UNA misión: completar el entrenamiento de hoy. Protagonista de la Sesión 5.

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Lottie } from 'lottie-react';
import { motion, AnimatePresence, useReducedMotion, animate } from 'motion/react';
import { Check, Dumbbell, Flame, PlayCircle, RefreshCcw, Undo2, Volume2, VolumeX, WifiOff, X } from 'lucide-react';
import { leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import animacionFitness from '@/public/animaciones/fitness.json';
import { CuerpoMuscular } from '@/components/CuerpoMuscular';
import {
  CALENTAMIENTO_IMG,
  calentamientoDeHoy,
  cardioDeHoy,
  completarEntrenamiento,
  deshacerHecho,
  ejerciciosDeHoy,
  esDiaDeDescanso,
  generoIlustracion,
  guardarProgreso,
  leerProgreso,
  marcarHecho,
  MUSCULO_LABEL,
  nombreDeHoy,
  obtenerEjercicio,
  rachaEnRiesgo,
  registrarSerie,
  reemplazarEjercicio,
  tituloRuta,
  type Progreso,
} from '@/lib/routine';
import { guardarLogRemoto, guardarProgresoRemoto, leerProgresoRemoto, sincronizarPerfilInicial } from '@/lib/supabase/sync';

/** Opciones de duración del descanso — el usuario elige una al empezar el
 * plan del día (no por ejercicio: un solo cronómetro para todo hoy). */
const DURACIONES_DESCANSO = [30, 60, 120, 180];

function etiquetaDuracion(seg: number): string {
  return seg < 60 ? `${seg}s` : `${seg / 60} min`;
}

/** El objetivo del ejercicio viene como rango ("10-12") o tiempo ("30-60
 * seg") — se prellena el input de repeticiones con el número más alto del
 * rango (el techo del objetivo), editable por el usuario si hizo menos. */
function repsPorDefecto(reps: string): string {
  const numeros = reps.match(/\d+/g);
  return numeros ? numeros[numeros.length - 1] : '';
}

// Colores del confeti de cierre — definidos en tokens.css, no en la paleta de
// UI (única excepción a 60-30-10: es una celebración puntual, no chrome).
const COLORES_CONFETI = ['var(--confetti-1)', 'var(--confetti-2)', 'var(--confetti-3)', 'var(--confetti-4)', 'var(--confetti-5)'];

interface PiezaConfeti {
  izquierda: number;
  tamano: number;
  color: string;
  giroInicial: number;
  giroTotal: number;
  duracion: number;
  retraso: number;
}

function generarConfeti(cantidad: number): PiezaConfeti[] {
  return Array.from({ length: cantidad }, () => ({
    izquierda: Math.random() * 100,
    tamano: 6 + Math.random() * 8,
    color: COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)],
    giroInicial: Math.random() * 360,
    giroTotal: 180 + Math.random() * 360,
    duracion: 2.2 + Math.random() * 1.4,
    retraso: Math.random() * 0.6,
  }));
}

// Safari viejo solo expone el AudioContext bajo el prefijo `webkit`.
type VentanaConAudioLegado = Window & { webkitAudioContext?: typeof AudioContext };

/** Campanita sintetizada (dos tonos cortos) — sin archivo de audio que
 * descargar ni licencia que pagar. El contexto se crea/retoma DENTRO del tap
 * de "Registrar" (más abajo) para cumplir la política de autoplay de los
 * navegadores; aquí solo se programa el sonido sobre ese contexto ya vivo. */
function reproducirCampanita(ctx: AudioContext) {
  const ahora = ctx.currentTime;
  [880, 1175].forEach((frecuencia, i) => {
    const inicio = ahora + i * 0.18;
    const osc = ctx.createOscillator();
    const ganancia = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frecuencia;
    ganancia.gain.setValueAtTime(0.0001, inicio);
    ganancia.gain.exponentialRampToValueAtTime(0.25, inicio + 0.02);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);
    osc.connect(ganancia);
    ganancia.connect(ctx.destination);
    osc.start(inicio);
    osc.stop(inicio + 0.18);
  });
}

export default function PlanDelDiaPage() {
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  // localStorage/sessionStorage no existen en el servidor: leerlos en el
  // initializer de useState (en vez de en este efecto) causa un mismatch de
  // hydration real (probado — rompía la app). Este efecto SÍ es la forma
  // correcta: solo corre en el cliente, después de que la hydration ya
  // coincidió con el HTML del servidor.
  useEffect(() => {
    const r = leerRespuestas();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRespuestas(r);
    setProgreso(leerProgreso());

    // Si hay sesión de Supabase: crea el perfil remoto la primera vez (con las
    // respuestas del onboarding) y si ya existía progreso remoto, ese manda
    // sobre el local (es el que sobrevive a cambiar de celular).
    sincronizarPerfilInicial(r).then(() => {
      leerProgresoRemoto().then((remoto) => {
        if (remoto) {
          guardarProgreso(remoto);
          setProgreso(remoto);
        }
      });
    });
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
  const [descanso, setDescanso] = useState<{ ejercicioId: string; restante: number; total: number } | null>(null);
  const [pesos, setPesos] = useState<Record<string, string>>({});
  const [repsHechas, setRepsHechas] = useState<Record<string, string>>({});
  const [celebrarHito, setCelebrarHito] = useState<number | null>(null);
  const [celebrarFin, setCelebrarFin] = useState(false);
  // celebrarFin como dependencia es intencional: regenera las posiciones del
  // confeti cada vez que se abre la celebración, no solo la primera vez.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const piezasConfeti = useMemo(() => generarConfeti(28), [celebrarFin]);
  const [errorSync, setErrorSync] = useState(false);
  const [explicando, setExplicando] = useState<string | null>(null);
  const rachaAnteriorRef = useRef(progreso.racha);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!descanso || descanso.restante <= 0) return;
    const t = setTimeout(() => setDescanso((d) => (d ? { ...d, restante: d.restante - 1 } : d)), 1000);
    return () => clearTimeout(t);
  }, [descanso]);

  // Aviso de "ya puedes seguir": vibra (si el celular lo soporta) y cierra el
  // banner solo unos segundos después, para que se alcance a leer/sentir.
  useEffect(() => {
    if (!descanso || descanso.restante > 0) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200);
    if (progreso.sonidoDescanso && audioCtxRef.current) {
      try {
        reproducirCampanita(audioCtxRef.current);
      } catch {
        // Web Audio bloqueado por el navegador — la vibración/aviso visual siguen.
      }
    }
    const t = setTimeout(() => setDescanso(null), 1800);
    return () => clearTimeout(t);
  }, [descanso, progreso.sonidoDescanso]);

  // Número héroe de la racha: cuenta desde 0 al montar (baseline obligatoria de
  // movimiento, 14/22) — se salta la animación con prefers-reduced-motion.
  const [rachaMostrada, setRachaMostrada] = useState(reduce ? progreso.racha : 0);
  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRachaMostrada(progreso.racha);
      return;
    }
    const controls = animate(0, progreso.racha, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setRachaMostrada(Math.round(v)),
    });
    return () => controls.stop();
  }, [progreso.racha, reduce]);

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
    const repsTexto = repsHechas[ejercicioId] ?? repsPorDefecto(ej.reps);
    const log = { ejercicioId, peso, reps: Number(repsTexto) || 0, series: ej.series };
    actualizar((p) => marcarHecho(registrarSerie(p, log), ejercicioId));
    guardarLogRemoto({ ...log, fecha: new Date().toISOString().slice(0, 10) }, () => setErrorSync(true));
    if (progreso.descansoAutomatico) {
      // El AudioContext se crea/retoma AQUÍ, dentro del tap real del usuario:
      // los navegadores solo permiten reproducir sonido si nace de un gesto
      // directo — crearlo más tarde (cuando el descanso llega a 0) no suena.
      if (progreso.sonidoDescanso) {
        try {
          const ConstructorAudio = window.AudioContext ?? (window as VentanaConAudioLegado).webkitAudioContext;
          if (ConstructorAudio) {
            if (!audioCtxRef.current) audioCtxRef.current = new ConstructorAudio();
            audioCtxRef.current.resume();
          }
        } catch {
          // Sin Web Audio: el descanso sigue funcionando, solo sin campanita.
        }
      }
      setDescanso({ ejercicioId, restante: progreso.descansoDuracionSeg, total: progreso.descansoDuracionSeg });
    }
  }

  function deshacer(ejercicioId: string) {
    actualizar((p) => deshacerHecho(p, ejercicioId));
  }

  function rescatar(ejercicioId: string) {
    actualizar((p) => reemplazarEjercicio(p, ejercicioId));
  }

  function alternarDescansoAutomatico() {
    actualizar((p) => {
      const next = { ...p, descansoAutomatico: !p.descansoAutomatico };
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
  }

  function elegirDuracionDescanso(seg: number) {
    actualizar((p) => {
      const next = { ...p, descansoDuracionSeg: seg };
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
  }

  function alternarSonidoDescanso() {
    actualizar((p) => {
      const next = { ...p, sonidoDescanso: !p.sonidoDescanso };
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
  }

  function urlComoSeHace(nombreEjercicio: string): string {
    const q = encodeURIComponent(`${nombreEjercicio} técnica correcta`);
    return `https://www.youtube.com/results?search_query=${q}`;
  }

  function finalizarEntrenamiento() {
    actualizar((p) => {
      const next = completarEntrenamiento(p);
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
    setCelebrarFin(true);
  }

  const idsHoy = ejercicios.map((e) => obtenerEjercicio(progreso.reemplazosHoy[e.id] ?? e.id));
  const todosHechos = idsHoy.every((e) => progreso.hechosHoy.includes(e.id));
  const enRiesgo = rachaEnRiesgo(progreso);
  const diaDescanso = esDiaDeDescanso(progreso.diaActual);
  const tren = calentamientoDeHoy(progreso.diaActual);
  const cardio = cardioDeHoy(progreso.diaActual);

  return (
    <div className="px-5 pt-6">
      {/* (1) EL DATO DE HOY — saludo con nombre + la parte de hoy en una sola
          frase, con la animación de cierre (Lottie) coronando la misión del día. */}
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
        Día {progreso.diaActual} · {tituloRuta(nivel, meta)}
      </p>
      <h1 className="mt-1 flex flex-wrap items-center gap-1 text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
        <span>
          {diaDescanso ? 'Hoy es tu día de descanso' : `Hola, hoy toca ${nombreDeHoy(progreso.diaActual)}`}
        </span>
        <Lottie
          src={animacionFitness}
          autoplay
          loop
          className="shrink-0"
          style={{ width: 36, height: 36 }}
        />
      </h1>

      {/* Aviso si la sincronización remota falla — nunca en silencio (heurística 9),
          con "Reintentar" real (control y libertad, heurística 3) */}
      {errorSync && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[color-mix(in_oklab,var(--status-warning)_35%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_10%,transparent)] px-4 py-2.5 text-xs font-medium text-[var(--status-warning)]">
          <span className="flex items-center gap-2">
            <WifiOff size={14} /> No pudimos guardar en la nube.
          </span>
          <button
            type="button"
            onClick={() => {
              setErrorSync(false);
              guardarProgresoRemoto(progreso, () => setErrorSync(true));
            }}
            className="underline underline-offset-2"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* (3) ESTADO DE LA RACHA — M4 racha en riesgo si aplica (color de aviso
          real de FICHA-ARTE, no un gris tenue — la alerta debe leerse como tal) */}
      <div
        className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${
          enRiesgo
            ? 'border-[color-mix(in_oklab,var(--status-warning)_30%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_6%,transparent)]'
            : 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]'
        }`}
      >
        <Flame size={22} color={enRiesgo ? 'var(--status-warning)' : 'var(--accent)'} fill={enRiesgo ? 'none' : 'var(--accent)'} />
        <div>
          <p className={`text-sm font-semibold ${enRiesgo ? 'text-[var(--status-warning)]' : 'text-[var(--text-primary)]'}`}>
            Racha: {rachaMostrada} {progreso.racha === 1 ? 'día' : 'días'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {enRiesgo ? 'Falta el registro de hoy.' : 'Tu registro de hoy la mantiene viva.'}
          </p>
        </div>
      </div>

      {diaDescanso ? (
        <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">Hoy no hay entrenamiento — y está bien así.</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Durante el descanso es cuando el cuerpo se recupera y los músculos crecen. Aprovecha para dormir bien
            y comer con calma: mañana retomas tu plan.
          </p>
        </div>
      ) : (
      <>
      {/* Calentamiento antes de los ejercicios principales — nunca es opcional
          (5-7 min, activa lo que vas a trabajar y protege articulaciones). */}
      {tren && (
        <a
          href={CALENTAMIENTO_IMG[tren]}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CALENTAMIENTO_IMG[tren]} alt={`Calentamiento tren ${tren}`} className="w-full" />
        </a>
      )}

      {/* Interruptor: el usuario decide si el descanso arranca solo o no */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={alternarDescansoAutomatico}
        className="mt-4 flex w-full items-center justify-between rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-4 py-3"
      >
        <span className="text-sm font-medium text-[var(--text-primary)]">Descanso automático entre series</span>
        <span
          aria-hidden="true"
          className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            progreso.descansoAutomatico ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
          }`}
        >
          <span
            className={`absolute size-5 rounded-full bg-[var(--bg)] shadow-[var(--shadow-1)] transition-transform ${
              progreso.descansoAutomatico ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </span>
      </motion.button>

      {/* Duración del cronómetro de descanso — una sola vez, para todo hoy */}
      <AnimatePresence>
        {progreso.descansoAutomatico && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-2">
              {DURACIONES_DESCANSO.map((seg) => {
                const activa = progreso.descansoDuracionSeg === seg;
                return (
                  <motion.button
                    key={seg}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => elegirDuracionDescanso(seg)}
                    aria-pressed={activa}
                    className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-semibold ${
                      activa
                        ? 'bg-[var(--accent)] text-[var(--bg)]'
                        : 'border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {etiquetaDuracion(seg)}
                  </motion.button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={alternarSonidoDescanso}
              aria-pressed={progreso.sonidoDescanso}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]"
            >
              {progreso.sonidoDescanso ? <Volume2 size={14} /> : <VolumeX size={14} />}
              Sonido al terminar el descanso
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* (2) LA ACCIÓN DE 1 TAP — la lista de ejercicios de hoy */}
      <div className="mt-4 flex flex-col gap-3 pb-28">
        {(() => {
          const proximaId = idsHoy.find((e) => !progreso.hechosHoy.includes(e.id))?.id;
          return idsHoy.map((ej, i) => {
            const hecho = progreso.hechosHoy.includes(ej.id);
            const esProxima = ej.id === proximaId;
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
                    {ej.series}×{ej.reps} · tempo {ej.tempo} · descanso {ej.descansoSeg}s
                  </p>
                  {!hecho && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={urlComoSeHace(ej.nombre)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)]"
                      >
                        <PlayCircle size={13} /> ¿Cómo se hace?
                      </a>
                      <button
                        type="button"
                        onClick={() => setExplicando(ej.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-2)]"
                      >
                        <Dumbbell size={13} /> Explicación del ejercicio
                      </button>
                    </div>
                  )}
                </div>
                {!hecho && (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Cambiar ${ej.nombre} por una alternativa`}
                    onClick={() => rescatar(ej.id)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]"
                  >
                    <RefreshCcw size={16} />
                  </motion.button>
                )}
              </div>

              {!hecho ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="kg"
                    aria-label={`Peso usado en ${ej.nombre}`}
                    value={pesos[ej.id] ?? ''}
                    onChange={(e) => setPesos((p) => ({ ...p, [ej.id]: e.target.value }))}
                    className="h-12 w-16 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="reps"
                    aria-label={`Repeticiones hechas en ${ej.nombre}`}
                    value={repsHechas[ej.id] ?? repsPorDefecto(ej.reps)}
                    onChange={(e) => setRepsHechas((p) => ({ ...p, [ej.id]: e.target.value }))}
                    className="h-12 w-16 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => registrar(ej.id)}
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                      esProxima
                        ? 'bg-[var(--accent)] text-[var(--bg)]'
                        : 'border border-[var(--accent)] text-[var(--accent)]'
                    }`}
                  >
                    <Check size={16} /> {progreso.descansoAutomatico ? 'Registrar y descansar' : 'Registrar'}
                  </motion.button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)]">
                    <Check size={15} /> Hecho
                  </p>
                  <button
                    type="button"
                    onClick={() => deshacer(ej.id)}
                    className="flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)]"
                  >
                    <Undo2 size={13} /> Deshacer
                  </button>
                </div>
              )}
            </motion.div>
          );
        });
        })()}

        {cardio && (
          <div className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {cardio.titulo}
              {cardio.opcional && <span className="ml-1.5 font-normal text-[var(--text-tertiary)]">(opcional)</span>}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{cardio.duracion}</p>
          </div>
        )}

        <motion.button
          type="button"
          whileTap={todosHechos ? { scale: 0.97 } : undefined}
          disabled={!todosHechos}
          onClick={finalizarEntrenamiento}
          className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-35"
        >
          Terminar entrenamiento de hoy
        </motion.button>
      </div>
      </>
      )}

      {/* Temporizador de descanso — banner fijo con anillo que se va consumiendo */}
      <AnimatePresence>
        {descanso && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-0 bottom-20 z-30 mx-auto flex w-full max-w-md items-center gap-3 bg-[var(--text-primary)] px-5 py-3"
          >
            <AnilloDescanso restante={descanso.restante} total={descanso.total} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--bg)]">
                {descanso.restante === 0 ? '¡Listo! Sigue con tu próxima serie' : 'Descansando…'}
              </p>
              <p className="text-xs tabular-nums text-[var(--bg)] opacity-70">
                {Math.floor(descanso.restante / 60)}:{String(descanso.restante % 60).padStart(2, '0')} restantes
              </p>
            </div>
            <button type="button" onClick={() => setDescanso(null)} className="shrink-0 text-xs font-medium text-[var(--bg)] opacity-80">
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

      {/* Cierre del entrenamiento de hoy — confeti cayendo + "¡Muy bien!" */}
      <AnimatePresence>
        {celebrarFin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--bg)] px-6"
          >
            {!reduce &&
              piezasConfeti.map((pieza, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="absolute top-0 rounded-sm"
                  style={{ left: `${pieza.izquierda}%`, width: pieza.tamano, height: pieza.tamano, backgroundColor: pieza.color }}
                  initial={{ y: -20, rotate: pieza.giroInicial, opacity: 0 }}
                  animate={{ y: '110vh', rotate: pieza.giroInicial + pieza.giroTotal, opacity: [0, 1, 1, 0.8] }}
                  transition={{ duration: pieza.duracion, delay: pieza.retraso, ease: 'linear' }}
                />
              ))}

            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => setCelebrarFin(false)}
              className="absolute top-6 right-6 z-10 flex size-11 items-center justify-center text-[var(--text-secondary)]"
            >
              <X size={22} />
            </button>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">¡Muy bien!</h2>
              <span className="mt-2 text-6xl" aria-hidden="true">
                😅
              </span>
              <p className="mt-4 max-w-xs text-center text-sm text-[var(--text-secondary)]">
                Terminaste el entrenamiento de hoy.
                <br />
                Descansa, mañana continuaremos.
              </p>
              <button
                type="button"
                onClick={() => setCelebrarFin(false)}
                className="mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
              >
                Seguir
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* "Explicación del ejercicio" — silueta propia con el músculo
          resaltado (nunca fotos de terceros con licencia ajena). */}
      <AnimatePresence>
        {explicando &&
          (() => {
            const ej = obtenerEjercicio(explicando);
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_oklab,var(--text-primary)_35%,transparent)]"
                onClick={() => setExplicando(null)}
              >
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-md rounded-t-[var(--radius-card)] bg-[var(--surface)] px-5 pt-4 pb-8"
                >
                  <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)]" />
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent-2)]">
                        {MUSCULO_LABEL[ej.grupoMuscular]}
                      </p>
                      <h2 className="text-lg font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{ej.nombre}</h2>
                    </div>
                    <button
                      type="button"
                      aria-label="Cerrar"
                      onClick={() => setExplicando(null)}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="mt-2 flex justify-center">
                    {ej.imagenExplicacion ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ver AppPorDentro.tsx: <img> mantiene el kit portable
                      <img
                        src={ej.imagenExplicacion}
                        alt={`Explicación del ejercicio ${ej.nombre}`}
                        className="max-h-56 w-auto rounded-[var(--radius-card)]"
                      />
                    ) : (
                      <CuerpoMuscular musculo={ej.grupoMuscular} genero={generoIlustracion(ej.id)} />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}

/** Anillo que se va "consumiendo" a medida que pasa el descanso — animación
 * base obligatoria (17/22: gráficos que se dibujan, no estáticos). El trazo
 * completo es el tiempo total; se vacía en sentido de las agujas del reloj. */
function AnilloDescanso({ restante, total }: { restante: number; total: number }) {
  const radio = 17;
  const circunferencia = 2 * Math.PI * radio;
  const fraccionRestante = total > 0 ? restante / total : 0;
  const completo = restante === 0;

  return (
    <div className={`relative flex size-11 shrink-0 items-center justify-center ${completo ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 44 44" className="size-11 -rotate-90">
        <circle cx="22" cy="22" r={radio} fill="none" stroke="var(--bg)" strokeOpacity={0.2} strokeWidth={4} />
        <circle
          cx="22"
          cy="22"
          r={radio}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - fraccionRestante)}
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums text-[var(--bg)]">{restante}</span>
    </div>
  );
}
