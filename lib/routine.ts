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
  /** Guía detallada opcional (plantilla premium, 14/09/2026): cuando existe,
   * el modal de "Explicación del ejercicio" reemplaza la ilustración de
   * ancho completo por texto real (Indicaciones, Músculos trabajados,
   * Consejo técnico) + la ilustración se estira (object-fit:cover) para
   * llenar exactamente el espacio que sobra antes del botón — así nunca
   * queda espacio muerto sin importar cuánto texto tenga cada ejercicio.
   * Sin esta guía, el ejercicio sigue mostrando solo `imagenExplicacion` a
   * ancho completo como antes (migración incremental, sin romper nada). */
  guia?: {
    indicaciones: string[];
    musculos: { nombre: string; principal?: boolean }[];
    consejoTecnico: string;
  };
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
  martes: 'Empuje (pecho, hombro y tríceps)',
  miercoles: 'Tracción (espalda, bíceps y hombro)',
  jueves: 'Recuperación activa',
  viernes: 'Pierna (isquiotibiales y glúteos)',
  sabado: 'Tren superior híbrido (pecho, espalda y hombro)',
  domingo: 'Descanso hormonal',
};

export const CALENTAMIENTO_IMG: Record<TrenCalentamiento, string> = {
  superior: '/explicaciones/calentamiento-tren-superior.png',
  inferior: '/explicaciones/calentamiento-tren-inferior.png',
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

// ── Ruta Principiante (15/09/2026) — rutina propia dada a especificación
// exacta por el usuario (JSON "app_config"/"rutina_semanal"): calendario de 6
// días con cardio TODOS los días de pesas (no solo martes/jueves como en
// Ruta Intermedio) y SIN sustitución de ejercicios avanzados — a un
// principiante se le enseña la técnica del ejercicio real (sentadilla, peso
// muerto, press militar) desde el día 1, con las notas técnicas de `guia`;
// que un ejercicio use barra libre o máquina no depende del nivel del
// usuario. Nivel Intermedio sigue con el split "REAL FISIC" de arriba, sin
// cambios (pendiente: aplicar la misma actualización a Intermedio más
// adelante, ver ESTADO.md).
const NOMBRE_DIA_PRINCIPIANTE: Record<DiaSemana, string> = {
  lunes: 'Pierna completa',
  martes: 'Pecho, tríceps y hombro',
  miercoles: 'Espalda, bíceps y glúteo',
  jueves: 'Pierna (énfasis glúteo)',
  viernes: 'Pecho y espalda',
  sabado: 'Full body',
  domingo: 'Descanso',
};

/** Calentamiento por día: depende de qué se entrena hoy, no es fijo — un día
 * de pierna calienta tren inferior, uno de empuje/tracción calienta tren
 * superior, y sábado (full body) calienta como pierna porque arranca con
 * sentadilla (mismo criterio que Ruta Intermedio arriba). */
const CALENTAMIENTO_DIA_PRINCIPIANTE: Record<DiaSemana, TrenCalentamiento | null> = {
  lunes: 'inferior', // pierna completa
  martes: 'superior', // pecho, tríceps, hombro
  miercoles: 'superior', // espalda, bíceps (aunque incluye hip thrust, el grueso es tren superior)
  jueves: 'inferior', // pierna, énfasis glúteo
  viernes: 'superior', // pecho y espalda
  sabado: 'inferior', // full body, arranca con sentadilla
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

/** Cardio de cada día para Ruta Principiante — a diferencia de Ruta
 * Intermedio, aquí NO depende de la meta (Hipertrofia/Pérdida de grasa): el
 * mismo tipo y duración de cardio aplica a ambas rutas, tal como especifica
 * el JSON del usuario (lo que cambia por meta es solo nutrición y manejo de
 * cargas, no el cardio). Sábado es "a elección" del usuario según su fatiga
 * acumulada — se marca `opcional` para que la UI lo deje claro. */
const CARDIO_DIA_PRINCIPIANTE: Record<DiaSemana, CardioDelDia | null> = {
  lunes: { ...CARDIO_ZONA2, duracion: '30-40 min · intensidad moderada (60-70% FCM)' },
  martes: { ...CARDIO_HIIT, duracion: '15-20 min · intervalos intensos (30s sprint / 1 min descanso)' },
  miercoles: { ...CARDIO_ZONA2, duracion: '30 min · ritmo suave para recuperación activa metabólica' },
  jueves: { ...CARDIO_ZONA2, duracion: '40 min · caminar o trotar a 60-70% FCM, ritmo sostenido' },
  viernes: { ...CARDIO_HIIT, duracion: '15-20 min · intervalos extremos (30s máximo / 1 min descanso)' },
  sabado: { ...CARDIO_ZONA2, titulo: 'Cardio a elección (HIIT o Zona 2)', duracion: '15-30 min · según tu fatiga acumulada en la semana', opcional: true },
  domingo: null,
};

/** El cardio del Día 2 (empuje) cambia según la ruta — a especificación
 * exacta del usuario: Zona 2 para no interferir con el volumen muscular en
 * Ruta A (ganar músculo), HIIT para acelerar el metabolismo en Ruta B (bajar
 * grasa). Los demás días de pesas no llevan cardio (solo Día 2 y Día 4).
 * Ruta Principiante usa `CARDIO_DIA_PRINCIPIANTE` en su lugar (cardio todos
 * los días de pesas, igual para ambas metas). */
export function cardioDeHoy(diaActual: number, meta: Meta, nivel: Nivel = 'intermedio'): CardioDelDia | null {
  const dia = diaSemanaDeHoy(diaActual);
  if (nivel === 'principiante') return CARDIO_DIA_PRINCIPIANTE[dia];
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
 * recuperación; Ruta B suma una sesión de Zona 2 orientada a quemar grasa.
 * Solo aplica a Ruta Intermedio — en Ruta Principiante el jueves es un día
 * de pesas real (pierna, énfasis glúteo), nunca dispara esta función (ver
 * `esDiaDeRecuperacionActiva`). */
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
  sentadilla_barra: { id: 'sentadilla_barra', nombre: 'Sentadilla con barra', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/sentadilla-barra.png', series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'prensa_inclinada', guia: {
    indicaciones: [
      'Posiciona la barra sobre los trapecios.',
      'Mantén la espalda recta y el core activado.',
      'Desciende flexionando caderas y rodillas.',
      'Sube empujando desde los talones.',
    ],
    musculos: [
      { nombre: 'Glúteo mayor', principal: true },
      { nombre: 'Cuádriceps femoral', principal: true },
    ],
    consejoTecnico: 'Mantén el pecho arriba y las rodillas alineadas con las puntas de los pies.',
  } },
  peso_muerto_barra: { id: 'peso_muerto_barra', nombre: 'Peso muerto con barra', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/peso-muerto-barra.png', series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'curl_femoral_maquina', guia: {
    indicaciones: [
      'Posiciona los pies a la anchura de las caderas con la barra sobre la mitad de los pies.',
      'Sujeta la barra con agarre prono o mixto, flexiona rodillas y caderas hasta que las espinillas toquen la barra.',
      'Mantén el pecho erguido y la columna neutral.',
      'Extiende caderas y rodillas simultáneamente, levantando la barra en línea recta y cerca de las piernas.',
      'Ponte de pie por completo con caderas y rodillas extendidas, hombros atrás y pecho arriba.',
    ],
    musculos: [
      { nombre: 'Glúteos', principal: true },
      { nombre: 'Isquiotibiales', principal: true },
    ],
    consejoTecnico: 'Mantén la columna neutral en todo momento para evitar lesiones lumbares. No redondees la espalda.',
  } },
  prensa_inclinada: { id: 'prensa_inclinada', nombre: 'Prensa inclinada', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/prensa-inclinada.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'sentadilla_barra', guia: {
    indicaciones: [
      'Ajusta el respaldo y coloca los pies al ancho de los hombros sobre la plataforma.',
      'Desciende hasta formar 90° en la rodilla, controlando el descenso.',
      'Empuja desde los talones para subir, sin bloquear las rodillas al extender.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteo', principal: false }],
    consejoTecnico: 'Desciende hasta 90°. No bloquear rodillas al extender.',
  } },
  extension_cuadriceps: { id: 'extension_cuadriceps', nombre: 'Extensión de cuádriceps', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/extension-cuadriceps.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'prensa_inclinada', guia: {
    indicaciones: [
      'Siéntate con la espalda apoyada firmemente en el respaldo.',
      'Extiende ambas piernas hasta casi bloquear la rodilla.',
      'Baja el peso de forma controlada, sin dejarlo caer.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }],
    consejoTecnico: 'Espalda apoyada firmemente en el respaldo durante todo el movimiento.',
  } },
  aductor_externo: { id: 'aductor_externo', nombre: 'Aductor externo (máquina)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-externo.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_interno', guia: {
    indicaciones: [
      'Siéntate con las piernas juntas contra las almohadillas.',
      'Empuja las piernas hacia afuera de forma controlada.',
      'Haz una pausa breve en el punto de máxima apertura.',
    ],
    musculos: [{ nombre: 'Glúteo medio', principal: true }, { nombre: 'Abductores', principal: true }],
    consejoTecnico: 'Pausa en el punto de contracción máxima antes de volver.',
  } },
  aductor_interno: { id: 'aductor_interno', nombre: 'Aductor interno (máquina)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-interno.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_externo', guia: {
    indicaciones: [
      'Siéntate con las piernas abiertas contra las almohadillas.',
      'Cierra las piernas hacia el centro de forma controlada.',
      'Haz una pausa breve en el punto de máxima contracción.',
    ],
    musculos: [{ nombre: 'Aductores', principal: true }],
    consejoTecnico: 'Pausa en el punto de contracción máxima antes de volver.',
  } },
  elevacion_talon: { id: 'elevacion_talon', nombre: 'Elevación de talón (de pie)', grupo: 'Pierna', grupoMuscular: 'pantorrilla', imagenExplicacion: '/explicaciones/elevacion-talon.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'extension_cuadriceps', guia: {
    indicaciones: [
      'De pie sobre la plataforma, con los talones colgando del borde.',
      'Sube lo más alto posible apoyándote en las puntas de los pies.',
      'Baja hasta sentir un estiramiento completo en la pantorrilla.',
    ],
    musculos: [{ nombre: 'Gastrocnemio', principal: true }, { nombre: 'Sóleo', principal: false }],
    consejoTecnico: 'Movimiento completo fluido, sin balanceo del cuerpo.',
  } },
  hip_thrust_barra: { id: 'hip_thrust_barra', nombre: 'Hip thrust con barra', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/hip-thrust-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '2-1-1', alternativaId: 'peso_muerto_barra', guia: {
    indicaciones: [
      'Apoya la parte alta de la espalda en el banco y coloca la barra sobre las caderas.',
      'Mantén los pies firmes en el suelo a la anchura de las caderas.',
      'Eleva las caderas apretando los glúteos hasta alinear el cuerpo.',
      'Baja lentamente la barra hacia la posición inicial.',
    ],
    musculos: [{ nombre: 'Glúteos', principal: true }],
    consejoTecnico: 'Contracción de un segundo arriba, sin arquear la zona lumbar en exceso.',
  } },
  curl_femoral_maquina: { id: 'curl_femoral_maquina', nombre: 'Curl femoral (máquina)', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/curl-femoral-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'peso_muerto_barra', guia: {
    indicaciones: [
      'Acuéstate boca abajo con la cadera y el torso pegados al respaldo.',
      'Flexiona las rodillas llevando el rodillo hacia los glúteos.',
      'Baja controladamente sin dejar caer el peso.',
    ],
    musculos: [{ nombre: 'Isquiotibiales', principal: true }],
    consejoTecnico: 'Cadera y torso pegados al respaldo para evitar balanceo.',
  } },
  crunch_lateral_inclinado: { id: 'crunch_lateral_inclinado', nombre: 'Crunch lateral inclinado', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-lateral-inclinado.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal', guia: {
    indicaciones: [
      'Recuéstate en una banca inclinada con las manos detrás de la cabeza.',
      'Sube el torso girando hacia un lado, contrayendo el oblicuo.',
      'Baja controladamente y alterna de lado.',
    ],
    musculos: [{ nombre: 'Oblicuos', principal: true }, { nombre: 'Recto abdominal', principal: false }],
    consejoTecnico: 'Enfoque en la contracción de los oblicuos, no en la velocidad.',
  } },
  elevacion_piernas: { id: 'elevacion_piernas', nombre: 'Elevación de piernas', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/elevacion-piernas.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },

  // Sin `guia` a propósito (15/09/2026): la imagen vieja de este ejercicio
  // mezcla texto e ilustración en el mismo layout (no se puede recortar solo
  // la ilustración sin cortar contenido real) — mostrar `guia` en vivo
  // duplicaría las indicaciones que ya están dibujadas dentro de la imagen.
  // Se agrega `guia` cuando llegue la ilustración nueva (ver ESTADO.md).
  press_banco_mancuernas: { id: 'press_banco_mancuernas', nombre: 'Press de banco plano con mancuernas', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-banco-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_inclinado_mancuerna' },
  press_inclinado_mancuerna: { id: 'press_inclinado_mancuerna', nombre: 'Press inclinado con mancuerna', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-inclinado-mancuerna.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_banco_mancuernas', guia: {
    indicaciones: [
      'Ajusta el respaldo del banco entre 30 y 45 grados.',
      'Baja las mancuernas de forma controlada hasta la parte superior del pecho.',
      'Empuja hacia arriba extendiendo los brazos por completo.',
    ],
    musculos: [{ nombre: 'Pectoral superior', principal: true }, { nombre: 'Deltoides anterior', principal: false }],
    consejoTecnico: 'Respaldo ajustado a 30-45 grados, ni más plano ni más vertical.',
  } },
  aperturas_maquina: { id: 'aperturas_maquina', nombre: 'Aperturas en máquina', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/aperturas-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'crossover_polea_alta', guia: {
    indicaciones: [
      'Siéntate con la espalda apoyada y sujeta las manijas con los codos ligeramente flexionados.',
      'Junta los brazos al frente del pecho en un arco controlado.',
      'Regresa lentamente sin dejar que el peso te jale de golpe.',
    ],
    musculos: [{ nombre: 'Pectoral', principal: true }],
    consejoTecnico: 'Controla el retorno para no forzar la articulación del hombro.',
  } },
  // Sin `guia` a propósito — mismo motivo que press_banco_mancuernas arriba.
  crossover_polea_alta: { id: 'crossover_polea_alta', nombre: 'Crossover en polea alta', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/crossover-polea-alta.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aperturas_maquina' },
  press_frances_barra_z: { id: 'press_frances_barra_z', nombre: 'Press francés con barra Z', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/press-frances-barra-z.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'extension_triceps_copa', guia: {
    indicaciones: [
      'Acostado en el banco, sujeta la barra Z con agarre cerrado sobre el pecho.',
      'Flexiona los codos bajando la barra hacia la frente, manteniéndolos cerrados.',
      'Extiende los brazos de vuelta sin mover los hombros.',
    ],
    musculos: [{ nombre: 'Tríceps', principal: true }],
    consejoTecnico: 'Codos cerrados apuntando hacia arriba durante todo el movimiento.',
  } },
  extension_triceps_copa: { id: 'extension_triceps_copa', nombre: 'Extensión de tríceps (copa)', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/extension-triceps-copa.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'press_frances_barra_z', guia: {
    indicaciones: [
      'Sentado o de pie, sujeta la mancuerna con ambas manos detrás de la cabeza.',
      'Extiende los brazos hacia arriba manteniendo los codos cerrados.',
      'Baja controladamente flexionando solo los codos.',
    ],
    musculos: [{ nombre: 'Tríceps', principal: true }],
    consejoTecnico: 'Core activado, espalda recta, codos cerrados durante todo el recorrido.',
  } },
  press_militar_barra: { id: 'press_militar_barra', nombre: 'Press militar con barra', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/press-militar-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'elevaciones_laterales_mancuernas', guia: {
    indicaciones: [
      'De pie o sentado, sujeta la barra a la altura de los hombros con agarre firme.',
      'Empuja la barra verticalmente hasta extender los brazos por completo.',
      'Baja controladamente hasta los hombros.',
    ],
    musculos: [{ nombre: 'Deltoides', principal: true }, { nombre: 'Tríceps', principal: false }],
    consejoTecnico: 'Postura firme, abdomen contraído, empuje vertical sin arquear la espalda.',
  } },

  remo_barra: { id: 'remo_barra', nombre: 'Remo con barra', grupo: 'Espalda', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/remo-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'remo_cerrado_maquina', guia: {
    indicaciones: [
      'Inclina el torso hacia adelante manteniendo la espalda recta.',
      'Sujeta la barra y jálala hacia la cintura apretando la espalda.',
      'Baja controladamente sin perder la postura.',
    ],
    musculos: [{ nombre: 'Dorsales', principal: true }, { nombre: 'Trapecio', principal: false }],
    consejoTecnico: 'Torso inclinado, espalda recta, jalar hacia la cintura.',
  } },
  jalon_pecho: { id: 'jalon_pecho', nombre: 'Jalón de pecho', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho.png', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho_cerrado_neutro', guia: {
    indicaciones: [
      'Sujeta la barra con agarre amplio, siéntate con las rodillas fijas.',
      'Saca el pecho y jala la barra hacia la parte alta del pecho activando los dorsales.',
      'Sube controladamente hasta extender los brazos.',
    ],
    musculos: [{ nombre: 'Dorsal ancho', principal: true }, { nombre: 'Bíceps', principal: false }],
    consejoTecnico: 'Saca el pecho, jala activando los dorsales, no solo los brazos.',
  } },
  remo_cerrado_maquina: { id: 'remo_cerrado_maquina', nombre: 'Remo cerrado en máquina', grupo: 'Espalda', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/remo-cerrado-maquina.png', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_barra', guia: {
    indicaciones: [
      'Siéntate con el pecho apoyado en el soporte de la máquina.',
      'Jala las manijas hacia el torso juntando los omóplatos al final.',
      'Regresa controladamente sin encorvar la espalda.',
    ],
    musculos: [{ nombre: 'Dorsales', principal: true }, { nombre: 'Trapecio medio', principal: false }],
    consejoTecnico: 'Pecho apoyado, juntar omóplatos al final del recorrido.',
  } },
  // Sin `guia` a propósito — mismo motivo que press_banco_mancuernas arriba.
  jalon_pecho_cerrado_neutro: { id: 'jalon_pecho_cerrado_neutro', nombre: 'Jalón de pecho cerrado neutro', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho-cerrado-neutro.jpg', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho' },
  curl_barra: { id: 'curl_barra', nombre: 'Curl con barra', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-barra.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_supinacion_maquina', guia: {
    indicaciones: [
      'De pie, sujeta la barra con agarre supino a la anchura de los hombros.',
      'Flexiona los codos subiendo la barra sin balancear el torso.',
      'Baja controladamente hasta extender los brazos.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }],
    consejoTecnico: 'Agarre supino, sin balancear el torso para ayudarte con impulso.',
  } },
  curl_supinacion_maquina: { id: 'curl_supinacion_maquina', nombre: 'Curl supinación en máquina', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-supinacion-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_barra', guia: {
    indicaciones: [
      'Siéntate con las axilas bien apoyadas en el banco de la máquina.',
      'Sujeta las manijas con agarre supino y flexiona los codos.',
      'Baja controladamente sin usar impulso.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }, { nombre: 'Braquial', principal: false }],
    consejoTecnico: 'Axilas bien apoyadas en el banco durante todo el recorrido.',
  } },
  pajaros_pie_mancuerna: { id: 'pajaros_pie_mancuerna', nombre: 'Pájaros de pie con mancuerna', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/pajaros-pie-mancuerna.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_mancuernas', guia: {
    indicaciones: [
      'De pie, inclina el torso hacia adelante manteniendo la espalda recta.',
      'Con las mancuernas, abre los brazos hacia los lados enfocando el deltoide posterior.',
      'Baja controladamente sin balancear el cuerpo.',
    ],
    musculos: [{ nombre: 'Deltoides posterior', principal: true }],
    consejoTecnico: 'Torso inclinado, enfoque en el deltoide posterior, no en subir el peso rápido.',
  } },
  // Sin `guia` a propósito — mismo motivo que press_banco_mancuernas arriba.
  elevaciones_laterales_mancuernas: { id: 'elevaciones_laterales_mancuernas', nombre: 'Elevaciones laterales con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevaciones-laterales-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'pajaros_pie_mancuerna' },
  plancha_abdominal: { id: 'plancha_abdominal', nombre: 'Plancha abdominal', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/plancha-abdominal.png', series: 3, reps: '30-60 seg', descansoSeg: 45, tempo: 'isométrico', alternativaId: 'crunch_lateral_inclinado', guia: {
    indicaciones: [
      'Apoya antebrazos y puntas de los pies en el suelo, cuerpo alineado de cabeza a talones.',
      'Aprieta el abdomen y los glúteos, sin dejar caer ni elevar la cadera.',
      'Mantén la posición durante el tiempo indicado, respirando de forma constante.',
    ],
    musculos: [{ nombre: 'Recto abdominal', principal: true }, { nombre: 'Core', principal: true }],
    consejoTecnico: 'Cuerpo alineado, abdomen apretado, 3 series de 45-60 segundos.',
  } },

  elevacion_frontal_mancuernas: { id: 'elevacion_frontal_mancuernas', nombre: 'Elevación frontal con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevacion-frontal-mancuernas.jpg', series: 4, reps: '8-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_mancuernas' },
  encogimientos_mancuernas: { id: 'encogimientos_mancuernas', nombre: 'Encogimientos con mancuernas', grupo: 'Trapecio', grupoMuscular: 'trapecio', imagenExplicacion: '/explicaciones/encogimientos-mancuernas.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevacion_frontal_mancuernas' },
  crunch_superior_horizontal: { id: 'crunch_superior_horizontal', nombre: 'Crunch superior horizontal (máquina)', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-superior-horizontal.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_lateral_inclinado' },
  lumbares_maquina: { id: 'lumbares_maquina', nombre: 'Lumbares (máquina)', grupo: 'Espalda baja', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/lumbares.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },

  // Ejercicios NUEVOS agregados 15/09/2026 con la rutina de Principiante (ver
  // ESTADO.md) — sin ilustración real todavía, usan la silueta de respaldo
  // (CuerpoMuscular) hasta que se genere el asset.
  zancadas: { id: 'zancadas', nombre: 'Zancadas', grupo: 'Pierna', grupoMuscular: 'cuadriceps', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'prensa_inclinada', guia: {
    indicaciones: [
      'Da un paso largo hacia adelante, bajando la rodilla trasera casi hasta el suelo.',
      'Mantén el torso erguido y controlado durante todo el movimiento.',
      'Empuja con la pierna delantera para volver a la posición inicial.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteo', principal: true }],
    consejoTecnico: 'Paso profundo, control del torso para mayor estabilidad.',
  } },
  extension_triceps_polea_alta: { id: 'extension_triceps_polea_alta', nombre: 'Extensión de tríceps en polea alta', grupo: 'Tríceps', grupoMuscular: 'triceps', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'extension_triceps_copa', guia: {
    indicaciones: [
      'De pie frente a la polea alta, sujeta la barra o cuerda con agarre firme.',
      'Extiende los codos hacia abajo manteniéndolos fijos a los costados del torso.',
      'Sube controladamente sin mover los hombros.',
    ],
    musculos: [{ nombre: 'Tríceps', principal: true }],
    consejoTecnico: 'Codos fijos a los costados del torso durante todo el recorrido.',
  } },
  curl_martillo_mancuernas: { id: 'curl_martillo_mancuernas', nombre: 'Curl martillo con mancuernas', grupo: 'Bíceps', grupoMuscular: 'biceps', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_supinacion_maquina', guia: {
    indicaciones: [
      'De pie, sujeta una mancuerna en cada mano con agarre neutro (palmas enfrentadas).',
      'Flexiona los codos subiendo el peso sin girar la muñeca.',
      'Baja controladamente hasta extender los brazos.',
    ],
    musculos: [{ nombre: 'Braquial', principal: true }, { nombre: 'Bíceps braquial', principal: false }],
    consejoTecnico: 'Agarre neutro para trabajar el braquial, sin balancear el torso.',
  } },
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

// SPLIT de Ruta Principiante (15/09/2026) — a especificación exacta del
// usuario, ver comentario de NOMBRE_DIA_PRINCIPIANTE arriba. Los ejercicios
// se usan TAL CUAL (barra libre incluida, con su `guia` de técnica): que un
// ejercicio requiera barra o máquina no depende del nivel del usuario.
// Repetir un id en más de un día es intencional (ej. `hip_thrust_barra` cae
// en miércoles Y jueves, `sentadilla_barra` en lunes, jueves Y sábado) — así
// lo pide el programa original, y como cada día se calcula por separado no
// genera ninguna tarjeta duplicada dentro del mismo día.
const SPLIT_PRINCIPIANTE: Record<DiaSemana, string[]> = {
  // Lunes — pierna completa.
  lunes: ['sentadilla_barra', 'prensa_inclinada', 'peso_muerto_barra', 'zancadas', 'extension_cuadriceps', 'curl_femoral_maquina', 'elevacion_talon'],
  // Martes — pecho, tríceps, hombro y abdomen.
  martes: ['press_banco_mancuernas', 'press_inclinado_mancuerna', 'aperturas_maquina', 'crossover_polea_alta', 'press_frances_barra_z', 'extension_triceps_copa', 'extension_triceps_polea_alta', 'elevaciones_laterales_mancuernas', 'crunch_superior_horizontal'],
  // Miércoles — espalda, bíceps, hombro posterior, glúteo y abdomen.
  miercoles: ['remo_barra', 'jalon_pecho', 'remo_cerrado_maquina', 'jalon_pecho_cerrado_neutro', 'curl_barra', 'curl_supinacion_maquina', 'curl_martillo_mancuernas', 'pajaros_pie_mancuerna', 'hip_thrust_barra', 'plancha_abdominal'],
  // Jueves — pierna con énfasis en glúteo.
  jueves: ['hip_thrust_barra', 'peso_muerto_barra', 'zancadas', 'sentadilla_barra', 'prensa_inclinada', 'aductor_externo', 'aductor_interno'],
  // Viernes — pecho, espalda y abdomen.
  viernes: ['press_banco_mancuernas', 'crossover_polea_alta', 'remo_barra', 'jalon_pecho', 'crunch_lateral_inclinado'],
  // Sábado — full body.
  sabado: ['sentadilla_barra', 'press_inclinado_mancuerna', 'remo_cerrado_maquina', 'press_militar_barra', 'curl_barra', 'extension_triceps_copa'],
  // Domingo — descanso.
  domingo: [],
};

export function diaSemanaDeHoy(diaActual: number): DiaSemana {
  return ORDEN_DIAS[(diaActual - 1) % ORDEN_DIAS.length];
}

export function nombreDeHoy(diaActual: number, nivel: Nivel = 'intermedio'): string {
  const dia = diaSemanaDeHoy(diaActual);
  return nivel === 'principiante' ? NOMBRE_DIA_PRINCIPIANTE[dia] : NOMBRE_DIA[dia];
}

export function calentamientoDeHoy(diaActual: number, nivel: Nivel = 'intermedio'): TrenCalentamiento | null {
  const dia = diaSemanaDeHoy(diaActual);
  return nivel === 'principiante' ? CALENTAMIENTO_DIA_PRINCIPIANTE[dia] : CALENTAMIENTO_DIA[dia];
}

export function esDiaDeDescanso(diaActual: number): boolean {
  return diaSemanaDeHoy(diaActual) === 'domingo';
}

/** Día 4 del split de Ruta Intermedio — recuperación activa (pasos o cardio
 * suave), nunca pesas. Distinto de `esDiaDeDescanso` (domingo, descanso
 * total). En Ruta Principiante NO existe día de recuperación activa: el
 * jueves es un día de pesas real (pierna, énfasis glúteo) — por eso siempre
 * devuelve `false` para ese nivel. */
export function esDiaDeRecuperacionActiva(diaActual: number, nivel: Nivel = 'intermedio'): boolean {
  if (nivel === 'principiante') return false;
  return diaSemanaDeHoy(diaActual) === 'jueves';
}

/** Ruta Principiante usa su propio split (`SPLIT_PRINCIPIANTE`) con los
 * ejercicios TAL CUAL vienen del programa — sin sustituir barra libre por
 * máquina, sin reducir series: el nivel del usuario no decide si un
 * ejercicio usa barra o no (ver ESTADO.md, 15/09/2026). Ruta Intermedio (o
 * sin nivel, por compatibilidad) sigue usando `SPLIT` tal cual. */
export function ejerciciosDeHoy(diaActual: number, nivel: Nivel = 'intermedio'): Ejercicio[] {
  const dia = diaSemanaDeHoy(diaActual);
  const split = nivel === 'principiante' ? SPLIT_PRINCIPIANTE : SPLIT;
  return split[dia].map((id) => CATALOGO[id]);
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

/** Último peso registrado para este ejercicio ANTES de hoy (pedido del
 * usuario: recordar en la primera serie qué peso se usó la última vez, para
 * no tener que adivinar o buscar en el historial). `logs` nunca se recorta,
 * así que basta con filtrar por fecha < hoy y tomar la más reciente. */
export function ultimoRegistro(p: Progreso, ejercicioId: string): RegistroLog | null {
  const hoy = hoyISO();
  const previos = p.logs.filter((l) => l.ejercicioId === ejercicioId && l.fecha < hoy);
  if (previos.length === 0) return null;
  return previos.reduce((mas, actual) => (actual.fecha >= mas.fecha ? actual : mas));
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

/** Racha en riesgo (M4 de 56): ya pasó ≥1 día completo sin entrenar y aún no
 * venció del todo. NUNCA en el día de descanso — ahí no hay nada que
 * registrar por diseño, así que "hechosHoy vacío" es lo normal, no una señal
 * de riesgo (bug real encontrado por el usuario: la llama salía en color de
 * alerta un domingo sin haber hecho nada mal). */
export function rachaEnRiesgo(p: Progreso): boolean {
  if (!p.ultimaFecha || p.racha === 0) return false;
  if (esDiaDeDescanso(p.diaActual)) return false;
  return diasEntre(p.ultimaFecha, hoyISO()) >= 1 && p.hechosHoy.length === 0;
}
