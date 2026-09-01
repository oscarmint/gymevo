// Catálogo de ejercicios y progreso del usuario — Sesión 5 (app interna).
// Sin backend todavía (Sesión 6 lo mueve a Supabase: tablas `exercises`,
// `routine_days`, `exercise_alternatives`, `workout_logs`, `user_progress` — ver
// ESTADO.md → Modelo de datos). Por ahora vive en localStorage, client-only.

import type { Meta, Nivel } from './onboarding';

export interface Ejercicio {
  id: string;
  nombre: string;
  grupo: string;
  series: number;
  reps: string;
  descansoSeg: number;
  /** Tempo de ejecución: bajada-pausa-subida en segundos (ej. "3-1-1") — el
   * detalle de técnica que responde al dolor #1 de FICHA-AVATAR (miedo a
   * lesionarse por mala técnica). Compuestos van más lentos que aislados. */
  tempo: string;
  alternativaId: string;
}

type TipoDia = 'empuje' | 'tiron' | 'piernas' | 'full';

const CATALOGO: Record<string, Ejercicio> = {
  press_banca: { id: 'press_banca', nombre: 'Press de banca', grupo: 'Pecho', series: 4, reps: '8', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_mancuernas' },
  press_mancuernas: { id: 'press_mancuernas', nombre: 'Press con mancuernas', grupo: 'Pecho', series: 4, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'press_banca' },
  press_militar: { id: 'press_militar', nombre: 'Press militar', grupo: 'Hombro', series: 3, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'press_arnold' },
  press_arnold: { id: 'press_arnold', nombre: 'Press Arnold', grupo: 'Hombro', series: 3, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'press_militar' },
  fondos: { id: 'fondos', nombre: 'Fondos en banco', grupo: 'Tríceps', series: 3, reps: '12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'triceps_polea' },
  triceps_polea: { id: 'triceps_polea', nombre: 'Extensión de tríceps en polea', grupo: 'Tríceps', series: 3, reps: '12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'fondos' },

  remo_barra: { id: 'remo_barra', nombre: 'Remo con barra', grupo: 'Espalda', series: 4, reps: '10', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'remo_maquina' },
  remo_maquina: { id: 'remo_maquina', nombre: 'Remo en máquina', grupo: 'Espalda', series: 4, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_barra' },
  jalon_pecho: { id: 'jalon_pecho', nombre: 'Jalón al pecho', grupo: 'Espalda', series: 4, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'dominadas_asistidas' },
  dominadas_asistidas: { id: 'dominadas_asistidas', nombre: 'Dominadas asistidas', grupo: 'Espalda', series: 3, reps: '8', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'jalon_pecho' },
  curl_biceps: { id: 'curl_biceps', nombre: 'Curl de bíceps', grupo: 'Bíceps', series: 3, reps: '12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_martillo' },
  curl_martillo: { id: 'curl_martillo', nombre: 'Curl martillo', grupo: 'Bíceps', series: 3, reps: '12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_biceps' },

  sentadilla: { id: 'sentadilla', nombre: 'Sentadilla', grupo: 'Piernas', series: 4, reps: '8', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'prensa' },
  prensa: { id: 'prensa', nombre: 'Prensa de piernas', grupo: 'Piernas', series: 4, reps: '10', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'sentadilla' },
  peso_muerto_rumano: { id: 'peso_muerto_rumano', nombre: 'Peso muerto rumano', grupo: 'Isquiotibiales', series: 3, reps: '10', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'curl_femoral' },
  curl_femoral: { id: 'curl_femoral', nombre: 'Curl femoral', grupo: 'Isquiotibiales', series: 3, reps: '12', descansoSeg: 75, tempo: '2-1-1', alternativaId: 'peso_muerto_rumano' },
  zancadas: { id: 'zancadas', nombre: 'Zancadas', grupo: 'Piernas', series: 3, reps: '12', descansoSeg: 75, tempo: '2-1-1', alternativaId: 'extension_cuadriceps' },
  extension_cuadriceps: { id: 'extension_cuadriceps', nombre: 'Extensión de cuádriceps', grupo: 'Piernas', series: 3, reps: '12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'zancadas' },

  press_hombros_mancuerna: { id: 'press_hombros_mancuerna', nombre: 'Press de hombros con mancuernas', grupo: 'Hombro', series: 3, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'press_militar' },
  remo_un_brazo: { id: 'remo_un_brazo', nombre: 'Remo a un brazo', grupo: 'Espalda', series: 3, reps: '10', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_maquina' },
  plancha: { id: 'plancha', nombre: 'Plancha abdominal', grupo: 'Core', series: 3, reps: '40 seg', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_polea' },
  crunch_polea: { id: 'crunch_polea', nombre: 'Crunch en polea', grupo: 'Core', series: 3, reps: '15', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha' },
};

const SPLIT: Record<TipoDia, string[]> = {
  empuje: ['press_banca', 'press_militar', 'fondos'],
  tiron: ['remo_barra', 'jalon_pecho', 'curl_biceps'],
  piernas: ['sentadilla', 'peso_muerto_rumano', 'zancadas'],
  full: ['remo_un_brazo', 'press_hombros_mancuerna', 'plancha'],
};

const ORDEN_DIAS: TipoDia[] = ['empuje', 'tiron', 'piernas', 'full'];

const NOMBRE_DIA: Record<TipoDia, string> = {
  empuje: 'Empuje',
  tiron: 'Tirón',
  piernas: 'Piernas',
  full: 'Full body',
};

export function tipoDeHoy(diaActual: number): TipoDia {
  return ORDEN_DIAS[(diaActual - 1) % ORDEN_DIAS.length];
}

export function nombreDeHoy(diaActual: number): string {
  return NOMBRE_DIA[tipoDeHoy(diaActual)];
}

export function ejerciciosDeHoy(diaActual: number): Ejercicio[] {
  const tipo = tipoDeHoy(diaActual);
  return SPLIT[tipo].map((id) => CATALOGO[id]);
}

export function obtenerEjercicio(id: string): Ejercicio {
  return CATALOGO[id];
}

export function tituloRuta(nivel: Nivel, meta: Meta): string {
  const rutaLabel = nivel === 'principiante' ? 'Ruta Principiante' : 'Ruta Intermedio';
  const metaLabel = meta === 'musculo' ? 'Hipertrofia' : 'Pérdida de grasa';
  return `${rutaLabel} · ${metaLabel}`;
}

// ── Progreso (localStorage — Sesión 6 lo mueve a `user_progress`/`workout_logs`) ──

export interface RegistroLog {
  fecha: string; // YYYY-MM-DD
  ejercicioId: string;
  peso: number;
  reps: number;
  series: number;
}

export interface Progreso {
  diaActual: number;
  racha: number;
  ultimaFecha: string | null; // YYYY-MM-DD del último entrenamiento completado
  hechosHoy: string[]; // ids de ejercicios marcados hoy
  reemplazosHoy: Record<string, string>; // ejercicioOriginal → alternativa activa
  logs: RegistroLog[];
  /** Si el temporizador de descanso arranca solo al registrar una serie.
   * El usuario lo decide antes de entrenar; default true. */
  descansoAutomatico: boolean;
  /** Cuánto dura ese temporizador (30/60/120/180s) — el usuario lo elige al
   * empezar el plan del día, es el mismo para todos los ejercicios de hoy. */
  descansoDuracionSeg: number;
}

const KEY = 'gymevo_progreso';

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function diasEntre(a: string, b: string): number {
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPorDia);
}

export function leerProgreso(): Progreso {
  if (typeof window === 'undefined') {
    return { diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: true, descansoDuracionSeg: 60 };
  }
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const inicial: Progreso = { diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: true, descansoDuracionSeg: 60 };
    localStorage.setItem(KEY, JSON.stringify(inicial));
    return inicial;
  }
  const p = JSON.parse(raw) as Progreso;
  // Compatibilidad con progreso guardado antes de este campo.
  if (p.descansoAutomatico === undefined) p.descansoAutomatico = true;
  if (p.descansoDuracionSeg === undefined) p.descansoDuracionSeg = 60;
  // Si cambió el día calendario desde el último completado y ya se había marcado
  // "hechosHoy", se limpia para el nuevo día (pero SIN romper la racha: eso solo
  // pasa si pasan ≥2 días sin completar, ver `racha en riesgo/rota` abajo).
  if (p.ultimaFecha && p.ultimaFecha !== hoyISO() && p.hechosHoy.length > 0) {
    p.hechosHoy = [];
    p.reemplazosHoy = {};
  }
  return p;
}

export function guardarProgreso(p: Progreso) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function marcarHecho(p: Progreso, ejercicioId: string): Progreso {
  if (p.hechosHoy.includes(ejercicioId)) return p;
  return { ...p, hechosHoy: [...p.hechosHoy, ejercicioId] };
}

/** Deshace un registro de hoy (control y libertad — heurística 3): quita la
 * marca de "hecho" y el último log de ese ejercicio con fecha de hoy, para
 * poder corregir el peso sin arrastrar un dato erróneo al historial. */
export function deshacerHecho(p: Progreso, ejercicioId: string): Progreso {
  const hoy = hoyISO();
  const idxUltimo = p.logs.findLastIndex((l) => l.ejercicioId === ejercicioId && l.fecha === hoy);
  const logs = idxUltimo >= 0 ? [...p.logs.slice(0, idxUltimo), ...p.logs.slice(idxUltimo + 1)] : p.logs;
  return { ...p, hechosHoy: p.hechosHoy.filter((id) => id !== ejercicioId), logs };
}

export function reemplazarEjercicio(p: Progreso, originalId: string): Progreso {
  const alt = obtenerEjercicio(originalId).alternativaId;
  return { ...p, reemplazosHoy: { ...p.reemplazosHoy, [originalId]: alt } };
}

export function registrarSerie(p: Progreso, log: Omit<RegistroLog, 'fecha'>): Progreso {
  return { ...p, logs: [...p.logs, { ...log, fecha: hoyISO() }] };
}

export function completarEntrenamiento(p: Progreso): Progreso {
  const hoy = hoyISO();
  let racha = 1;
  if (p.ultimaFecha) {
    const gap = diasEntre(p.ultimaFecha, hoy);
    racha = gap <= 1 ? p.racha + 1 : 1; // mismo día o consecutivo: suma; si no, reinicia
  }
  return { ...p, diaActual: p.diaActual + 1, racha, ultimaFecha: hoy };
}

/** Racha en riesgo (M4 de 56): ya pasó ≥1 día completo sin entrenar y aún no venció del todo. */
export function rachaEnRiesgo(p: Progreso): boolean {
  if (!p.ultimaFecha || p.racha === 0) return false;
  return diasEntre(p.ultimaFecha, hoyISO()) >= 1 && p.hechosHoy.length === 0;
}
