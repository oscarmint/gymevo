// Catálogo de ejercicios y progreso del usuario — Sesión 5 (app interna).
// Sin backend todavía (Sesión 6 lo mueve a Supabase: tablas `exercises`,
// `routine_days`, `exercise_alternatives`, `workout_logs`, `user_progress` — ver
// ESTADO.md → Modelo de datos). Por ahora vive en localStorage, client-only.

import { leerRespuestas, type Meta, type Nivel, type Sexo } from './onboarding';

// REESTRUCTURACIÓN 03/09/2026 — calendario de 7 días, cardio por ruta y
// diferenciación principiante/intermedio, a especificación exacta dada por
// el usuario (arquitectura "REAL FISIC"): Día 1 pierna-cuádriceps, Día 2
// empuje+cardio por ruta, Día 3 tracción, Día 4 recuperación activa (SIN
// pesas), Día 5 pierna-isquios/glúteos, Día 6 híbrido superior sin piernas,
// Día 7 descanso hormonal. Reemplaza el split anterior (que mezclaba
// cuádriceps con isquios/glúteos en el mismo día y no variaba el cardio
// según la meta del usuario).

/** Grupo muscular estandarizado — independiente del `grupo` de texto libre
 * (que es la etiqueta que ve el usuario). Este es el que decide qué
 * ilustración de "Explicación del ejercicio" se muestra (ver
 * components/CuerpoMuscular.tsx). Al agregar un ejercicio nuevo, siempre se
 * le asigna uno de estos — así la ilustración sale sola, sin pasos extra. */
export type GrupoMuscular =
  | 'pecho'
  | 'hombro'
  | 'biceps'
  | 'triceps'
  | 'trapecio'
  | 'femoral'
  | 'cuadriceps'
  | 'pantorrilla'
  | 'dorsal'
  | 'gluteo'
  | 'espalda'
  | 'core';

export const MUSCULO_LABEL: Record<GrupoMuscular, string> = {
  pecho: 'Pecho',
  hombro: 'Hombro',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  trapecio: 'Trapecio',
  femoral: 'Femoral',
  cuadriceps: 'Cuádriceps',
  pantorrilla: 'Pantorrilla',
  dorsal: 'Dorsal (lateral de espalda)',
  gluteo: 'Glúteo',
  espalda: 'Espalda',
  core: 'Core / Abdomen',
};

export interface Ejercicio {
  id: string;
  nombre: string;
  grupo: string;
  /** Para la silueta de respaldo de "Explicación del ejercicio" — ver MUSCULO_LABEL. */
  grupoMuscular: GrupoMuscular;
  /** Imagen real del ejercicio (guía visual del programa de 90 días) para
   * "Explicación del ejercicio" — ruta dentro de public/, ej.
   * "/explicaciones/sentadilla-barra.jpg". Sin ella, se usa la silueta de
   * cuerpo (CuerpoMuscular) como respaldo: agregar la imagen más adelante
   * nunca rompe nada. Ver public/explicaciones/README.md. */
  imagenExplicacion?: string;
  /** Ejercicio libre/compuesto que exige más técnica (sentadilla con barra,
   * peso muerto, press militar, remo con barra) — en Ruta Principiante se
   * sustituye automáticamente por su `alternativaId` (máquina/más guiado),
   * nunca se le pide a un principiante que empiece directo con barra libre. */
  avanzado?: boolean;
  series: number;
  reps: string;
  descansoSeg: number;
  /** Tempo de ejecución: bajada-pausa-subida en segundos (ej. "3-1-1") — el
   * detalle de técnica que responde al dolor #1 de FICHA-AVATAR (miedo a
   * lesionarse por mala técnica). Compuestos van más lentos que aislados. */
  tempo: string;
  alternativaId: string;
}

/** Tren que se calienta antes del día — decide qué lámina de calentamiento
 * mostrar (ver CALENTAMIENTO_IMG). Sábado es full body pero empieza con
 * sentadilla, así que calienta como día de pierna. */
export type TrenCalentamiento = 'superior' | 'inferior';

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

const ORDEN_DIAS: DiaSemana[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

const NOMBRE_DIA: Record<DiaSemana, string> = {
  lunes: 'Pierna (cuádriceps) y abdomen',
  martes: 'Empuje: pecho, hombro y tríceps',
  miercoles: 'Tracción: espalda, bíceps y hombro',
  jueves: 'Recuperación activa',
  viernes: 'Pierna (isquiotibiales y glúteos)',
  sabado: 'Tren superior híbrido',
  domingo: 'Descanso hormonal',
};

export const CALENTAMIENTO_IMG: Record<TrenCalentamiento, string> = {
  superior: '/explicaciones/calentamiento-tren-superior.jpg',
  inferior: '/explicaciones/calentamiento-tren-inferior.jpg',
};

const CALENTAMIENTO_DIA: Record<DiaSemana, TrenCalentamiento | null> = {
  lunes: 'inferior',
  martes: 'superior',
  miercoles: 'superior',
  jueves: null, // recuperación activa: sin pesas, no aplica calentamiento de gimnasio
  viernes: 'inferior',
  sabado: 'superior',
  domingo: null,
};

export type TipoCardio = 'hiit' | 'zona2';

export interface CardioDelDia {
  tipo: TipoCardio;
  titulo: string;
  duracion: string;
  imagen: string;
  opcional?: boolean;
}

const CARDIO_HIIT: CardioDelDia = {
  tipo: 'hiit',
  titulo: 'Cardio HIIT',
  duracion: '10-15 min · sprints de 30s + 1 min caminando',
  imagen: '/explicaciones/cardio-hiit.jpg',
};

const CARDIO_ZONA2: CardioDelDia = {
  tipo: 'zona2',
  titulo: 'Cardio Zona 2',
  duracion: '30-60 min · ritmo cómodo y sostenido',
  imagen: '/explicaciones/cardio-zona2.jpg',
};

/** El cardio del Día 2 (empuje) cambia según la ruta — a especificación
 * exacta del usuario: Zona 2 para no interferir con el volumen muscular en
 * Ruta A (ganar músculo), HIIT para acelerar el metabolismo en Ruta B (bajar
 * grasa). Los demás días de pesas no llevan cardio (solo Día 2 y Día 4). */
export function cardioDeHoy(diaActual: number, meta: Meta): CardioDelDia | null {
  const dia = diaSemanaDeHoy(diaActual);
  if (dia !== 'martes') return null;
  return meta === 'musculo' ? CARDIO_ZONA2 : CARDIO_HIIT;
}

export interface RecuperacionActiva {
  pasosObjetivo: string;
  /** Solo Ruta B: sesión de cardio Zona 2 adicional orientada a quema de grasa. */
  cardioExtra?: CardioDelDia;
}

/** Día 4 — recuperación activa: nunca es entrenamiento de fuerza, solo
 * movimiento ligero. Ruta A camina para favorecer el flujo sanguíneo de
 * recuperación; Ruta B suma una sesión de Zona 2 orientada a quemar grasa. */
export function recuperacionActivaDeHoy(meta: Meta): RecuperacionActiva {
  return {
    pasosObjetivo: '7.000–10.000 pasos',
    cardioExtra:
      meta === 'grasa'
        ? { ...CARDIO_ZONA2, titulo: 'Zona 2 extra', duracion: '30-60 min · orientado a quema de grasa', opcional: true }
        : undefined,
  };
}

// Catálogo real del programa de 90 días — Sesión 8. Dentro de cada día el
// ORDEN importa: primero el grupo muscular más grande/el compuesto (ej.
// pecho antes que tríceps, press plano antes que aperturas), los aislados y
// accesorios van al final. Este orden viene tal cual de la guía original y
// no se debe reordenar sin ese mismo criterio (músculo mayor → menor,
// compuesto → aislado).
const CATALOGO: Record<string, Ejercicio> = {
  sentadilla_barra: { id: 'sentadilla_barra', nombre: 'Sentadilla con barra', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/sentadilla-barra.jpg', avanzado: true, series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'prensa_inclinada' },
  peso_muerto_barra: { id: 'peso_muerto_barra', nombre: 'Peso muerto con barra', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/peso-muerto-barra.jpg', avanzado: true, series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'curl_femoral_maquina' },
  prensa_inclinada: { id: 'prensa_inclinada', nombre: 'Prensa inclinada', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/prensa-inclinada.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'sentadilla_barra' },
  extension_cuadriceps: { id: 'extension_cuadriceps', nombre: 'Extensión de cuádriceps', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/extension-cuadriceps.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'prensa_inclinada' },
  aductor_externo: { id: 'aductor_externo', nombre: 'Aductor externo (máquina)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-externo.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_interno' },
  aductor_interno: { id: 'aductor_interno', nombre: 'Aductor interno (máquina)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-interno.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_externo' },
  elevacion_talon: { id: 'elevacion_talon', nombre: 'Elevación de talón (de pie)', grupo: 'Pierna', grupoMuscular: 'pantorrilla', imagenExplicacion: '/explicaciones/elevacion-talon.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'extension_cuadriceps' },
  hip_thrust_barra: { id: 'hip_thrust_barra', nombre: 'Hip thrust con barra', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/hip-thrust-barra.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '2-1-1', alternativaId: 'peso_muerto_barra' },
  curl_femoral_maquina: { id: 'curl_femoral_maquina', nombre: 'Curl femoral (máquina)', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/curl-femoral-maquina.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'peso_muerto_barra' },
  crunch_lateral_inclinado: { id: 'crunch_lateral_inclinado', nombre: 'Crunch lateral inclinado', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-lateral-inclinado.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },
  elevacion_piernas: { id: 'elevacion_piernas', nombre: 'Elevación de piernas', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/elevacion-piernas.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },

  press_banco_mancuernas: { id: 'press_banco_mancuernas', nombre: 'Press de banco plano con mancuernas', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-banco-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_inclinado_mancuerna' },
  press_inclinado_mancuerna: { id: 'press_inclinado_mancuerna', nombre: 'Press inclinado con mancuerna', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-inclinado-mancuerna.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_banco_mancuernas' },
  aperturas_maquina: { id: 'aperturas_maquina', nombre: 'Aperturas en máquina', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/aperturas-maquina.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'crossover_polea_alta' },
  crossover_polea_alta: { id: 'crossover_polea_alta', nombre: 'Crossover en polea alta', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/crossover-polea-alta.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aperturas_maquina' },
  press_frances_barra_z: { id: 'press_frances_barra_z', nombre: 'Press francés con barra Z', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/press-frances-barra-z.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'extension_triceps_copa' },
  extension_triceps_copa: { id: 'extension_triceps_copa', nombre: 'Extensión de tríceps (copa)', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/extension-triceps-copa.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'press_frances_barra_z' },
  press_militar_barra: { id: 'press_militar_barra', nombre: 'Press militar con barra', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/press-militar-barra.jpg', avanzado: true, series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'elevaciones_laterales_mancuernas' },

  remo_barra: { id: 'remo_barra', nombre: 'Remo con barra', grupo: 'Espalda', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/remo-barra.jpg', avanzado: true, series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'remo_cerrado_maquina' },
  jalon_pecho: { id: 'jalon_pecho', nombre: 'Jalón de pecho', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho.jpg', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho_cerrado_neutro' },
  remo_cerrado_maquina: { id: 'remo_cerrado_maquina', nombre: 'Remo cerrado en máquina', grupo: 'Espalda', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/remo-cerrado-maquina.jpg', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_barra' },
  jalon_pecho_cerrado_neutro: { id: 'jalon_pecho_cerrado_neutro', nombre: 'Jalón de pecho cerrado neutro', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho-cerrado-neutro.jpg', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho' },
  curl_barra: { id: 'curl_barra', nombre: 'Curl con barra', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-barra.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_supinacion_maquina' },
  curl_supinacion_maquina: { id: 'curl_supinacion_maquina', nombre: 'Curl supinación en máquina', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-supinacion-maquina.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_barra' },
  pajaros_pie_mancuerna: { id: 'pajaros_pie_mancuerna', nombre: 'Pájaros de pie con mancuerna', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/pajaros-pie-mancuerna.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_mancuernas' },
  elevaciones_laterales_mancuernas: { id: 'elevaciones_laterales_mancuernas', nombre: 'Elevaciones laterales con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevaciones-laterales-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'pajaros_pie_mancuerna' },
  plancha_abdominal: { id: 'plancha_abdominal', nombre: 'Plancha abdominal', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/plancha-abdominal.jpg', series: 3, reps: '30-60 seg', descansoSeg: 45, tempo: 'isométrico', alternativaId: 'crunch_lateral_inclinado' },

  elevacion_frontal_mancuernas: { id: 'elevacion_frontal_mancuernas', nombre: 'Elevación frontal con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevacion-frontal-mancuernas.jpg', series: 4, reps: '8-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_mancuernas' },
  encogimientos_mancuernas: { id: 'encogimientos_mancuernas', nombre: 'Encogimientos con mancuernas', grupo: 'Trapecio', grupoMuscular: 'trapecio', imagenExplicacion: '/explicaciones/encogimientos-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevacion_frontal_mancuernas' },
  crunch_superior_horizontal: { id: 'crunch_superior_horizontal', nombre: 'Crunch superior horizontal (máquina)', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-superior-horizontal.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_lateral_inclinado' },
  lumbares_maquina: { id: 'lumbares_maquina', nombre: 'Lumbares (máquina)', grupo: 'Espalda baja', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/lumbares.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },
};

/** Alterna hombre/mujer entre ejercicios de forma ESTABLE (nunca al azar: el
 * mismo ejercicio siempre muestra el mismo género) — a pedido explícito del
 * usuario ("alternando... hombre, luego mujer, luego hombre..."). Se basa en
 * la posición del ejercicio dentro del catálogo completo. Hoy es solo un
 * respaldo (todos los ejercicios del programa ya traen su imagen real). */
export function generoIlustracion(id: string): 'masculino' | 'femenino' {
  const indice = Object.keys(CATALOGO).indexOf(id);
  return indice % 2 === 0 ? 'masculino' : 'femenino';
}

// SPLIT semanal — reestructurado 03/09/2026 a especificación exacta del
// usuario (arquitectura "REAL FISIC"): cada grupo muscular vive en UN solo
// día (antes cuádriceps e isquios/glúteos se mezclaban lunes+jueves). El
// orden de cada arreglo es el orden en que se entrenan: músculo grande/
// compuesto primero, aislados y accesorios después.
const SPLIT: Record<DiaSemana, string[]> = {
  // Día 1 — pierna (cuádriceps) y abdomen.
  lunes: ['sentadilla_barra', 'prensa_inclinada', 'extension_cuadriceps', 'aductor_externo', 'aductor_interno', 'elevacion_talon', 'crunch_lateral_inclinado'],
  // Día 2 — empuje: pecho, hombro anterior y tríceps (+ cardio por ruta, ver cardioDeHoy).
  martes: ['press_banco_mancuernas', 'press_inclinado_mancuerna', 'aperturas_maquina', 'crossover_polea_alta', 'press_militar_barra', 'press_frances_barra_z', 'extension_triceps_copa'],
  // Día 3 — tracción: dorsales, bíceps, trapecio y deltoides posterior + abdomen.
  miercoles: ['remo_barra', 'jalon_pecho', 'remo_cerrado_maquina', 'jalon_pecho_cerrado_neutro', 'curl_barra', 'curl_supinacion_maquina', 'pajaros_pie_mancuerna', 'encogimientos_mancuernas', 'plancha_abdominal'],
  // Día 4 — recuperación activa: SIN pesas (ver recuperacionActivaDeHoy).
  jueves: [],
  // Día 5 — pierna (isquiotibiales y glúteos), cadena posterior.
  viernes: ['peso_muerto_barra', 'hip_thrust_barra', 'curl_femoral_maquina', 'elevacion_piernas'],
  // Día 6 — tren superior híbrido (empuje/tracción), sin piernas, menor carga articular.
  sabado: ['crossover_polea_alta', 'jalon_pecho', 'remo_cerrado_maquina', 'jalon_pecho_cerrado_neutro', 'elevacion_frontal_mancuernas', 'crunch_superior_horizontal', 'lumbares_maquina'],
  // Día 7 — descanso hormonal.
  domingo: [],
};

export function diaSemanaDeHoy(diaActual: number): DiaSemana {
  return ORDEN_DIAS[(diaActual - 1) % ORDEN_DIAS.length];
}

export function nombreDeHoy(diaActual: number): string {
  return NOMBRE_DIA[diaSemanaDeHoy(diaActual)];
}

export function calentamientoDeHoy(diaActual: number): TrenCalentamiento | null {
  return CALENTAMIENTO_DIA[diaSemanaDeHoy(diaActual)];
}

export function esDiaDeDescanso(diaActual: number): boolean {
  return diaSemanaDeHoy(diaActual) === 'domingo';
}

/** Día 4 del split — recuperación activa (pasos o cardio suave), nunca pesas.
 * Distinto de `esDiaDeDescanso` (domingo, descanso total). */
export function esDiaDeRecuperacionActiva(diaActual: number): boolean {
  return diaSemanaDeHoy(diaActual) === 'jueves';
}

/** En Ruta Principiante, cada ejercicio `avanzado` (barra libre) se
 * sustituye por su alternativa guiada y las series bajan en 1 (piso de 3) —
 * misma sesión, menos exigencia técnica el primer tramo. Ruta Intermedio (o
 * sin nivel, por compatibilidad) usa el catálogo tal cual. */
export function ejerciciosDeHoy(diaActual: number, nivel: Nivel = 'intermedio'): Ejercicio[] {
  const dia = diaSemanaDeHoy(diaActual);
  return SPLIT[dia].map((id) => {
    const ejercicio = CATALOGO[id];
    if (nivel !== 'principiante') return ejercicio;
    const base = ejercicio.avanzado ? CATALOGO[ejercicio.alternativaId] : ejercicio;
    return { ...base, series: Math.max(3, base.series - 1) };
  });
}

/** Ejercicio de respaldo para ids que ya no existen en el catálogo actual —
 * pasa esto SIEMPRE que el catálogo cambie (como en la Sesión 8, al
 * reemplazar el catálogo de relleno por la rutina real): un usuario con
 * historial de antes tiene logs con ids viejos (ej. 'press_banca',
 * 'sentadilla'), y sin este respaldo `obtenerEjercicio` devolvía `undefined`
 * — Historial explotaba con "Cannot read properties of undefined" al
 * intentar leer `.nombre` de un ejercicio que ya no está. */
const EJERCICIO_DESCONOCIDO: Ejercicio = {
  id: '_desconocido',
  nombre: 'Ejercicio anterior',
  grupo: '—',
  grupoMuscular: 'core',
  series: 0,
  reps: '—',
  descansoSeg: 0,
  tempo: '—',
  alternativaId: '_desconocido',
};

export function obtenerEjercicio(id: string): Ejercicio {
  return CATALOGO[id] ?? EJERCICIO_DESCONOCIDO;
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
  /** Nivel (principiante/intermedio) y meta (músculo/grasa) — antes vivían
   * SOLO en `RespuestasOnboarding` (sessionStorage, se borra al cerrar el
   * navegador o cambiar de dispositivo). Bug real encontrado 03/09/2026: un
   * usuario que iniciaba sesión en un navegador nuevo veía su ruta
   * reseteada a Principiante/Ganar músculo sin importar lo que eligió.
   * Ahora viven aquí, junto al resto del progreso que sí persiste
   * (localStorage + Supabase) — y el usuario los puede cambiar en Perfil
   * cuando quiera (ver `cambiarRuta`). */
  nivel: Nivel;
  meta: Meta;
  /** Mismo bug de nivel/meta (arriba): antes solo vivía en
   * `RespuestasOnboarding` (sessionStorage), así que el entrenador animado de
   * "Plan del día" podía mostrar el género equivocado a alguien que entraba
   * desde una sesión/dispositivo nuevo. Ahora persiste aquí. */
  sexo: Sexo;
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
  /** Si al terminar el descanso suena una notificación (además de vibrar).
   * Encendido por defecto; el usuario lo puede apagar. */
  sonidoDescanso: boolean;
  /** Peso corporal en kg — lo único que falta para calcular las macros de
   * Ruta A/Ruta B (ver lib/macros.ts). null hasta que el usuario lo ingresa
   * en Perfil; no se le pide durante el onboarding. Nota: esto es SIEMPRE
   * en kg (las fórmulas de macros del ebook son por kg) — no confundir con
   * `unidadPeso`, que es la unidad del peso LEVANTADO en el gimnasio. */
  pesoKg: number | null;
  /** Unidad en la que el usuario registra el peso que levanta en cada serie
   * (no toda la gente entrena en kg). Default 'lb' a pedido explícito del
   * usuario; se puede cambiar en Perfil en cualquier momento. */
  unidadPeso: 'kg' | 'lb';
  /** Estatura en cm y edad — junto con pesoKg y el sexo del onboarding,
   * completan los datos de la ecuación Mifflin-St Jeor para calcular el
   * gasto calórico real (ver lib/macros.ts). null hasta que el usuario los
   * ingresa en Perfil. */
  estaturaCm: number | null;
  edad: number | null;
  /** Peso corporal la PRIMERA vez que el usuario lo registró — nunca se
   * sobrescribe (ver `registrarMedidasIniciales`). Es la base para medir
   * progreso real: Ruta A compara `pesoKg` contra esto para mostrar cuánto
   * subió (300-800 g/mes es la señal de éxito); sin este ancla, cada edición
   * de peso "resetea" el progreso visible. */
  pesoInicialKg: number | null;
  /** Cintura en cm — la métrica de progreso de Ruta B (bajar grasa): ahí el
   * objetivo es MANTENER las cargas, así que el progreso real se ve en
   * centímetros, no en peso levantado. null hasta que el usuario la ingresa
   * en Perfil (solo se pide para Ruta B). */
  cinturaCm: number | null;
  /** Cintura la PRIMERA vez registrada — mismo ancla que `pesoInicialKg`. */
  cinturaInicialCm: number | null;
  /** Fecha (YYYY-MM-DD) de la primera medida registrada (peso o cintura) —
   * para poder decir "desde el [fecha]" en el progreso, no solo "un cambio". */
  fechaInicioMedidas: string | null;
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
    return { nivel: 'principiante', meta: 'musculo', sexo: 'hombre', diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: true, descansoDuracionSeg: 60, sonidoDescanso: true, pesoKg: null, unidadPeso: 'lb', estaturaCm: null, edad: null, pesoInicialKg: null, cinturaCm: null, cinturaInicialCm: null, fechaInicioMedidas: null };
  }
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    // Primera vez: si el onboarding ya se completó en esta sesión, hereda
    // su nivel/meta (evita que el primer progreso guardado nazca con los
    // valores por defecto pisando lo que el usuario acaba de elegir).
    const respuestas = leerRespuestas();
    const inicial: Progreso = { nivel: respuestas?.nivel ?? 'principiante', meta: respuestas?.meta ?? 'musculo', sexo: respuestas?.sexo ?? 'hombre', diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: true, descansoDuracionSeg: 60, sonidoDescanso: true, pesoKg: null, unidadPeso: 'lb', estaturaCm: null, edad: null, pesoInicialKg: null, cinturaCm: null, cinturaInicialCm: null, fechaInicioMedidas: null };
    localStorage.setItem(KEY, JSON.stringify(inicial));
    return inicial;
  }
  const p = JSON.parse(raw) as Progreso;
  // Compatibilidad con progreso guardado antes de este campo.
  if (p.nivel === undefined) p.nivel = leerRespuestas()?.nivel ?? 'principiante';
  if (p.meta === undefined) p.meta = leerRespuestas()?.meta ?? 'musculo';
  if (p.sexo === undefined) p.sexo = leerRespuestas()?.sexo ?? 'hombre';
  if (p.descansoAutomatico === undefined) p.descansoAutomatico = true;
  if (p.descansoDuracionSeg === undefined) p.descansoDuracionSeg = 60;
  if (p.sonidoDescanso === undefined) p.sonidoDescanso = true;
  if (p.pesoKg === undefined) p.pesoKg = null;
  if (p.unidadPeso === undefined) p.unidadPeso = 'lb';
  if (p.estaturaCm === undefined) p.estaturaCm = null;
  if (p.edad === undefined) p.edad = null;
  if (p.pesoInicialKg === undefined) p.pesoInicialKg = null;
  if (p.cinturaCm === undefined) p.cinturaCm = null;
  if (p.cinturaInicialCm === undefined) p.cinturaInicialCm = null;
  if (p.fechaInicioMedidas === undefined) p.fechaInicioMedidas = null;
  // Si cambió el día calendario desde el último completado y ya se había marcado
  // "hechosHoy", se limpia para el nuevo día (pero SIN romper la racha: eso solo
  // pasa si pasan ≥2 días sin completar, ver `racha en riesgo/rota` abajo).
  if (p.ultimaFecha && p.ultimaFecha !== hoyISO() && p.hechosHoy.length > 0) {
    p.hechosHoy = [];
    p.reemplazosHoy = {};
  }
  return p;
}

/** Cambia nivel y/o meta — a pedido explícito del usuario ("no siempre va a
 * querer hacer lo mismo, o cambiará de parecer"). Editable en Perfil en
 * cualquier momento; la pantalla que llama esto es responsable de pedir
 * confirmación primero (es un cambio real de plan, no un ajuste menor). */
export function cambiarRuta(p: Progreso, nivel: Nivel, meta: Meta): Progreso {
  return { ...p, nivel, meta };
}

/** Fija el ANCLA de progreso la primera vez que se registra peso y/o
 * cintura — nunca la sobrescribe después, aunque el usuario edite el valor
 * actual muchas veces. Sin este ancla, cada edición de Perfil "resetearía"
 * el progreso visible en Historial (ver `pesoInicialKg`/`cinturaInicialCm`). */
export function registrarMedidasIniciales(p: Progreso, nuevoPesoKg: number | null, nuevaCinturaCm: number | null): Progreso {
  const next = { ...p, pesoKg: nuevoPesoKg, cinturaCm: nuevaCinturaCm };
  if (next.pesoInicialKg === null && nuevoPesoKg !== null) next.pesoInicialKg = nuevoPesoKg;
  if (next.cinturaInicialCm === null && nuevaCinturaCm !== null) next.cinturaInicialCm = nuevaCinturaCm;
  if (next.fechaInicioMedidas === null && (nuevoPesoKg !== null || nuevaCinturaCm !== null)) next.fechaInicioMedidas = hoyISO();
  return next;
}

export function guardarProgreso(p: Progreso) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function marcarHecho(p: Progreso, ejercicioId: string): Progreso {
  if (p.hechosHoy.includes(ejercicioId)) return p;
  return { ...p, hechosHoy: [...p.hechosHoy, ejercicioId] };
}

/** Cuántas de las series de HOY ya se registraron para este ejercicio — el
 * registro real es serie por serie (peso y reps pueden cambiar de una serie
 * a otra), no un solo tap que da por hecho las 4 de una vez. */
export function seriesHechasHoy(p: Progreso, ejercicioId: string): number {
  const hoy = hoyISO();
  return p.logs.filter((l) => l.ejercicioId === ejercicioId && l.fecha === hoy).length;
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
