'use client';

// PLAN DEL DÍA — M0 "el ritual diario" (56): la pantalla más vista de la app.
// UNA misión: completar el entrenamiento de hoy. Protagonista de la Sesión 5.

import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Lottie } from 'lottie-react';
import { motion, AnimatePresence, useReducedMotion, animate } from 'motion/react';
import { Check, Dumbbell, FileText, Flame, Info, Moon, PlayCircle, RefreshCcw, TrendingUp, Undo2, Volume2, VolumeX, WifiOff, X, Zap } from 'lucide-react';
import { leerRespuestas } from '@/lib/onboarding';
import animacionFitness from '@/public/animaciones/fitness.json';
import { CuerpoMuscular } from '@/components/CuerpoMuscular';
import {
  CALENTAMIENTO_IMG,
  calentamientoDeSesion,
  cardioDeSesion,
  completarEntrenamiento,
  deshacerHecho,
  ejerciciosDeSesion,
  generoIlustracion,
  guardarProgreso,
  hoyISO,
  leerProgreso,
  marcarHecho,
  MUSCULO_LABEL,
  nombreDeSesion,
  sesionActual,
  semanasSeguidas,
  resumenSemana,
  descansoRecomendado,
  entrenarIgual,
  type MotivoDescanso,
  obtenerEjercicio,
  rachaEnRiesgo,
  registrarSerie,
  reemplazarEjercicio,
  aplicarReemplazos,
  seriesHechasHoy,
  sugerenciaPeso,
  ultimoRegistro,
  type Progreso,
} from '@/lib/routine';
import { BannerRenovacion } from '@/components/BannerRenovacion';
import CalentamientoGuiado, { DURACION_CALENTAMIENTO_MIN } from '@/components/CalentamientoGuiado';
import { guardarLogRemoto, guardarProgresoRemoto, leerProgresoRemoto, sincronizarPerfilInicial } from '@/lib/supabase/sync';

/** Opciones de duración del descanso — el usuario elige una al empezar el
 * plan del día (no por ejercicio: un solo cronómetro para todo hoy). */
const DURACIONES_DESCANSO = [30, 60, 120, 180];

/** Chips de esfuerzo (RIR, Repeticiones en Reserva) — solo Ruta Intermedio,
 * ver `sugerenciaPeso` en lib/routine.ts. 4 opciones (no 5) para que quepan
 * cómodas en una fila a 375px sin scroll horizontal. */
const RIR_OPCIONES: { rir: number; etiqueta: string }[] = [
  { rir: 4, etiqueta: 'Fácil' },
  { rir: 2, etiqueta: 'Normal' },
  { rir: 1, etiqueta: 'Duro' },
  { rir: 0, etiqueta: 'Al fallo' },
];

function etiquetaDuracion(seg: number): string {
  return seg < 60 ? `${seg}s` : `${seg / 60} min`;
}

/** Valor inicial del selector de repeticiones — fijo en 6 (a pedido
 * explícito del usuario), editable por el usuario según lo que hizo de
 * verdad. El rango completo sigue siendo 1-15 (ver OPCIONES_REPS). */
function repsPorDefecto(_reps: string): string {
  return '6';
}

/** Repeticiones como lista desplegable (1-15) en vez de un input de texto
 * libre — más rápido de tocar en el gimnasio y evita números fuera de rango
 * (a pedido del usuario). */
const OPCIONES_REPS = Array.from({ length: 15 }, (_, i) => String(i + 1));

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
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  // localStorage/sessionStorage no existen en el servidor: leerlos en el
  // initializer de useState (en vez de en este efecto) causa un mismatch de
  // hydration real (probado — rompía la app). Este efecto SÍ es la forma
  // correcta: solo corre en el cliente, después de que la hydration ya
  // coincidió con el HTML del servidor.
  useEffect(() => {
    const r = leerRespuestas();
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  return <PlanDelDia progreso={progreso} setProgreso={actualizarProgreso} />;
}

function PlanDelDia({
  progreso,
  setProgreso,
}: {
  progreso: Progreso;
  setProgreso: Dispatch<SetStateAction<Progreso>>;
}) {
  const [descanso, setDescanso] = useState<{ ejercicioId: string; restante: number; total: number } | null>(null);
  const [pesos, setPesos] = useState<Record<string, string>>({});
  const [repsHechas, setRepsHechas] = useState<Record<string, string>>({});
  // RIR (Repeticiones en Reserva) de la serie que se va a registrar — solo
  // Ruta Intermedio la pregunta (autorregulación, 15/09/2026, ver
  // ESTADO.md). Sin selección no se manda `rir` al log: la sugerencia de
  // peso simplemente no aparece la próxima vez, no bloquea nada.
  const [rirElegido, setRirElegido] = useState<Record<string, number>>({});
  // Recordatorio del último peso usado (pedido del usuario): NO se muestra
  // solo, es un enlace que la persona toca si quiere recordarlo — algunos
  // prefieren no verlo y decidir el peso por su cuenta. Tres estados por
  // ejercicio: sin tocar (enlace visible) → visible (dato mostrado) →
  // expirado (todo el apartado desaparece a los 30s, no vuelve a salir el
  // enlace — pedido explícito del usuario: "que desaparezca de ahí ESE
  // apartado completo", no que regrese al botón).
  const [pesoAnteriorEstado, setPesoAnteriorEstado] = useState<Record<string, 'visible' | 'expirado'>>({});
  // Aviso (no cronómetro) al TERMINAR un ejercicio completo — descansar
  // entre EJERCICIOS es distinto de descansar entre SERIES: aquí no se
  // impone un tiempo porque cada quien decide cuánto necesita, solo se
  // informa el mínimo recomendado.
  const [avisoCambioEjercicio, setAvisoCambioEjercicio] = useState<string | null>(null);
  const [celebrarHito, setCelebrarHito] = useState<number | null>(null);
  const [celebrarFin, setCelebrarFin] = useState(false);
  const [cardioAbierto, setCardioAbierto] = useState(false);
  // Se muestra al prender el interruptor de descanso automático, se oculta al
  // elegir una duración (pedido del usuario: no quedar expandido a diario).
  const [mostrarOpcionesDescanso, setMostrarOpcionesDescanso] = useState(false);
  // "¿Cómo se hace?" y "Explicación del ejercicio" quedan ocultos detrás de
  // un botón de hoja junto al de rescate, por ejercicio (pedido del usuario:
  // pantalla de entrenamiento más prolija).
  const [ayudasAbiertas, setAyudasAbiertas] = useState<Record<string, boolean>>({});
  // Calentamiento guiado (pantalla completa con contador por ejercicio).
  const [calentando, setCalentando] = useState(false);
  // celebrarFin como dependencia es intencional: regenera las posiciones del
  // confeti cada vez que se abre la celebración, no solo la primera vez.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const piezasConfeti = useMemo(() => generarConfeti(28), [celebrarFin]);
  const [errorSync, setErrorSync] = useState(false);
  const [explicando, setExplicando] = useState<string | null>(null);
  // Cortar la rutina a medias (pedido explícito): hay momentos reales en que
  // la persona debe parar sin haber marcado todos los ejercicios — pide
  // confirmación una sola vez porque avanza el día/racha igual que terminarla completa.
  const [pidiendoCortar, setPidiendoCortar] = useState(false);
  const semanas = semanasSeguidas(progreso);
  const semana = resumenSemana(progreso);
  const rachaAnteriorRef = useRef(semanas);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reduce = useReducedMotion();

  // Bug real encontrado por el usuario: "Terminar entrenamiento" (incluido el
  // corte anticipado) avanza `diaActual`, lo que dispara el efecto de más
  // abajo que resetea `etapa` a 'saludo' para el día nuevo — y como este
  // overlay antes vivía SOLO dentro del `return` de la etapa 'plan', quedaba
  // oculto detrás de "Iniciar entrenamiento" y el gif de calentamiento hasta
  // que `etapa` volvía a 'plan' varios pasos después. Se saca a una variable
  // para poder mostrarlo en CUALQUIER etapa — así "¡Muy bien!" aparece de
  // inmediato, sin importar qué muestre la pantalla de debajo, y al cerrarlo
  // (botón "Seguir" o la X) la pantalla ya quedó en "Iniciar entrenamiento"
  // del día siguiente, como se espera.
  const overlayCelebracionFin = (
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
            <h2 className="text-5xl font-extrabold text-[var(--text-primary)] [font-family:var(--font-display)]">¡Muy bien!</h2>
            {/* Pesa animada en el verde de la app en vez del emoji — le da
                más seriedad a la app (pedido explícito del usuario). GIF
                propio (recoloreado desde el original naranja), next/image
                no anima GIFs. Grande a propósito (180px, no un ícono
                chiquito) — el usuario pidió que el bloque completo ocupe
                buena parte de la pantalla, no solo un detalle discreto. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/animaciones/entrenador-verde.gif"
              alt=""
              aria-hidden="true"
              className="my-9 size-44"
            />
            <p className="text-center text-lg font-semibold text-[var(--text-primary)]">Entrenamiento completado.</p>
            <p className="mt-3 max-w-xs text-center text-base text-[var(--text-tertiary)]">
              Recuerda: el músculo se estimula aquí, pero crece mientras descansas.
            </p>
            <button
              type="button"
              onClick={() => setCelebrarFin(false)}
              className="boton-3d mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
            >
              Seguir
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Arranque del entrenamiento (pedido explícito): saludo → entrenador
  // animado → plan de hoy. Se salta en días de descanso/recuperación (no
  // aplica "vamos con toda" sin pesas) y si ya se vio para ESTE día del plan
  // (no repetir el ritual cada vez que el usuario entra y sale de la pantalla
  // el mismo día del plan). Antes se guardaba por FECHA de calendario, no por
  // día del plan — bug real encontrado por el usuario: si terminaba varios
  // días del plan en la misma fecha real (probando), el saludo solo salía en
  // el primero y los siguientes arrancaban directo en "plan", sin el "¡Vamos
  // con toda!". Guardar por `diaActual` en vez de por fecha lo corrige sin
  // cambiar el comportamiento normal (un usuario real solo avanza un día del
  // plan por fecha real, así que sigue viéndolo una sola vez por día real).
  // Identifica la sesión que toca: el contador se reinicia cada lunes, así que
  // el número solo podría repetirse entre semanas — con la fecha del último
  // entrenamiento cerrado nunca se confunde una sesión con otra.
  const claveSesion = `${progreso.ultimaFecha ?? ''}:${progreso.diaActual}`;
  const [etapa, setEtapa] = useState<'saludo' | 'entrenador' | 'plan'>(() => {
    if (typeof window === 'undefined') return 'plan';
    const yaVisto = sessionStorage.getItem('gymevo_saludo_visto_dia') === claveSesion;
    return yaVisto ? 'plan' : 'saludo';
  });

  useEffect(() => {
    if (etapa !== 'entrenador') return;
    // 5s (antes 2s) — pedido explícito del usuario: 2s no alcanzaba a leer
    // el consejo de calentamiento antes de que la pantalla avanzara sola.
    const t = setTimeout(() => setEtapa('plan'), reduce ? 0 : 5000);
    return () => clearTimeout(t);
  }, [etapa, reduce]);

  // El useState de arriba solo corre UNA vez, al montar el componente — bug
  // real encontrado por el usuario: al terminar el día y avanzar a uno nuevo
  // (diaActual cambia sin recargar la página), "etapa" se quedaba en 'plan'
  // para siempre, sin volver a mostrar el saludo/"vamos con toda". Este
  // efecto SÍ reacciona a que diaActual cambió — recalcula la etapa con la
  // misma regla de arriba cada vez que se avanza de día en la misma sesión.
  const claveAnteriorRef = useRef(claveSesion);
  useEffect(() => {
    if (claveAnteriorRef.current === claveSesion) return;
    claveAnteriorRef.current = claveSesion;
    const yaVisto = sessionStorage.getItem('gymevo_saludo_visto_dia') === claveSesion;
    setEtapa(yaVisto ? 'plan' : 'saludo');
  }, [claveSesion]);

  function iniciarEntrenamiento() {
    sessionStorage.setItem('gymevo_saludo_visto_dia', claveSesion);
    setEtapa('entrenador');
  }

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
  const [rachaMostrada, setRachaMostrada] = useState(reduce ? semanas : 0);
  useEffect(() => {
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRachaMostrada(semanas);
      return;
    }
    const controls = animate(0, semanas, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setRachaMostrada(Math.round(v)),
    });
    return () => controls.stop();
  }, [semanas, reduce]);

  // Hito de racha (M2, compilador sobrio): se detecta por CAMBIO de estado,
  // nunca dentro del updater — así una doble actualización rápida no lo dispara dos veces.
  useEffect(() => {
    if ([4, 12, 26].includes(semanas) && semanas !== rachaAnteriorRef.current) {
      setCelebrarHito(semanas);
    }
    rachaAnteriorRef.current = semanas;
  }, [semanas]);

  const nivel = progreso.nivel;
  const meta = progreso.meta;

  const sesion = sesionActual(progreso);
  const ejercicios = useMemo(() => ejerciciosDeSesion(sesion, nivel), [sesion, nivel]);

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

  // Registro REAL serie por serie (5 → sección "Registro de series"): el
  // peso y las repeticiones pueden cambiar de una serie a otra (ej. bajar
  // peso en la última), así que cada tap registra UNA serie, no las 4 de
  // una vez. El ejercicio se marca "hecho" solo cuando se completa la
  // última serie de su objetivo (`ej.series`).
  function registrar(ejercicioId: string) {
    const ej = obtenerEjercicio(ejercicioId);
    const pesoTexto = pesos[ejercicioId];
    const peso = pesoTexto ? Number(pesoTexto) : 0;
    const repsTexto = repsHechas[ejercicioId] ?? repsPorDefecto(ej.reps);
    const rir = rirElegido[ejercicioId];
    const log = { ejercicioId, peso, reps: Number(repsTexto) || 0, series: 1, ...(rir !== undefined ? { rir } : {}) };
    const yaHechas = seriesHechasHoy(progreso, ejercicioId);
    const esUltimaSerie = yaHechas + 1 >= ej.series;

    actualizar((p) => {
      const conNuevaSerie = registrarSerie(p, log);
      return esUltimaSerie ? marcarHecho(conNuevaSerie, ejercicioId) : conNuevaSerie;
    });
    guardarLogRemoto({ ...log, fecha: hoyISO() }, () => setErrorSync(true));

    // Limpia los inputs para que la siguiente serie no arrastre el peso/reps
    // de la anterior — el usuario puede repetir el mismo valor a propósito,
    // pero no debería quedar prellenado por accidente.
    setPesos((p) => ({ ...p, [ejercicioId]: '' }));
    setRepsHechas((p) => ({ ...p, [ejercicioId]: repsPorDefecto(ej.reps) }));
    setRirElegido((p) => {
      const { [ejercicioId]: _quitado, ...resto } = p;
      return resto;
    });

    if (esUltimaSerie) {
      // Entre EJERCICIOS no hay cronómetro (cada quien decide cuánto
      // descansar) — solo un aviso del mínimo recomendado para recuperar
      // energía antes del siguiente.
      setAvisoCambioEjercicio(ej.nombre);
      return;
    }

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
    // Bug real encontrado (22/09/2026): llamar a un setState DISTINTO desde
    // DENTRO del actualizador que le pasamos a `actualizar` (que a su vez
    // llama a `setProgreso`) es inválido en React — React lo ejecuta durante
    // la fase de render, no en el momento del clic, y eso disparaba "Cannot
    // update a component while rendering a different component" y dejaba
    // TODAS las actualizaciones de estado siguientes de este componente sin
    // aplicarse de forma confiable (los botones de duración dejaban de
    // responder). El setState del otro hook va SIEMPRE afuera de `actualizar`.
    // Tampoco sirve leer el "next" que devuelve el actualizador de setState
    // por una variable capturada: React no garantiza ejecutarlo de forma
    // síncrona en el momento del clic (bug real, encontrado probando esto
    // mismo) — se calcula el próximo valor directo desde `progreso` (el prop
    // ya actualizado de este render), no desde el actualizador.
    const prender = !progreso.descansoAutomatico;
    actualizar((p) => {
      const next = { ...p, descansoAutomatico: !p.descansoAutomatico };
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
    // Al encenderlo se vuelven a mostrar las opciones de duración (pedido del
    // usuario: para cambiar la duración ya elegida, hay que apagar y volver a
    // prender — así el control no se queda expandido a diario estorbando la
    // lista de ejercicios, una vez elegida la duración).
    setMostrarOpcionesDescanso(prender);
  }

  function elegirDuracionDescanso(seg: number) {
    actualizar((p) => {
      const next = { ...p, descansoDuracionSeg: seg };
      guardarProgresoRemoto(next, () => setErrorSync(true));
      return next;
    });
    setMostrarOpcionesDescanso(false);
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

  // Lo que de verdad se hace hoy: el plan con los cambios del Botón de Rescate
  // aplicados. La alternativa hereda series/reps/tempo del ejercicio del plan
  // (ver aplicarReemplazos en lib/routine.ts) — antes mostraba los valores de
  // su ficha del catálogo, y un intermedio veía sus 6-8 pesadas convertidas en 10-12.
  const idsHoy = useMemo(() => aplicarReemplazos(ejercicios, progreso.reemplazosHoy), [ejercicios, progreso.reemplazosHoy]);
  const todosHechos = idsHoy.every((e) => progreso.hechosHoy.includes(e.id));
  const enRiesgo = rachaEnRiesgo(progreso);
  // La llama se llena según el progreso REAL de hoy (ejercicios ya marcados
  // hechos / total de hoy) — a pedido explícito del usuario, no es decorativa.
  const progresoLlamaPct = idsHoy.length
    ? Math.round((idsHoy.filter((e) => progreso.hechosHoy.includes(e.id)).length / idsHoy.length) * 100)
    : 0;
  const tren = calentamientoDeSesion(sesion);
  const cardio = cardioDeSesion(sesion, nivel);

  const motivoDescanso = descansoRecomendado(progreso);
  if (motivoDescanso) {
    return (
      <>
        <TarjetaDescanso
          motivo={motivoDescanso}
          semana={semana}
          diasPlan={progreso.diasSemana}
          siguiente={nombreDeSesion(sesion)}
          onEntrenarIgual={(ligero) => actualizar((p) => entrenarIgual(p, ligero))}
        />
        {overlayCelebracionFin}
      </>
    );
  }

  if (etapa !== 'plan') {
    return (
      <>
      <div
        className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center overflow-hidden px-6 text-center"
        onClick={etapa === 'entrenador' ? () => setEtapa('plan') : undefined}
        role={etapa === 'entrenador' ? 'button' : undefined}
        aria-label={etapa === 'entrenador' ? 'Toca para continuar' : undefined}
      >
        {etapa === 'saludo' ? (
          <motion.div
            initial={reduce ? {} : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center"
          >
            {/* Mismo hallazgo del usuario que en Historial: quedaba pequeño
                en el medio de mucho espacio vacío. Se agranda (ícono, título,
                botón) para tener presencia real en el espacio disponible. */}
            <span className="chip-3d flex size-24 items-center justify-center rounded-2xl bg-[var(--accent)]">
              <Zap size={40} color="var(--bg)" strokeWidth={2.4} />
            </span>
            <h1 className="mt-6 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">¡Hola!</h1>
            <p className="mt-3 max-w-sm text-base text-[var(--text-secondary)]">
              Hoy vamos a iniciar el entrenamiento de <strong className="text-[var(--text-primary)]">{nombreDeSesion(sesion)}</strong>.
            </p>
            <button
              type="button"
              onClick={iniciarEntrenamiento}
              className="boton-3d mt-8 flex h-16 w-64 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-lg font-bold text-[var(--bg)]"
            >
              Iniciar entrenamiento
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={reduce ? {} : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            {/* GIF animado entregado por el usuario — el mismo para
                cualquier persona, sin distinguir sexo (pedido explícito).
                El archivo real es de 150×150px; mostrarlo a h-56 (224px) lo
                estiraba ~50% más de su tamaño real y se veía borroso
                (hallazgo del usuario) — h-36 (144px) queda casi 1:1 con su
                resolución nativa, nítido de verdad. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- GIF propio, next/image no anima GIFs */}
            <img src="/ilustraciones/entrenador-inicio.gif" alt="Entrenador animado entrenando con mancuernas" className="h-36 w-auto" />
            {/* Copy conectado al objetivo real del usuario, no una porra
                genérica (hallazgo del usuario, 22/09/2026): "¡Vamos con
                toda!" no sonaba natural en todos los mercados hispanos y
                desperdiciaba el espacio del titular sin decir nada del
                objetivo. Usa `meta` (ya disponible en este scope, línea 374). */}
            <p className="mt-3 text-lg font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
              {meta === 'grasa' ? 'Hoy trabajamos para perder grasa sin perder músculo.' : 'Hoy toca construir.'}
            </p>
            {/* Reemplaza "Toca para continuar" — el gesto de tocar sigue
                funcionando igual (onClick vive en el contenedor padre, sin
                cambios), pero ahora ese espacio enseña algo real en vez de
                repetir una instrucción obvia. Mismo color que ya tenía el
                texto secundario (text-tertiary), sin agregar hex nuevo. */}
            <p className="mx-auto mt-3 max-w-xs text-center text-sm text-[var(--text-tertiary)]">
              Estirar antes de levantar te debilita. Prepara el músculo con series de acercamiento (peso ligero).
            </p>
          </motion.div>
        )}
      </div>
      {overlayCelebracionFin}
      </>
    );
  }

  return (
    <div className="px-5 pt-6">
      {/* (1) EL DATO DE HOY — la fecha real de calendario (no el número de
          día del programa) arriba, chiquita; abajo la misión de hoy, con la
          animación de cierre (Lottie) coronándola. Pedido explícito del
          usuario: quitar el "Hola" y mostrar la fecha real. */}
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
        {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </p>
      {/* items-start (no items-center) + el Lottie FUERA del flujo del texto
          (shrink-0, su propia columna): con el título en 2 líneas, ponerlo
          inline o en flex-wrap lo empujaba a una tercera línea suelta y
          descuadrada (hallazgo del usuario) — así el texto envuelve libre en
          su propia columna sin que el ícono dependa de dónde termine la
          última palabra. */}
      <div className="mt-1 flex items-start gap-2">
        <h1 className="min-w-0 flex-1 text-balance text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
          {`Hoy vamos con: ${nombreDeSesion(sesion)}`}
        </h1>
        <Lottie
          src={animacionFitness}
          autoplay
          loop
          className="shrink-0"
          style={{ width: 56, height: 56 }}
        />
      </div>

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

      <BannerRenovacion />

      {/* (3) ESTADO DE LA RACHA — M4 racha en riesgo si aplica (color de aviso
          real de FICHA-ARTE, no un gris tenue — la alerta debe leerse como tal) */}
      <div
        className={`mt-4 flex items-center gap-3 rounded-2xl border p-4 ${
          enRiesgo
            ? 'border-[color-mix(in_oklab,var(--status-warning)_30%,transparent)] bg-[color-mix(in_oklab,var(--status-warning)_6%,transparent)]'
            : 'border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)]'
        }`}
      >
        <div className="relative" style={{ width: 22, height: 22 }}>
          <Flame size={22} color={enRiesgo ? 'var(--status-warning)' : 'var(--accent)'} fill="none" className="absolute inset-0" />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: `inset(${100 - progresoLlamaPct}% 0 0 0)`,
              transition: reduce ? 'none' : 'clip-path 500ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <Flame size={22} color="var(--accent)" fill="var(--accent)" />
          </div>
        </div>
        <div>
          <p className={`text-sm font-semibold ${enRiesgo ? 'text-[var(--status-warning)]' : 'text-[var(--text-primary)]'}`}>
            Racha: {rachaMostrada} {semanas === 1 ? 'semana' : 'semanas'}
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {enRiesgo
              ? `Te ${semana.faltan === 1 ? 'falta 1 sesión' : `faltan ${semana.faltan} sesiones`} esta semana y ${semana.diasRestantes === 1 ? 'queda 1 día' : `quedan ${semana.diasRestantes} días`}.`
              : `Esta semana: ${semana.hechos} de ${semana.meta} ${semana.meta === 1 ? 'día' : 'días'} de entrenamiento.`}
          </p>
        </div>
      </div>

      {/* Calentamiento antes de los ejercicios principales — nunca es opcional
          (5-7 min, activa lo que vas a trabajar y protege articulaciones). */}
      {tren && (
        <button
          type="button"
          onClick={() => setCalentando(true)}
          aria-label={`Empezar calentamiento guiado de tren ${tren}`}
          className="mt-6 block w-full overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CALENTAMIENTO_IMG[tren]} alt={`Calentamiento tren ${tren}`} className="w-full" />
          <span className="flex items-center justify-center gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">
            <PlayCircle size={18} /> Toca para empezar el calentamiento guiado · ~{DURACION_CALENTAMIENTO_MIN} min
          </span>
        </button>
      )}
      {calentando && tren && <CalentamientoGuiado tren={tren} onCerrar={() => setCalentando(false)} />}

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

      {/* Duración del cronómetro de descanso — se muestra solo al encender el
          interruptor y hasta elegir una duración; después queda colapsada
          (pedido del usuario) y solo reaparece si se apaga y se vuelve a
          prender el interruptor de arriba. */}
      <AnimatePresence>
        {progreso.descansoAutomatico && mostrarOpcionesDescanso && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex gap-2 pb-1.5">
              {DURACIONES_DESCANSO.map((seg) => {
                const activa = progreso.descansoDuracionSeg === seg;
                return (
                  <motion.button
                    key={seg}
                    type="button"
                    onClick={() => elegirDuracionDescanso(seg)}
                    aria-pressed={activa}
                    className={`flex h-9 flex-1 items-center justify-center rounded-xl text-xs font-semibold ${
                      activa
                        ? 'boton-3d bg-[var(--accent)] text-[var(--bg)]'
                        : 'superficie-3d border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
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
            const seriesHechas = seriesHechasHoy(progreso, ej.id);
            const serieActual = Math.min(seriesHechas + 1, ej.series);
            const esUltimaSerie = seriesHechas + 1 >= ej.series;
            // Algunos ejercicios (ej. plancha, "30-60 seg") tienen un objetivo
            // fuera de 1-15 — se agrega esa opción a la lista en vez de
            // perderla, para no dejar el desplegable sin la opción correcta.
            const defaultReps = repsPorDefecto(ej.reps);
            const opcionesReps = OPCIONES_REPS.includes(defaultReps)
              ? OPCIONES_REPS
              : [...OPCIONES_REPS, defaultReps].sort((a, b) => Number(a) - Number(b));
            // Solo en la primera serie (seriesHechas===0): más adelante en el
            // mismo ejercicio ya sabe qué peso está usando hoy.
            const registroAnterior = seriesHechas === 0 ? ultimoRegistro(progreso, ej.id) : null;
            // Autorregulación (Ruta Intermedio, 15/09/2026): solo en la
            // primera serie, y solo si la vez pasada quedó un RIR guardado.
            const sugerencia = nivel === 'intermedio' && seriesHechas === 0 ? sugerenciaPeso(progreso, ej.id) : null;
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
                    {ej.series}×{ej.reps}
                  </p>
                  {!hecho && (
                    <p className="mt-1 text-xs font-semibold text-[var(--accent)]">
                      Serie {serieActual} de {ej.series}
                    </p>
                  )}
                  {!hecho && registroAnterior && pesoAnteriorEstado[ej.id] !== 'expirado' && (
                    pesoAnteriorEstado[ej.id] === 'visible' ? (
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                        Última vez: {registroAnterior.peso}
                        {progreso.unidadPeso} × {registroAnterior.reps} reps
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPesoAnteriorEstado((p) => ({ ...p, [ej.id]: 'visible' }));
                          // Se oculta solo a los 30s Y NO vuelve a mostrar el
                          // enlace (pedido explícito: "que desaparezca de ahí
                          // ese apartado completo") — pasa a 'expirado', un
                          // tercer estado, no de vuelta al enlace inicial.
                          setTimeout(() => setPesoAnteriorEstado((p) => ({ ...p, [ej.id]: 'expirado' })), 30000);
                        }}
                        className="mt-1 text-xs font-medium text-[var(--text-tertiary)] underline underline-offset-2"
                      >
                        ¿Cuánto usé en la última rutina?
                      </button>
                    )
                  )}
                  {/* Autorregulación (Ruta Intermedio): si la vez pasada
                      quedó registrado qué tan duro se sintió, se sugiere
                      subir el peso o mantenerlo — nunca bajarlo solo, eso
                      lo decide la persona si de verdad lo necesita. */}
                  {!hecho && sugerencia && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                      <TrendingUp size={13} />
                      {sugerencia.subio
                        ? `Te sobró margen — prueba con ${sugerencia.pesoSugerido}${progreso.unidadPeso} hoy.`
                        : `Mantén ${sugerencia.pesoSugerido}${progreso.unidadPeso} — la vez pasada costó.`}
                    </p>
                  )}
                  {!hecho && ayudasAbiertas[ej.id] && (
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
                  <div className="flex shrink-0 items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      aria-label={ayudasAbiertas[ej.id] ? `Ocultar ayudas de ${ej.nombre}` : `Ver cómo se hace ${ej.nombre}`}
                      aria-expanded={!!ayudasAbiertas[ej.id]}
                      onClick={() => setAyudasAbiertas((p) => ({ ...p, [ej.id]: !p[ej.id] }))}
                      className={`flex size-9 items-center justify-center rounded-full border ${
                        ayudasAbiertas[ej.id]
                          ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--accent)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <FileText size={16} />
                    </motion.button>
                    {!ej.sinRescate && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Cambiar ${ej.nombre} por una alternativa`}
                        onClick={() => rescatar(ej.id)}
                        className="flex size-9 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]"
                      >
                        <RefreshCcw size={16} />
                      </motion.button>
                    )}
                  </div>
                )}
              </div>

              {!hecho ? (
                <>
                {/* Autorregulación (Ruta Intermedio, 15/09/2026): pregunta
                    qué tan duro se sintió la serie que está por registrar —
                    un principiante todavía no puede juzgar su esfuerzo con
                    precisión, así que nunca se le pregunta. Opcional: si no
                    se toca ningún chip, el log se guarda igual, sin `rir`. */}
                {nivel === 'intermedio' && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {RIR_OPCIONES.map((op) => (
                      <button
                        key={op.rir}
                        type="button"
                        onClick={() => setRirElegido((p) => ({ ...p, [ej.id]: op.rir }))}
                        className={`h-8 rounded-full px-3 text-xs font-semibold transition-colors ${
                          rirElegido[ej.id] === op.rir
                            ? 'bg-[var(--accent)] text-[var(--bg)]'
                            : 'border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {op.etiqueta}
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-end gap-2">
                  {/* Etiqueta SIEMPRE visible arriba de cada campo — el reps
                      viene prellenado con la meta, así que su placeholder
                      nunca se ve; sin esta etiqueta no se distinguía de qué
                      campo se trataba (hallazgo del usuario). */}
                  <div className="flex w-16 flex-col gap-1">
                    <label htmlFor={`peso-${ej.id}`} className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
                      Peso ({progreso.unidadPeso})
                    </label>
                    <input
                      id={`peso-${ej.id}`}
                      type="number"
                      inputMode="decimal"
                      placeholder={progreso.unidadPeso}
                      aria-label={`Peso usado en ${ej.nombre}, en ${progreso.unidadPeso === 'kg' ? 'kilogramos' : 'libras'}`}
                      value={pesos[ej.id] ?? ''}
                      onChange={(e) => setPesos((p) => ({ ...p, [ej.id]: e.target.value }))}
                      className="h-12 w-16 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="flex w-16 flex-col gap-1">
                    <label htmlFor={`reps-${ej.id}`} className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
                      Reps
                    </label>
                    <select
                      id={`reps-${ej.id}`}
                      aria-label={`Repeticiones hechas en ${ej.nombre}`}
                      value={repsHechas[ej.id] ?? repsPorDefecto(ej.reps)}
                      onChange={(e) => setRepsHechas((p) => ({ ...p, [ej.id]: e.target.value }))}
                      className="h-12 w-16 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    >
                      {opcionesReps.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => registrar(ej.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                      esProxima
                        ? 'boton-3d bg-[var(--accent)] text-[var(--bg)]'
                        : 'boton-3d-borde border border-[var(--accent)] text-[var(--accent)]'
                    }`}
                  >
                    <Check size={16} />
                    {esUltimaSerie ? 'Registrar última serie' : progreso.descansoAutomatico ? `Registrar serie ${serieActual} y descansar` : `Registrar serie ${serieActual}`}
                  </motion.button>
                </div>
                </>
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
            <button
              type="button"
              onClick={() => setCardioAbierto(true)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] text-sm font-semibold text-[var(--accent)]"
            >
              <Info size={16} />
              Explicación del cardio
            </button>
          </div>
        )}

        {cardio && cardioAbierto && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Explicación de ${cardio.titulo}`}
            className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-[var(--bg)]/95 px-4 pb-6 pt-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- mismo criterio que la explicación de ejercicios */}
            <img src={cardio.imagen} alt={`Explicación de ${cardio.titulo}`} className="w-full max-w-md rounded-[var(--radius-card)]" />
            <button
              type="button"
              onClick={() => setCardioAbierto(false)}
              className="boton-3d mt-4 flex h-12 w-full max-w-md shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
            >
              Entendido, volver al plan
            </button>
          </div>
        )}

        <motion.button
          type="button"
          disabled={!todosHechos}
          onClick={finalizarEntrenamiento}
          whileTap={todosHechos ? { scale: 0.97 } : undefined}
          className="boton-3d mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-35"
        >
          Terminar entrenamiento de hoy
        </motion.button>

        {/* Salida honesta para cuando de verdad hay que parar (llamada,
            máquina cerrada, lo que sea) — sin esto, la única forma de avanzar
            de día era marcar TODO, aunque la persona ya no pudiera seguir.
            Disponible desde el día 0 hechos (hallazgo del usuario: a veces
            hay que cortar ANTES de alcanzar a terminar el primer ejercicio). */}
        {!todosHechos && (
          <button
            type="button"
            onClick={() => setPidiendoCortar(true)}
            className="mt-1 flex h-10 w-full items-center justify-center text-xs font-medium text-[var(--text-tertiary)] underline underline-offset-2"
          >
            Tengo que cortar aquí — dar por terminado con lo de hoy
          </button>
        )}
      </div>

      {pidiendoCortar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-cortar-rutina"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_35%,transparent)] px-6"
          onClick={() => setPidiendoCortar(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-5"
          >
            <p id="titulo-cortar-rutina" className="text-base font-semibold text-[var(--text-primary)]">
              ¿Damos por terminado el día?
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Hiciste {idsHoy.filter((e) => progreso.hechosHoy.includes(e.id)).length} de {idsHoy.length} ejercicios. Se cuenta
              como completado y tu racha sigue viva — mañana sigues con el resto de tu ruta.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPidiendoCortar(false)}
                className="superficie-3d flex h-12 flex-1 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-sm font-semibold text-[var(--text-primary)]"
              >
                Seguir entrenando
              </button>
              <button
                type="button"
                onClick={() => {
                  setPidiendoCortar(false);
                  finalizarEntrenamiento();
                }}
                className="boton-3d flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
              >
                Sí, terminar aquí
              </button>
            </div>
          </div>
        </div>
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

      {/* Aviso al terminar un ejercicio completo — descansar entre EJERCICIOS
          (no entre series) no lleva cronómetro: cada quien decide cuánto
          necesita, esto solo informa el mínimo recomendado. */}
      <AnimatePresence>
        {avisoCambioEjercicio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_35%,transparent)] px-6"
            onClick={() => setAvisoCambioEjercicio(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-aviso-descanso"
              className="w-full max-w-sm rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-center"
            >
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
                <Info size={22} color="var(--accent)" />
              </span>
              <h2 id="titulo-aviso-descanso" className="mt-4 text-lg font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
                ¡Terminaste {avisoCambioEjercicio}!
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Descansa mínimo 3 minutos antes de tu siguiente ejercicio para recuperar energía. Tú decides cuándo seguir.
              </p>
              <button
                type="button"
                onClick={() => setAvisoCambioEjercicio(null)}
                className="boton-3d mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
              >
                Entendido
              </button>
            </motion.div>
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
            <h2 className="mt-1 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">semanas seguidas</h2>
            <p className="mt-3 max-w-xs text-center text-sm text-[var(--text-secondary)]">
              Cumpliste tu meta {celebrarHito} semanas seguidas. Cada entrenamiento cuenta — sigue así.
            </p>
            <button
              type="button"
              onClick={() => setCelebrarHito(null)}
              className="boton-3d mt-8 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
            >
              Seguir
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {overlayCelebracionFin}

      {/* "Explicación del ejercicio" — silueta propia con el músculo
          resaltado (nunca fotos de terceros con licencia ajena). */}
      <AnimatePresence>
        {explicando &&
          (() => {
            const ej = obtenerEjercicio(explicando);
            return (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                // Pantalla completa a propósito (pedido explícito del
                // usuario): antes era una hoja inferior con margen y fondo
                // oscurecido alrededor — ahora aprovecha TODO el espacio para
                // que la infografía se vea lo más grande posible.
                className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[var(--surface)] px-5 pt-[max(20px,env(safe-area-inset-top))] pb-10"
              >
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
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)] text-[var(--text-secondary)]"
                  >
                    <X size={18} />
                  </button>
                </div>
                {ej.guia ? (
                  // Plantilla premium (14/09/2026): texto real + ilustración
                  // que se estira (object-fit:cover) para llenar exactamente
                  // el espacio que sobra — el hallazgo del usuario fue que un
                  // hueco vacío antes del botón se siente incompleto, y una
                  // imagen de ancho completo nunca calza igual en todos los
                  // ejercicios (el texto de cada uno mide distinto). Con
                  // flex-1 en la ilustración y min-h-0 en el contenedor, cero
                  // espacio muerto sin importar cuánto texto tenga cada uno.
                  <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
                    <div className="min-h-36 flex-1 overflow-hidden rounded-[var(--radius-card)] bg-[var(--bg)]">
                      {ej.imagenExplicacion && (
                        // eslint-disable-next-line @next/next/no-img-element -- ver AppPorDentro.tsx: <img> mantiene el kit portable
                        <img
                          src={ej.imagenExplicacion}
                          alt={`Explicación del ejercicio ${ej.nombre}`}
                          // object-contain (no object-cover): pedido explícito y repetido del
                          // usuario en toda la sesión de ilustraciones — nunca se corta ninguna
                          // parte del cuerpo del deportista. object-cover con una posición fija
                          // (antes "center 22%") recortaba distinto según la geometría de cada
                          // imagen (encontrado con "Sentadilla con barra": cortaba la cabeza de
                          // la segunda figura). Con contain la imagen completa siempre es
                          // visible, con un margen del mismo color de fondo si sobra espacio.
                          className="size-full object-contain"
                        />
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--accent)]">Indicaciones</p>
                        <ul className="mt-2 flex flex-col gap-1.5">
                          {ej.guia.indicaciones.map((linea) => (
                            <li key={linea} className="flex gap-2 text-sm leading-snug text-[var(--text-primary)]">
                              <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                              <span>{linea}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-start gap-6">
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--accent)]">Músculos trabajados</p>
                          <ul className="mt-2 flex flex-col gap-1.5">
                            {ej.guia.musculos.map((m) => (
                              <li key={m.nombre} className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
                                <span className="size-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                                <span>
                                  {m.nombre}
                                  {m.principal ? ' (principal)' : ''}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-bold uppercase tracking-[0.04em] text-[var(--accent)]">Volumen</p>
                          <p className="mt-1 text-2xl font-extrabold leading-none text-[var(--accent)]">{ej.series}</p>
                          <p className="text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">Series</p>
                          <p className="mt-1 text-2xl font-extrabold leading-none text-[var(--accent)]">{ej.reps}</p>
                          <p className="text-xs uppercase tracking-[0.04em] text-[var(--text-secondary)]">Repeticiones</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)] px-4 py-3">
                        <p className="flex gap-2 text-sm leading-snug text-[var(--text-primary)]">
                          <Check size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                          <span>{ej.guia.consejoTecnico}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex justify-center">
                    {ej.imagenExplicacion ? (
                      // eslint-disable-next-line @next/next/no-img-element -- ver AppPorDentro.tsx: <img> mantiene el kit portable
                      <img
                        src={ej.imagenExplicacion}
                        alt={`Explicación del ejercicio ${ej.nombre}`}
                        className="w-full rounded-[var(--radius-card)]"
                      />
                    ) : (
                      <CuerpoMuscular musculo={ej.grupoMuscular} genero={generoIlustracion(ej.id)} />
                    )}
                  </div>
                )}
                {/* Sin guía premium: la infografía casi nunca llena la
                    pantalla completa (proporción vertical distinta a la del
                    celular) — en vez de dejar el resto como vacío muerto
                    (hallazgo del usuario), ese espacio se llena con una
                    acción real que cierra la pantalla. mt-auto la empuja al
                    fondo solo cuando sobra alto. Con guía premium, la
                    ilustración con flex-1 ya consume todo el sobrante, así
                    que mt-auto no hace nada (0 espacio libre) y el botón
                    queda pegado justo debajo del bloque de texto. */}
                <button
                  type="button"
                  onClick={() => setExplicando(null)}
                  className="boton-3d mt-auto flex h-14 w-full shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
                >
                  Entendido, volver al ejercicio
                </button>
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

const TEXTO_DESCANSO: Record<MotivoDescanso, { titulo: string; cuerpo: (siguiente: string, hechos: number, meta: number) => string }> = {
  hoy: {
    titulo: 'Hoy ya entrenaste',
    cuerpo: (siguiente) => `Buen trabajo. El músculo crece mientras descansas. Tu próxima sesión: ${siguiente}.`,
  },
  seguidos: {
    titulo: 'Descanso recomendado',
    cuerpo: (siguiente) => `Llevas 3 días seguidos entrenando. Descansar hoy ayuda a que tu cuerpo se recupere y rinda mejor en tu próxima sesión: ${siguiente}.`,
  },
  semana: {
    titulo: 'El 7º día es de descanso',
    cuerpo: (siguiente) => `Ya entrenaste 6 de los últimos 7 días. Descansa hoy: sin recuperación el riesgo es lesión y agotamiento, no más progreso. Sigues con ${siguiente}.`,
  },
  meta: {
    titulo: '¡Meta de la semana cumplida!',
    cuerpo: (siguiente, hechos, meta) => `${hechos} de ${meta} ${meta === 1 ? 'día' : 'días'} de entrenamiento. Puedes descansar, o sumar un día extra si te sientes con energía. Tu próxima sesión: ${siguiente}.`,
  },
};

/** El plan propone descansar, nunca lo impone: siempre hay un botón para
 * entrenar igual. Reemplaza al "día 7" fijo — la persona entrena los días que
 * puede y la app solo cuida que no se pase. */
function TarjetaDescanso({
  motivo,
  semana,
  diasPlan,
  siguiente,
  onEntrenarIgual,
}: {
  motivo: MotivoDescanso;
  semana: { hechos: number; meta: number };
  diasPlan: number;
  siguiente: string;
  onEntrenarIgual: (ligero: boolean) => void;
}) {
  const texto = TEXTO_DESCANSO[motivo];
  // Con 4+ días la sesión extra es ligera (core y cardio suave); con menos, el
  // día extra es simplemente la siguiente sesión de cuerpo completo.
  const hayExtraLigero = motivo === 'meta' && diasPlan >= 4;
  const etiquetaEntrenar = motivo === 'meta' ? `Agregar otro día: ${siguiente}` : motivo === 'hoy' ? 'Entrenar otra sesión hoy' : 'Entrenar igual';
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center justify-center px-6 text-center">
      <span className="chip-3d flex size-20 items-center justify-center rounded-2xl bg-[var(--accent)]">
        <Moon size={36} color="var(--bg)" strokeWidth={2.4} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{texto.titulo}</h1>
      <p className="mt-3 max-w-sm text-base text-[var(--text-secondary)]">{texto.cuerpo(siguiente, semana.hechos, semana.meta)}</p>
      {hayExtraLigero && (
        <motion.button
          type="button"
          onClick={() => onEntrenarIgual(true)}
          whileTap={{ scale: 0.97 }}
          className="boton-3d mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
        >
          Día extra ligero: abdomen y lumbar
        </motion.button>
      )}
      <motion.button
        type="button"
        onClick={() => onEntrenarIgual(false)}
        whileTap={{ scale: 0.97 }}
        className={
          hayExtraLigero
            ? 'mt-3 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-sm font-semibold text-[var(--text-secondary)]'
            : 'boton-3d mt-8 flex h-14 w-full max-w-xs items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-base font-semibold text-[var(--bg)]'
        }
      >
        {hayExtraLigero ? `Entrenar ${siguiente}` : etiquetaEntrenar}
      </motion.button>
    </div>
  );
}
