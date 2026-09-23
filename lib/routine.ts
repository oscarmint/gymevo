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
  /** El dueño indicó "sin variante" para este ejercicio (Plancha, Extensión de
   * cuádriceps): el Botón de Rescate no se muestra. `alternativaId` se
   * conserva solo porque el tipo lo exige. */
  sinRescate?: boolean;
}

/** Tren que se calienta antes del día — decide qué lámina de calentamiento
 * mostrar (ver CALENTAMIENTO_IMG). Sábado es full body pero empieza con
 * sentadilla, así que calienta como día de pierna. */
export type TrenCalentamiento = 'superior' | 'inferior';

/** Una sesión de entrenamiento. NO es un día de la semana: la persona entrena
 * cuando puede y el plan rota sesiones según los días que eligió (ver
 * CICLO_POR_DIAS). Las 6 primeras son el programa original de 6 días; las
 * demás son bloques nuevos para armar planes de 1 a 4 días. */
export type SesionBase = 'pierna_completa' | 'empuje' | 'traccion' | 'pierna_gluteo' | 'pecho_espalda' | 'full_body';

export type SesionId =
  | SesionBase
  | 'full_a'
  | 'full_b'
  | 'full_c'
  | 'torso_a'
  | 'torso_b'
  | 'extra_ligera';

export const CALENTAMIENTO_IMG: Record<TrenCalentamiento, string> = {
  superior: '/explicaciones/calentamiento-tren-superior.png',
  inferior: '/explicaciones/calentamiento-tren-inferior.png',
};

// ── Rutina 15/09/2026 — a especificación exacta del usuario (JSON
// "rutina_semanal" para Principiante y "rutina_semanal_intermedio" para
// Intermedio): mismo calendario de 6 días + mismo enfoque por día + mismo
// calentamiento para AMBAS rutas (reemplaza el split "REAL FISIC" anterior,
// que tenía un día de recuperación activa sin pesas — ya no existe: el
// jueves es un día de pierna real en las dos rutas). Lo que cambia entre
// Principiante e Intermedio es SOLO la selección/parámetros de ejercicios
// (ver SPLIT_PRINCIPIANTE / SPLIT_INTERMEDIO más abajo) y el cardio.
// Solo los músculos que se entrenan (pedido del usuario): nada de "Full body A" ni "Torso B".
const NOMBRE_DIA_RUTINA: Record<SesionId, string> = {
  pierna_completa: 'Pierna completa',
  empuje: 'Pecho, tríceps y hombro',
  traccion: 'Espalda, bíceps y glúteo',
  pierna_gluteo: 'Pierna (énfasis glúteo)',
  pecho_espalda: 'Pecho y espalda',
  full_body: 'Pierna, pecho, espalda, hombro y brazos',
  full_a: 'Pierna, pecho, espalda, hombro y abdomen',
  full_b: 'Pierna, glúteo, pecho, espalda, brazos y abdomen',
  full_c: 'Pierna, hombro, espalda, brazos y abdomen',
  torso_a: 'Pecho, espalda, hombro y brazos',
  torso_b: 'Pecho, espalda, hombro y brazos',
  extra_ligera: 'Abdomen y zona lumbar (ligero)',
};

/** Calentamiento por día: depende de qué se entrena hoy, no es fijo — un día
 * de pierna calienta tren inferior, uno de empuje/tracción calienta tren
 * superior, y sábado (full body) calienta como pierna porque arranca con
 * sentadilla. */
const CALENTAMIENTO_DIA_RUTINA: Record<SesionId, TrenCalentamiento | null> = {
  pierna_completa: 'inferior', // pierna completa
  empuje: 'superior', // pecho, tríceps, hombro
  traccion: 'superior', // espalda, bíceps (aunque incluye hip thrust, el grueso es tren superior)
  pierna_gluteo: 'inferior', // pierna, énfasis glúteo
  pecho_espalda: 'superior', // pecho y espalda
  full_body: 'inferior', // full body, arranca con sentadilla
  full_a: 'inferior', // full body: arranca con pierna
  full_b: 'inferior',
  full_c: 'inferior',
  torso_a: 'superior',
  torso_b: 'superior',
  extra_ligera: null,
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

/** Cardio de cada día para Ruta Principiante — NO depende de la meta
 * (Hipertrofia/Pérdida de grasa): el mismo tipo y duración de cardio aplica
 * a ambas metas, tal como especifica el JSON del usuario (lo que cambia por
 * meta es solo nutrición y manejo de cargas, no el cardio). Sábado es "a
 * elección" del usuario según su fatiga acumulada — se marca `opcional`
 * para que la UI lo deje claro. */
const CARDIO_DIA_PRINCIPIANTE: Record<SesionBase, CardioDelDia> = {
  pierna_completa: { ...CARDIO_ZONA2, duracion: '30-40 min · intensidad moderada (60-70% FCM)' },
  empuje: { ...CARDIO_HIIT, duracion: '15-20 min · intervalos intensos (30s sprint / 1 min descanso)' },
  traccion: { ...CARDIO_ZONA2, duracion: '30 min · ritmo suave para recuperación activa metabólica' },
  pierna_gluteo: { ...CARDIO_ZONA2, duracion: '40 min · caminar o trotar a 60-70% FCM, ritmo sostenido' },
  pecho_espalda: { ...CARDIO_HIIT, duracion: '15-20 min · intervalos extremos (30s máximo / 1 min descanso)' },
  full_body: { ...CARDIO_ZONA2, titulo: 'Cardio a elección (HIIT o Zona 2)', duracion: '15-30 min · según tu fatiga acumulada en la semana', opcional: true },
};

/** Cardio de cada día para Ruta Intermedio (15/09/2026) — mismo tipo/duración
 * que Principiante casi siempre, pero con las indicaciones EXACTAS que dio
 * el usuario para esta ruta (más orientadas a intensidad/RIR que a
 * principiante), y tampoco depende de la meta. Reemplaza la lógica anterior
 * (cardio solo el martes, Zona 2 o HIIT según meta). */
const CARDIO_DIA_INTERMEDIO: Record<SesionBase, CardioDelDia> = {
  pierna_completa: { ...CARDIO_ZONA2, duracion: '30-40 min · recuperación activa, 60-70% FCM' },
  empuje: { ...CARDIO_HIIT, duracion: '15-20 min · intervalos explosivos (30s al 90% / 1 min descanso activo)' },
  traccion: { ...CARDIO_ZONA2, duracion: '30 min · caminata o bicicleta ligera' },
  pierna_gluteo: { ...CARDIO_ZONA2, duracion: '40 min · ritmo sostenido, sin impacto' },
  pecho_espalda: { ...CARDIO_HIIT, duracion: '15-20 min · protocolo exigente para forzar adaptación cardiovascular' },
  full_body: { ...CARDIO_ZONA2, titulo: 'Cardio a elección (HIIT o Zona 2)', duracion: '15-30 min · autorregulación según la fatiga muscular acumulada', opcional: true },
};

/** Los bloques nuevos toman el cardio de la sesión original que más se parece
 * (misma intensidad y duración), para que ningún plan quede sin él. */
const CARDIO_COMO: Record<Exclude<SesionId, SesionBase>, SesionBase> = {
  full_a: 'pierna_completa',
  full_b: 'empuje',
  full_c: 'pierna_gluteo',
  torso_a: 'pecho_espalda',
  torso_b: 'traccion',
  extra_ligera: 'traccion',
};

function sesionBase(sesion: SesionId): SesionBase {
  return sesion in CARDIO_COMO ? CARDIO_COMO[sesion as keyof typeof CARDIO_COMO] : (sesion as SesionBase);
}

/** Cardio de la sesión — ninguna ruta lo hace depender de la meta
 * (Hipertrofia/Pérdida de grasa) desde el 15/09/2026: cada sesión trae su
 * propio tipo/duración/indicaciones fijas. */
export function cardioDeSesion(sesion: SesionId, nivel: Nivel): CardioDelDia {
  const base = sesionBase(sesion);
  return nivel === 'principiante' ? CARDIO_DIA_PRINCIPIANTE[base] : CARDIO_DIA_INTERMEDIO[base];
}

// Catálogo real del programa de 90 días — Sesión 8. Dentro de cada día el
// ORDEN importa: primero el grupo muscular más grande/el compuesto (ej.
// pecho antes que tríceps, press plano antes que aperturas), los aislados y
// accesorios van al final. Este orden viene tal cual de la guía original y
// no se debe reordenar sin ese mismo criterio (músculo mayor → menor,
// compuesto → aislado).
const CATALOGO: Record<string, Ejercicio> = {
  sentadilla_barra: { id: 'sentadilla_barra', nombre: 'Sentadilla con barra', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/sentadilla-barra.png', series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'sentadilla_smith', guia: {
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
  peso_muerto_barra: { id: 'peso_muerto_barra', nombre: 'Peso muerto con barra', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/peso-muerto-barra.png', series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'peso_muerto_rumano_kettlebell', guia: {
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
  prensa_inclinada: { id: 'prensa_inclinada', nombre: 'Prensa inclinada', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/prensa-inclinada.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'hack_inclinado', guia: {
    indicaciones: [
      'Ajusta el respaldo y coloca los pies al ancho de los hombros sobre la plataforma.',
      'Desciende hasta formar 90° en la rodilla, controlando el descenso.',
      'Empuja desde los talones para subir, sin bloquear las rodillas al extender.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteo', principal: false }],
    consejoTecnico: 'Desciende hasta 90°. No bloquear rodillas al extender.',
  } },
  extension_cuadriceps: { id: 'extension_cuadriceps', nombre: 'Extensión de cuádriceps', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/extension-cuadriceps.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'prensa_inclinada', sinRescate: true, guia: {
    indicaciones: [
      'Siéntate con la espalda apoyada firmemente en el respaldo.',
      'Extiende ambas piernas hasta casi bloquear la rodilla.',
      'Baja el peso de forma controlada, sin dejarlo caer.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }],
    consejoTecnico: 'Espalda apoyada firmemente en el respaldo durante todo el movimiento.',
  } },
  aductor_externo: { id: 'aductor_externo', nombre: 'Aductor externo (máquina sentado)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-externo.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_externo_polea', guia: {
    indicaciones: [
      'Siéntate con las piernas juntas contra las almohadillas.',
      'Empuja las piernas hacia afuera de forma controlada.',
      'Haz una pausa breve en el punto de máxima apertura.',
    ],
    musculos: [{ nombre: 'Glúteo medio', principal: true }, { nombre: 'Abductores', principal: true }],
    consejoTecnico: 'Pausa en el punto de contracción máxima antes de volver.',
  } },
  aductor_interno: { id: 'aductor_interno', nombre: 'Aductor interno (máquina sentado)', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-interno.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_interno_polea', guia: {
    indicaciones: [
      'Siéntate con las piernas abiertas contra las almohadillas.',
      'Cierra las piernas hacia el centro de forma controlada.',
      'Haz una pausa breve en el punto de máxima contracción.',
    ],
    musculos: [{ nombre: 'Aductores', principal: true }],
    consejoTecnico: 'Pausa en el punto de contracción máxima antes de volver.',
  } },
  elevacion_talon: { id: 'elevacion_talon', nombre: 'Elevación de talón de pie (máquina)', grupo: 'Pierna', grupoMuscular: 'pantorrilla', imagenExplicacion: '/explicaciones/elevacion-talon.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'elevacion_talon_sentado', guia: {
    indicaciones: [
      'De pie sobre la plataforma, con los talones colgando del borde.',
      'Sube lo más alto posible apoyándote en las puntas de los pies.',
      'Baja hasta sentir un estiramiento completo en la pantorrilla.',
    ],
    musculos: [{ nombre: 'Gastrocnemio', principal: true }, { nombre: 'Sóleo', principal: false }],
    consejoTecnico: 'Movimiento completo fluido, sin balanceo del cuerpo.',
  } },
  // Ejercicio nuevo (15/09/2026) — variante SENTADA: rodilla flexionada aísla
  // más el sóleo (a diferencia de la de pie, que enfatiza el gastrocnemio).
  // Ejercicio distinto por equipo/objetivo, no un reemplazo del de arriba.
  elevacion_talon_sentado: { id: 'elevacion_talon_sentado', nombre: 'Elevación de talón sentado (máquina)', grupo: 'Pierna', grupoMuscular: 'pantorrilla', imagenExplicacion: '/explicaciones/elevacion-talon-sentado.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'elevacion_talon', guia: {
    indicaciones: [
      'Siéntate en la máquina con la espalda apoyada en el respaldo.',
      'Coloca las puntas de los pies en la plataforma, con los talones colgando.',
      'Baja los talones lentamente hasta sentir el estiramiento del gemelo.',
      'Empuja con las puntas de los pies, elevando los talones lo más alto posible.',
    ],
    musculos: [{ nombre: 'Gastrocnemio', principal: true }, { nombre: 'Sóleo', principal: true }],
    consejoTecnico: 'Evita rebotar en la posición baja: controla el descenso para aprovechar todo el estiramiento del gemelo.',
  } },
  hip_thrust_barra: { id: 'hip_thrust_barra', nombre: 'Hip thrust con barra', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/hip-thrust-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '2-1-1', alternativaId: 'hip_thrust_maquina', guia: {
    indicaciones: [
      'Apoya la parte alta de la espalda en el banco y coloca la barra sobre las caderas.',
      'Mantén los pies firmes en el suelo a la anchura de las caderas.',
      'Eleva las caderas apretando los glúteos hasta alinear el cuerpo.',
      'Baja lentamente la barra hacia la posición inicial.',
    ],
    musculos: [{ nombre: 'Glúteos', principal: true }],
    consejoTecnico: 'Contracción de un segundo arriba, sin arquear la zona lumbar en exceso.',
  } },
  curl_femoral_maquina: { id: 'curl_femoral_maquina', nombre: 'Curl femoral (máquina sentado)', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/curl-femoral-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_femoral_acostado', guia: {
    indicaciones: [
      'Acuéstate boca abajo con la cadera y el torso pegados al respaldo.',
      'Flexiona las rodillas llevando el rodillo hacia los glúteos.',
      'Baja controladamente sin dejar caer el peso.',
    ],
    musculos: [{ nombre: 'Isquiotibiales', principal: true }],
    consejoTecnico: 'Cadera y torso pegados al respaldo para evitar balanceo.',
  } },
  crunch_lateral_inclinado: { id: 'crunch_lateral_inclinado', nombre: 'Crunch lateral inclinado (máquina)', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-lateral-inclinado.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal', guia: {
    indicaciones: [
      'Recuéstate en una banca inclinada con las manos detrás de la cabeza.',
      'Sube el torso girando hacia un lado, contrayendo el oblicuo.',
      'Baja controladamente y alterna de lado.',
    ],
    musculos: [{ nombre: 'Oblicuos', principal: true }, { nombre: 'Recto abdominal', principal: false }],
    consejoTecnico: 'Enfoque en la contracción de los oblicuos, no en la velocidad.',
  } },
  elevacion_piernas: { id: 'elevacion_piernas', nombre: 'Elevación de piernas', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/elevacion-piernas.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },

  press_banco_mancuernas: { id: 'press_banco_mancuernas', nombre: 'Press de banco plano con mancuernas', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-banco-mancuernas.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_pecho_hammer', guia: {
    indicaciones: [
      'Acuéstate en el banco plano con una mancuerna en cada mano.',
      'Baja las mancuernas a los costados del pecho con los codos a 45° respecto al torso.',
      'Empuja hacia arriba sin bloquear los codos al extender.',
    ],
    musculos: [{ nombre: 'Pectorales Mayores', principal: true }, { nombre: 'Deltoides Anteriores', principal: false }],
    consejoTecnico: 'Evita que las mancuernas se toquen en la parte superior; controla el descenso.',
  } },
  press_inclinado_mancuerna: { id: 'press_inclinado_mancuerna', nombre: 'Press inclinado con mancuerna', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-inclinado-mancuerna.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_inclinado_hammer', guia: {
    indicaciones: [
      'Ajusta el respaldo del banco entre 30 y 45 grados.',
      'Baja las mancuernas de forma controlada hasta la parte superior del pecho.',
      'Empuja hacia arriba extendiendo los brazos por completo.',
    ],
    musculos: [{ nombre: 'Pectoral superior', principal: true }, { nombre: 'Deltoides anterior', principal: false }],
    consejoTecnico: 'Respaldo ajustado a 30-45 grados, ni más plano ni más vertical.',
  } },
  aperturas_maquina: { id: 'aperturas_maquina', nombre: 'Aperturas en máquina', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/aperturas-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aperturas_mancuernas', guia: {
    indicaciones: [
      'Siéntate con la espalda apoyada y sujeta las manijas con los codos ligeramente flexionados.',
      'Junta los brazos al frente del pecho en un arco controlado.',
      'Regresa lentamente sin dejar que el peso te jale de golpe.',
    ],
    musculos: [{ nombre: 'Pectoral', principal: true }],
    consejoTecnico: 'Controla el retorno para no forzar la articulación del hombro.',
  } },
  crossover_polea_alta: { id: 'crossover_polea_alta', nombre: 'Crossover en polea alta', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/crossover-polea-alta.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'fondos_barra', guia: {
    indicaciones: [
      'Sujeta las poleas altas y da un paso al frente.',
      'Inclina ligeramente el torso hacia adelante.',
      'Tira de las asas hacia abajo y crúzalas frente al cuerpo.',
      'Regresa de forma controlada hasta sentir el estiramiento.',
    ],
    musculos: [{ nombre: 'Pectorales', principal: true }, { nombre: 'Deltoides Anteriores', principal: false }],
    consejoTecnico: 'Mantén una ligera flexión en los codos constante durante todo el recorrido.',
  } },
  press_frances_barra_z: { id: 'press_frances_barra_z', nombre: 'Press francés con barra Z', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/press-frances-barra-z.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'press_frances_polea_alta', guia: {
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
  press_militar_barra: { id: 'press_militar_barra', nombre: 'Press militar con barra', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/press-militar-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_militar_mancuernas', guia: {
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
  jalon_pecho: { id: 'jalon_pecho', nombre: 'Jalón de pecho', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho.png', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_unilateral_polea', guia: {
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
  jalon_pecho_cerrado_neutro: { id: 'jalon_pecho_cerrado_neutro', nombre: 'Jalón de pecho cerrado neutro', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-pecho-cerrado-neutro.png', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho', guia: {
    indicaciones: [
      'Sujeta la barra en V o agarre neutro, siéntate con las rodillas fijas.',
      'Jala hacia el pecho superior manteniendo los codos pegados al cuerpo.',
      'Sube controladamente hasta extender los brazos por completo.',
    ],
    musculos: [{ nombre: 'Dorsales', principal: true }, { nombre: 'Bíceps', principal: false }],
    consejoTecnico: 'Jalar hacia el pecho superior manteniendo los codos pegados, sin balancear el torso.',
  } },
  curl_barra: { id: 'curl_barra', nombre: 'Curl con barra', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-barra.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_supinacion_maquina', guia: {
    indicaciones: [
      'De pie, sujeta la barra con agarre supino a la anchura de los hombros.',
      'Flexiona los codos subiendo la barra sin balancear el torso.',
      'Baja controladamente hasta extender los brazos.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }],
    consejoTecnico: 'Agarre supino, sin balancear el torso para ayudarte con impulso.',
  } },
  curl_supinacion_maquina: { id: 'curl_supinacion_maquina', nombre: 'Curl supinación en máquina', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-supinacion-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_scott_barra_z', guia: {
    indicaciones: [
      'Siéntate con las axilas bien apoyadas en el banco de la máquina.',
      'Sujeta las manijas con agarre supino y flexiona los codos.',
      'Baja controladamente sin usar impulso.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }, { nombre: 'Braquial', principal: false }],
    consejoTecnico: 'Axilas bien apoyadas en el banco durante todo el recorrido.',
  } },
  pajaros_pie_mancuerna: { id: 'pajaros_pie_mancuerna', nombre: 'Pájaros de pie con mancuerna', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/pajaros-pie-mancuerna.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'pajaros_maquina', guia: {
    indicaciones: [
      'De pie, inclina el torso hacia adelante manteniendo la espalda recta.',
      'Con las mancuernas, abre los brazos hacia los lados enfocando el deltoide posterior.',
      'Baja controladamente sin balancear el cuerpo.',
    ],
    musculos: [{ nombre: 'Deltoides posterior', principal: true }],
    consejoTecnico: 'Torso inclinado, enfoque en el deltoide posterior, no en subir el peso rápido.',
  } },
  // Sin `guia` a propósito — mismo motivo que press_banco_mancuernas arriba.
  elevaciones_laterales_mancuernas: { id: 'elevaciones_laterales_mancuernas', nombre: 'Elevaciones laterales con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevaciones-laterales-mancuernas.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_polea', guia: {
    indicaciones: [
      'De pie, sujeta una mancuerna en cada mano a los costados.',
      'Eleva los brazos hacia los lados hasta la altura de los hombros.',
      'Baja controladamente sin usar impulso del cuerpo.',
    ],
    musculos: [{ nombre: 'Deltoides Laterales', principal: true }],
    consejoTecnico: 'Ligera flexión de codos, sin usar impulso del cuerpo para levantar el peso.',
  } },
  plancha_abdominal: { id: 'plancha_abdominal', nombre: 'Plancha abdominal', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/plancha-abdominal.png', series: 3, reps: '30-60 seg', descansoSeg: 45, tempo: 'isométrico', alternativaId: 'crunch_lateral_inclinado', sinRescate: true, guia: {
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
  crunch_superior_horizontal: { id: 'crunch_superior_horizontal', nombre: 'Crunch superior horizontal (máquina)', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-superior-horizontal.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_superior_horizontal_banco', guia: {
    indicaciones: [
      'Acuéstate en el banco con las rodillas flexionadas y las manos detrás de la cabeza.',
      'Sube el torso contrayendo el abdomen, sin tirar del cuello.',
      'Baja controladamente sin apoyar completamente la espalda.',
    ],
    musculos: [{ nombre: 'Recto abdominal (zona superior)', principal: true }],
    consejoTecnico: 'Enfócate en la contracción abdominal, no en la velocidad del movimiento.',
  } },
  lumbares_maquina: { id: 'lumbares_maquina', nombre: 'Lumbares (máquina)', grupo: 'Espalda baja', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/lumbares.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'plancha_abdominal' },

  // Ejercicios NUEVOS agregados 15/09/2026 con la rutina de Principiante (ver
  // ESTADO.md) — sin ilustración real todavía, usan la silueta de respaldo
  // (CuerpoMuscular) hasta que se genere el asset.
  zancadas: { id: 'zancadas', nombre: 'Zancadas', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/zancadas.png', series: 4, reps: '10-12 por pierna', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'prensa_unilateral', guia: {
    indicaciones: [
      'Da un paso largo hacia adelante, bajando la rodilla trasera casi hasta el suelo.',
      'Mantén el torso erguido y controlado durante todo el movimiento.',
      'Empuja con la pierna delantera para volver a la posición inicial.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteo', principal: true }],
    consejoTecnico: 'Paso profundo, control del torso para mayor estabilidad.',
  } },
  extension_triceps_polea_alta: { id: 'extension_triceps_polea_alta', nombre: 'Extensión de tríceps en polea alta', grupo: 'Tríceps', grupoMuscular: 'triceps', imagenExplicacion: '/explicaciones/extension-triceps-polea-alta.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'extension_triceps_copa', guia: {
    indicaciones: [
      'De pie frente a la polea alta, sujeta la barra o cuerda con agarre firme.',
      'Extiende los codos hacia abajo manteniéndolos fijos a los costados del torso.',
      'Sube controladamente sin mover los hombros.',
    ],
    musculos: [{ nombre: 'Tríceps', principal: true }],
    consejoTecnico: 'Codos fijos a los costados del torso durante todo el recorrido.',
  } },
  curl_martillo_mancuernas: { id: 'curl_martillo_mancuernas', nombre: 'Curl martillo con mancuernas', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-martillo-mancuernas.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_polea_baja_supino', guia: {
    indicaciones: [
      'De pie, sujeta una mancuerna en cada mano con agarre neutro (palmas enfrentadas).',
      'Flexiona los codos subiendo el peso sin girar la muñeca.',
      'Baja controladamente hasta extender los brazos.',
    ],
    musculos: [{ nombre: 'Braquial', principal: true }, { nombre: 'Bíceps braquial', principal: false }],
    consejoTecnico: 'Agarre neutro para trabajar el braquial, sin balancear el torso.',
  } },

  // Ejercicios del Excel de variaciones (21/09/2026). Los que no traen
  // imagenExplicacion usan la silueta de respaldo hasta tener ilustración.
  remo_mancuerna_banco: { id: 'remo_mancuerna_banco', nombre: 'Remo con mancuerna apoyado en banco', grupo: 'Espalda', grupoMuscular: 'espalda', imagenExplicacion: '/explicaciones/remo-mancuerna-banco.png', series: 4, reps: '10-12 por brazo', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_mancuerna_pie', guia: {
    indicaciones: [
      'Apoya una rodilla y la mano del mismo lado en el banco, con la espalda recta.',
      'Sujeta la mancuerna con el brazo extendido.',
      'Tira hacia la cadera apretando la espalda.',
      'Baja de forma controlada.',
    ],
    musculos: [{ nombre: 'Dorsales anchos', principal: true }, { nombre: 'Trapecios', principal: false }, { nombre: 'Romboides', principal: false }, { nombre: 'Bíceps', principal: false }],
    consejoTecnico: 'Mantén los codos cerca del cuerpo y evita el impulso.',
  } },
  hip_thrust_maquina: { id: 'hip_thrust_maquina', nombre: 'Hip thrust en máquina', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/hip-thrust-maquina.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '2-1-1', alternativaId: 'hip_thrust_barra', guia: {
    indicaciones: [
      'Siéntate con los pies firmes y el rodillo sobre las caderas.',
      'Mantén los pies a la anchura de las caderas.',
      'Eleva las caderas apretando los glúteos.',
      'Baja lento y controlado.',
    ],
    musculos: [{ nombre: 'Glúteos', principal: true }],
    consejoTecnico: 'Evita hiperextender la espalda arriba; enfócate en la contracción del glúteo.',
  } },
  press_pecho_hammer: { id: 'press_pecho_hammer', nombre: 'Press plano en máquina hammer', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-pecho-hammer.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_banco_mancuernas', guia: {
    indicaciones: [
      'Ajusta el respaldo y la altura del asiento.',
      'Agarra las manijas con firmeza.',
      'Empuja de forma controlada hacia adelante.',
      'Vuelve lento a la posición inicial.',
    ],
    musculos: [{ nombre: 'Pectorales', principal: true }, { nombre: 'Deltoides anteriores', principal: false }, { nombre: 'Tríceps', principal: false }],
    consejoTecnico: 'Codos ligeramente hacia abajo, sin bloquearlos al final; espalda plana.',
  } },
  press_inclinado_hammer: { id: 'press_inclinado_hammer', nombre: 'Press inclinado en máquina hammer', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-inclinado-hammer.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_inclinado_mancuerna', guia: {
    indicaciones: [
      'Ajusta el asiento para que las manijas queden a la altura del pecho alto.',
      'Empuja hacia arriba y adelante sin despegar la espalda.',
      'Vuelve lento hasta sentir el estiramiento del pecho.',
    ],
    musculos: [{ nombre: 'Pectoral superior', principal: true }, { nombre: 'Deltoides anteriores', principal: false }, { nombre: 'Tríceps', principal: false }],
    consejoTecnico: 'No bloquees los codos arriba y mantén los hombros hacia atrás.',
  } },
  elevaciones_laterales_polea: { id: 'elevaciones_laterales_polea', nombre: 'Elevaciones laterales en polea', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevaciones-laterales-polea.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevaciones_laterales_mancuernas', guia: {
    indicaciones: [
      'Ajusta el cable en la polea baja.',
      'Levanta la mano cruzando el cuerpo hasta la altura del hombro.',
      'Baja lentamente.',
    ],
    musculos: [{ nombre: 'Deltoides laterales', principal: true }],
    consejoTecnico: 'Evita que el cable se cruce o se tense en exceso en la parte superior.',
  } },
  pajaros_maquina: { id: 'pajaros_maquina', nombre: 'Pájaros sentado en máquina', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/pajaros-maquina.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'pajaros_pie_mancuerna', guia: {
    indicaciones: [
      'Siéntate de frente al respaldo con el pecho apoyado.',
      'Agarra las manijas y abre los brazos hacia atrás.',
      'Vuelve lento sin soltar la tensión.',
    ],
    musculos: [{ nombre: 'Deltoides posteriores', principal: true }, { nombre: 'Trapecio medio', principal: false }],
    consejoTecnico: 'Lidera con los codos y no encojas los hombros.',
  } },
  jalon_unilateral_polea: { id: 'jalon_unilateral_polea', nombre: 'Jalón unilateral en polea alta', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/jalon-unilateral-polea.png', series: 4, reps: '10-12 por lado', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'jalon_pecho', guia: {
    indicaciones: [
      'Arrodíllate con una pierna adelantada y agarra la polea con el brazo extendido.',
      'Jala hacia abajo y afuera apretando el dorsal.',
      'Vuelve controlado sintiendo el estiramiento.',
    ],
    musculos: [{ nombre: 'Dorsal ancho', principal: true }, { nombre: 'Redondo mayor', principal: false }],
    consejoTecnico: 'Evita el balanceo del torso y usa una carga que puedas controlar.',
  } },
  remo_mancuerna_pie: { id: 'remo_mancuerna_pie', nombre: 'Remo con mancuerna de pie', grupo: 'Espalda', grupoMuscular: 'espalda', series: 4, reps: '10-12 por brazo', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_mancuerna_banco', guia: {
    indicaciones: [
      'De pie, inclina el torso con la espalda recta y una mancuerna en la mano.',
      'Tira hacia la cadera apretando la espalda.',
      'Baja controlado sin balancear el cuerpo.',
    ],
    musculos: [{ nombre: 'Dorsales', principal: true }, { nombre: 'Romboides', principal: false }, { nombre: 'Bíceps', principal: false }],
    consejoTecnico: 'Espalda neutra y cadera atrás; no uses impulso.',
  } },
  curl_scott_barra_z: { id: 'curl_scott_barra_z', nombre: 'Curl Scott con barra Z', grupo: 'Bíceps', grupoMuscular: 'biceps', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_supinacion_maquina', guia: {
    indicaciones: [
      'Apoya los brazos completos en el banco Scott.',
      'Sube la barra Z flexionando los codos.',
      'Baja lento hasta casi extender el brazo.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }],
    consejoTecnico: 'No despegues los brazos del apoyo ni uses impulso.',
  } },
  curl_femoral_acostado: { id: 'curl_femoral_acostado', nombre: 'Curl femoral (máquina acostado)', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/curl-femoral-acostado.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_femoral_maquina', guia: {
    indicaciones: [
      'Ajusta el rodillo a la altura de los tobillos.',
      'Acuéstate boca abajo y sujeta las asas laterales.',
      'Flexiona las rodillas llevando los talones hacia los glúteos.',
      'Mantén una breve contracción arriba y baja lento.',
    ],
    musculos: [{ nombre: 'Isquiosurales', principal: true }, { nombre: 'Gastrocnemio', principal: false }],
    consejoTecnico: 'Mantén las caderas pegadas al banco y evita tirones bruscos.',
  } },
  hack_inclinado: { id: 'hack_inclinado', nombre: 'Hack inclinado', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/hack-inclinado.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'prensa_inclinada', guia: {
    indicaciones: [
      'Apoya la espalda plana y los hombros bajo las almohadillas.',
      'Pon los pies en la plataforma a la anchura de los hombros.',
      'Baja lento flexionando rodillas y caderas.',
      'Empuja hacia arriba sin bloquear las rodillas.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteos', principal: false }],
    consejoTecnico: 'Rodillas alineadas con las puntas de los pies y talones firmes.',
  } },
  sentadilla_smith: { id: 'sentadilla_smith', nombre: 'Sentadilla en máquina Smith', grupo: 'Pierna', grupoMuscular: 'cuadriceps', series: 4, reps: '10-12', descansoSeg: 120, tempo: '3-1-1', alternativaId: 'sentadilla_barra', guia: {
    indicaciones: [
      'Ubica la barra sobre los hombros con los pies un poco adelante.',
      'Baja hasta que los muslos queden paralelos al suelo.',
      'Empuja con todo el pie para subir.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteos', principal: false }],
    consejoTecnico: 'Espalda recta y rodillas alineadas con los pies.',
  } },
  prensa_unilateral: { id: 'prensa_unilateral', nombre: 'Prensa unilateral', grupo: 'Pierna', grupoMuscular: 'cuadriceps', series: 4, reps: '10-12 por pierna', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'zancadas', guia: {
    indicaciones: [
      'Apoya un solo pie en el centro de la plataforma.',
      'Baja controlado hasta unos 90° de rodilla.',
      'Empuja sin bloquear la rodilla.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteos', principal: false }],
    consejoTecnico: 'Haz todas las repeticiones de una pierna y luego cambia.',
  } },
  press_militar_mancuernas: { id: 'press_militar_mancuernas', nombre: 'Press militar con mancuernas', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/press-militar-mancuernas.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_militar_barra', guia: {
    indicaciones: [
      'Ajusta el respaldo del banco casi vertical.',
      'Siéntate con la espalda apoyada y las mancuernas a la altura de los hombros.',
      'Empuja hacia arriba hasta extender los brazos.',
      'Baja lento cerca de las orejas.',
    ],
    musculos: [{ nombre: 'Deltoides anteriores y laterales', principal: true }, { nombre: 'Tríceps', principal: false }],
    consejoTecnico: 'Evita que las mancuernas se toquen arriba; mantén el core activado.',
  } },
  aperturas_mancuernas: { id: 'aperturas_mancuernas', nombre: 'Aperturas con mancuernas (inclinado)', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/aperturas-mancuernas.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aperturas_maquina', guia: {
    indicaciones: [
      'Acuéstate en el banco inclinado con una mancuerna en cada mano.',
      'Abre los brazos en arco con los codos ligeramente flexionados.',
      'Junta las mancuernas arriba apretando el pecho.',
    ],
    musculos: [{ nombre: 'Pectoral superior', principal: true }, { nombre: 'Deltoides anteriores', principal: false }],
    consejoTecnico: 'Movimiento en arco, sin bajar más de lo que tu hombro tolere.',
  } },
  fondos_barra: { id: 'fondos_barra', nombre: 'Fondos en barra (con o sin lastre)', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/fondos-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'crossover_polea_alta', guia: {
    indicaciones: [
      'Sujétate en las barras paralelas con los brazos extendidos.',
      'Baja inclinando el torso hacia adelante hasta sentir el pecho.',
      'Empuja para subir sin bloquear los codos.',
    ],
    musculos: [{ nombre: 'Pectoral inferior', principal: true }, { nombre: 'Tríceps', principal: false }, { nombre: 'Deltoides anteriores', principal: false }],
    consejoTecnico: 'Controla la bajada y añade lastre solo cuando domines el peso corporal.',
  } },
  aductor_externo_polea: { id: 'aductor_externo_polea', nombre: 'Aductor externo en polea', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/aductor-externo-polea.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_externo', guia: {
    indicaciones: [
      'De pie, sujeta la estructura y engancha la tobillera de la polea.',
      'Lleva la pierna hacia afuera de forma controlada.',
      'Vuelve lento sin balancear el torso.',
    ],
    musculos: [{ nombre: 'Glúteo medio', principal: true }],
    consejoTecnico: 'Mantén el torso erguido y mueve solo la pierna.',
  } },
  aductor_interno_polea: { id: 'aductor_interno_polea', nombre: 'Aductor interno en polea', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/aductor-interno-polea.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'aductor_interno', guia: {
    indicaciones: [
      'De pie, engancha la tobillera de la polea en la pierna cercana a la máquina.',
      'Cruza la pierna hacia adentro de forma controlada.',
      'Vuelve lento a la posición inicial.',
    ],
    musculos: [{ nombre: 'Aductores', principal: true }],
    consejoTecnico: 'Torso firme y movimiento sin impulso.',
  } },
  press_frances_polea_alta: { id: 'press_frances_polea_alta', nombre: 'Press francés en polea alta', grupo: 'Tríceps', grupoMuscular: 'triceps', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'press_frances_barra_z', guia: {
    indicaciones: [
      'Coloca la cuerda o barra en la polea alta y ubica los codos por delante de la cabeza.',
      'Extiende los codos sin moverlos.',
      'Vuelve lento hasta sentir el estiramiento del tríceps.',
    ],
    musculos: [{ nombre: 'Tríceps', principal: true }],
    consejoTecnico: 'Codos fijos apuntando hacia adelante durante todo el recorrido.',
  } },
  crunch_superior_horizontal_banco: { id: 'crunch_superior_horizontal_banco', nombre: 'Crunch superior horizontal en banco', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-superior-horizontal.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_superior_horizontal', guia: {
    indicaciones: [
      'Acuéstate en el banco con las rodillas flexionadas.',
      'Manos detrás de la cabeza sin jalar el cuello.',
      'Sube el torso contrayendo el abdomen y baja lento.',
    ],
    musculos: [{ nombre: 'Recto abdominal superior', principal: true }],
    consejoTecnico: 'El movimiento sale del abdomen, no del cuello.',
  } },

  // 10 variantes nuevas (22/09/2026, pedido del usuario tras revisar su
  // carpeta de ilustraciones) — todavía NO están asignadas a ningún día del
  // programa ni son el destino del Botón de Rescate de ningún ejercicio
  // existente (para no alterar en silencio las rutinas ya aprobadas). Quedan
  // aquí, listas con su ilustración, esperando esa decisión.
  press_banco_barra: { id: 'press_banco_barra', nombre: 'Press de banco plano con barra', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-banco-barra.png', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_banco_mancuernas', guia: {
    indicaciones: [
      'Acuéstate en el banco con los pies firmes en el suelo y la espalda apoyada.',
      'Toma la barra con un agarre ligeramente más ancho que los hombros.',
      'Baja la barra de forma controlada hasta la parte media del pecho, codos a unos 45°.',
      'Empuja la barra hacia arriba hasta extender los brazos, sin bloquear los codos.',
    ],
    musculos: [{ nombre: 'Pectorales', principal: true }, { nombre: 'Deltoides anterior', principal: false }, { nombre: 'Tríceps', principal: false }],
    consejoTecnico: 'Evita abrir demasiado los codos y no bajes la barra más allá de la línea del pecho.',
  } },
  curl_pie_mancuernas_supino: { id: 'curl_pie_mancuernas_supino', nombre: 'Curl de bíceps de pie con mancuernas, agarre supino', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-pie-mancuernas-supino.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_barra', guia: {
    indicaciones: [
      'De pie, sujeta una mancuerna en cada mano con las palmas hacia adelante.',
      'Mantén los codos pegados al cuerpo durante todo el movimiento.',
      'Flexiona los codos para subir las mancuernas hacia los hombros.',
      'Baja lentamente hasta la posición inicial.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }, { nombre: 'Braquial anterior', principal: false }],
    consejoTecnico: 'Mantén el torso firme; evita balancearte o impulsarte con el cuerpo.',
  } },
  curl_polea_baja_supino: { id: 'curl_polea_baja_supino', nombre: 'Curl de bíceps en polea baja con cuerda, agarre supino', grupo: 'Bíceps', grupoMuscular: 'biceps', imagenExplicacion: '/explicaciones/curl-polea-baja-supino.jpg', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'curl_martillo_mancuernas', guia: {
    indicaciones: [
      'Sujeta la cuerda de la polea baja con las palmas hacia arriba.',
      'Mantén los codos fijos a los lados del cuerpo.',
      'Flexiona los codos subiendo las manos hacia los hombros.',
      'Baja lentamente sin bloquear los codos.',
    ],
    musculos: [{ nombre: 'Bíceps braquial', principal: true }, { nombre: 'Braquial', principal: false }, { nombre: 'Braquiorradial', principal: false }],
    consejoTecnico: 'Mantén el torso firme; evita balancearte o usar impulso para subir el peso.',
  } },
  elevacion_frontal_polea: { id: 'elevacion_frontal_polea', nombre: 'Elevación frontal de hombro en polea (un brazo)', grupo: 'Hombro', grupoMuscular: 'hombro', imagenExplicacion: '/explicaciones/elevacion-frontal-polea.png', series: 4, reps: '8-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'elevacion_frontal_mancuernas', guia: {
    indicaciones: [
      'Ponte de espaldas a la polea baja, con el mango en una mano.',
      'Con el brazo casi extendido, eleva al frente hasta la altura del hombro.',
      'Baja de forma controlada hasta la posición inicial.',
      'Completa las repeticiones y cambia de brazo.',
    ],
    musculos: [{ nombre: 'Deltoides anterior', principal: true }],
    consejoTecnico: 'No uses impulso de la espalda; el movimiento lo hace solo el hombro.',
  } },
  encogimientos_maquina: { id: 'encogimientos_maquina', nombre: 'Encogimientos (shrugs) en máquina', grupo: 'Trapecio', grupoMuscular: 'trapecio', imagenExplicacion: '/explicaciones/encogimientos-maquina.png', series: 4, reps: '10-12', descansoSeg: 60, tempo: '2-1-1', alternativaId: 'encogimientos_mancuernas', guia: {
    indicaciones: [
      'De pie, sujeta las manijas de la máquina con los brazos extendidos.',
      'Eleva los hombros hacia las orejas, sin flexionar los codos.',
      'Sostén un segundo arriba y baja de forma controlada.',
    ],
    musculos: [{ nombre: 'Trapecio superior', principal: true }],
    consejoTecnico: 'No gires los hombros — el movimiento es solo hacia arriba y abajo.',
  } },
  crunch_banco_declinado: { id: 'crunch_banco_declinado', nombre: 'Crunch en banco declinado', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-banco-declinado.png', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_superior_horizontal_banco', guia: {
    indicaciones: [
      'Ajusta el banco declinado y engancha los pies en los rodillos.',
      'Manos detrás de la cabeza, sin jalar el cuello.',
      'Eleva el torso contrayendo el abdomen y baja de forma controlada.',
    ],
    musculos: [{ nombre: 'Recto abdominal', principal: true }],
    consejoTecnico: 'Mantén caderas y espalda apoyadas; evita impulsarte con el torso.',
  } },
  crunch_colchoneta: { id: 'crunch_colchoneta', nombre: 'Crunch superior en colchoneta (sin banco)', grupo: 'Abdomen', grupoMuscular: 'core', imagenExplicacion: '/explicaciones/crunch-colchoneta.jpg', series: 4, reps: '10-12', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'crunch_superior_horizontal_banco', guia: {
    indicaciones: [
      'Acuéstate boca arriba con las rodillas flexionadas y los pies apoyados.',
      'Coloca las manos detrás de la cabeza sin jalar el cuello.',
      'Exhala y eleva las escápulas del suelo, flexionando la columna.',
      'Baja lentamente sin perder la tensión en el abdomen.',
    ],
    musculos: [{ nombre: 'Recto abdominal superior', principal: true }],
    consejoTecnico: 'Mira al techo para mantener el cuello neutro. No tires de la cabeza.',
  } },
  sentadilla_goblet_kettlebell: { id: 'sentadilla_goblet_kettlebell', nombre: 'Sentadilla goblet con kettlebell', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/sentadilla-goblet-kettlebell.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'sentadilla_barra', guia: {
    indicaciones: [
      'Sujeta la kettlebell por los cuernos a la altura del pecho.',
      'Mantén la espalda recta y el core activado.',
      'Baja de forma controlada empujando la cadera hacia atrás.',
      'Sube con potencia empujando el suelo con los pies.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteos', principal: true }, { nombre: 'Core', principal: false }],
    consejoTecnico: 'Mantén los codos pegados al cuerpo y las rodillas alineadas con los dedos de los pies.',
  } },
  zancadas_barra: { id: 'zancadas_barra', nombre: 'Zancadas con barra', grupo: 'Pierna', grupoMuscular: 'cuadriceps', imagenExplicacion: '/explicaciones/zancadas-barra.jpg', series: 4, reps: '10-12 por pierna', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'zancadas', guia: {
    indicaciones: [
      'Coloca la barra sobre los trapecios, igual que en sentadilla.',
      'Da un paso adelante y baja la cadera hasta que ambas rodillas formen 90°.',
      'La rodilla trasera baja cerca del suelo sin tocarlo.',
      'Empuja con la pierna adelantada para volver a la posición inicial.',
    ],
    musculos: [{ nombre: 'Cuádriceps', principal: true }, { nombre: 'Glúteos', principal: true }],
    consejoTecnico: 'Mantén el torso erguido y no dejes que la rodilla delantera sobrepase la punta del pie.',
  } },
  aduccion_cadera_banda: { id: 'aduccion_cadera_banda', nombre: 'Abducción de cadera acostado con banda', grupo: 'Pierna', grupoMuscular: 'gluteo', imagenExplicacion: '/explicaciones/aduccion-cadera-banda.jpg', series: 4, reps: '12-15 por pierna', descansoSeg: 45, tempo: '2-1-1', alternativaId: 'aductor_externo', guia: {
    indicaciones: [
      'Acuéstate de lado con las piernas extendidas y una banda elástica justo por encima de las rodillas.',
      'Apóyate en el codo o el brazo para sostener la cabeza.',
      'Manteniendo el cuerpo alineado, eleva la pierna superior de forma controlada.',
      'Baja lentamente sin perder la tensión de la banda.',
    ],
    musculos: [{ nombre: 'Glúteo medio', principal: true }, { nombre: 'Glúteo menor', principal: false }],
    consejoTecnico: 'Evita girar la cadera hacia atrás o usar impulso para levantar la pierna.',
  } },
  remo_polea_baja_pie: { id: 'remo_polea_baja_pie', nombre: 'Remo en polea baja, de pie, con las dos manos', grupo: 'Espalda', grupoMuscular: 'dorsal', imagenExplicacion: '/explicaciones/remo-polea-baja-pie.jpg', series: 4, reps: '10-12', descansoSeg: 75, tempo: '3-1-1', alternativaId: 'remo_mancuerna_pie', guia: {
    indicaciones: [
      'Colócate frente a la polea baja, de pie, con los pies a la anchura de los hombros.',
      'Sujeta el manillar con ambas manos y mantén la espalda recta.',
      'Tira del manillar hacia la cintura, apretando la espalda.',
      'Vuelve lentamente a la posición inicial.',
    ],
    musculos: [{ nombre: 'Dorsal ancho', principal: true }, { nombre: 'Trapecios', principal: false }, { nombre: 'Romboides', principal: false }, { nombre: 'Deltoides posteriores', principal: false }],
    consejoTecnico: 'Evita redondear la espalda y usa un movimiento controlado para un máximo aislamiento de los músculos.',
  } },
  peso_muerto_rumano_kettlebell: { id: 'peso_muerto_rumano_kettlebell', nombre: 'Peso muerto rumano con kettlebell', grupo: 'Pierna', grupoMuscular: 'femoral', imagenExplicacion: '/explicaciones/peso-muerto-rumano-kettlebell.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'peso_muerto_barra', guia: {
    indicaciones: [
      'De pie, sujeta la kettlebell con ambas manos.',
      'Mantén las piernas casi rectas, con una ligera flexión de rodillas.',
      'Bisagra de cadera hacia atrás, bajando la kettlebell con la espalda recta.',
      'Baja hasta sentir el estiramiento en los isquiotibiales.',
      'Vuelve a la posición inicial apretando los glúteos.',
    ],
    musculos: [{ nombre: 'Isquiotibiales', principal: true }, { nombre: 'Glúteos', principal: true }],
    consejoTecnico: 'Mantén la espalda recta en todo momento para proteger tu columna vertebral.',
  } },
  press_inclinado_barra: { id: 'press_inclinado_barra', nombre: 'Press inclinado con barra', grupo: 'Pecho', grupoMuscular: 'pecho', imagenExplicacion: '/explicaciones/press-inclinado-barra.jpg', series: 4, reps: '10-12', descansoSeg: 90, tempo: '3-1-1', alternativaId: 'press_inclinado_mancuerna', guia: {
    indicaciones: [
      'Ajusta el banco a unos 30-45 grados.',
      'Acuéstate y agarra la barra más ancho que los hombros.',
      'Saca la barra del soporte y baja hasta el pecho superior.',
      'Empuja hacia arriba de forma controlada.',
    ],
    musculos: [{ nombre: 'Pectorales superiores', principal: true }, { nombre: 'Deltoides anterior', principal: false }],
    consejoTecnico: 'Evita bloquear los codos bruscamente y mantén la barra estable.',
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

// SPLIT de Ruta Principiante (15/09/2026) — a especificación exacta del
// usuario. Los ejercicios se usan TAL CUAL vienen del programa (barra libre
// incluida, con su `guia` de técnica, series/reps del catálogo sin
// modificar) — que un ejercicio requiera barra o máquina no depende del
// nivel del usuario. Repetir un id en más de un día es intencional (ej.
// `hip_thrust_barra` cae en miércoles Y jueves, `sentadilla_barra` en
// lunes, jueves Y sábado) — así lo pide el programa original, y como cada
// día se calcula por separado no genera ninguna tarjeta duplicada dentro
// del mismo día.
const SPLIT_PRINCIPIANTE: Record<SesionId, string[]> = {
  // Lunes — pierna completa.
  pierna_completa: ['sentadilla_barra', 'prensa_inclinada', 'peso_muerto_barra', 'zancadas', 'extension_cuadriceps', 'curl_femoral_maquina', 'elevacion_talon'],
  // Martes — pecho, tríceps, hombro y abdomen.
  empuje: ['press_pecho_hammer', 'press_inclinado_hammer', 'aperturas_maquina', 'crossover_polea_alta', 'press_frances_barra_z', 'extension_triceps_copa', 'extension_triceps_polea_alta', 'elevaciones_laterales_polea', 'crunch_superior_horizontal'],
  // Miércoles — espalda, bíceps, hombro posterior, glúteo y abdomen.
  traccion: ['remo_mancuerna_banco', 'jalon_pecho', 'remo_cerrado_maquina', 'jalon_pecho_cerrado_neutro', 'curl_barra', 'curl_supinacion_maquina', 'curl_martillo_mancuernas', 'pajaros_maquina', 'hip_thrust_maquina', 'plancha_abdominal'],
  // Jueves — pierna con énfasis en glúteo.
  pierna_gluteo: ['hip_thrust_maquina', 'peso_muerto_barra', 'zancadas', 'sentadilla_barra', 'prensa_inclinada', 'aductor_externo', 'aductor_interno'],
  // Viernes — pecho, espalda y abdomen.
  pecho_espalda: ['press_pecho_hammer', 'crossover_polea_alta', 'remo_mancuerna_banco', 'jalon_pecho', 'crunch_lateral_inclinado'],
  // Sábado — full body.
  full_body: ['sentadilla_barra', 'press_inclinado_hammer', 'remo_cerrado_maquina', 'press_militar_barra', 'curl_barra', 'extension_triceps_copa'],
  // Domingo — descanso.
  // Bloques nuevos para planes de 1 a 4 días (cada uno: una pierna dominante en
  // rodilla o cadera, un empuje, una tracción, brazos/hombro y core).
  full_a: ['sentadilla_barra', 'press_pecho_hammer', 'remo_mancuerna_banco', 'curl_femoral_maquina', 'elevaciones_laterales_polea', 'plancha_abdominal'],
  full_b: ['prensa_inclinada', 'press_inclinado_hammer', 'jalon_pecho', 'hip_thrust_maquina', 'curl_barra', 'extension_triceps_copa', 'crunch_superior_horizontal'],
  full_c: ['peso_muerto_barra', 'zancadas', 'press_militar_barra', 'jalon_pecho_cerrado_neutro', 'curl_supinacion_maquina', 'press_frances_barra_z', 'crunch_lateral_inclinado'],
  torso_a: ['press_pecho_hammer', 'jalon_pecho', 'press_militar_barra', 'aperturas_maquina', 'remo_cerrado_maquina', 'extension_triceps_copa', 'curl_barra', 'plancha_abdominal'],
  // Día extra opcional (planes de 4+ días, cuando ya cumplió su meta): sin
  // pesas pesadas, para sumar movimiento sin comprometer la recuperación.
  extra_ligera: ['plancha_abdominal', 'crunch_lateral_inclinado', 'lumbares_maquina', 'elevacion_piernas'],
  torso_b: ['press_inclinado_hammer', 'remo_mancuerna_banco', 'jalon_pecho_cerrado_neutro', 'crossover_polea_alta', 'elevaciones_laterales_polea', 'press_frances_barra_z', 'curl_martillo_mancuernas', 'crunch_superior_horizontal'],
};

/** Un ejercicio del día para Ruta Intermedio, con sus PROPIOS series/reps/
 * tempo (más pesado, menos repeticiones, RIR bajo) — a diferencia de
 * Principiante, que usa los valores del catálogo tal cual. `restPause`
 * marca los ejercicios de aislamiento con la técnica "Rest-Pause en la
 * última serie" que pidió el usuario (10s al fallo antes de re-intentar). */
interface EjercicioIntermedio {
  id: string;
  series: number;
  reps: string;
  tempo: string;
  restPause?: boolean;
}

function ejercicioIntermedio(id: string, series: number, reps: string, tempo: string, restPause?: boolean): EjercicioIntermedio {
  return { id, series, reps, tempo, restPause };
}

// SPLIT de Ruta Intermedio (15/09/2026) — a especificación exacta del
// usuario: mismos días/enfoques que Principiante, pero con series/reps más
// bajas (fuerza-hipertrofia, RIR 0-1 en compuestos), tempo con más control
// excéntrico, y algunos ejercicios de aislamiento con Rest-Pause en la
// última serie. La selección de ejercicios difiere un poco de Principiante
// en martes (sin extensión de tríceps en polea alta) y jueves (sin
// sentadilla) — tal como especifica el programa.
const SPLIT_INTERMEDIO: Record<SesionBase, EjercicioIntermedio[]> = {
  pierna_completa: [
    ejercicioIntermedio('sentadilla_barra', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('prensa_inclinada', 4, '8-10', '2-0-1'),
    ejercicioIntermedio('peso_muerto_barra', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('zancadas', 3, '10-12 por pierna', '2-0-1'),
    ejercicioIntermedio('extension_cuadriceps', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('curl_femoral_maquina', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('elevacion_talon', 4, '12-15', '3-0-1'),
  ],
  empuje: [
    ejercicioIntermedio('press_pecho_hammer', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('press_inclinado_hammer', 3, '8-10', '2-0-1'),
    ejercicioIntermedio('aperturas_maquina', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('crossover_polea_alta', 3, '12-15', '3-0-1'),
    ejercicioIntermedio('press_frances_barra_z', 4, '8-10', '2-0-1'),
    ejercicioIntermedio('extension_triceps_copa', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('elevaciones_laterales_polea', 4, '12-15', '3-0-1', true),
    ejercicioIntermedio('crunch_superior_horizontal', 4, '15-20', '2-0-1'),
  ],
  traccion: [
    ejercicioIntermedio('remo_mancuerna_banco', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('jalon_pecho', 4, '8-10', '2-0-1'),
    ejercicioIntermedio('remo_cerrado_maquina', 3, '10-12', '2-0-1'),
    ejercicioIntermedio('jalon_pecho_cerrado_neutro', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('curl_barra', 4, '8-10', '2-0-1'),
    ejercicioIntermedio('curl_supinacion_maquina', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('pajaros_maquina', 4, '12-15', '3-0-1', true),
    ejercicioIntermedio('hip_thrust_maquina', 4, '8-10', '2-0-1'),
    ejercicioIntermedio('plancha_abdominal', 3, 'Hasta el fallo', 'isométrico'),
  ],
  pierna_gluteo: [
    ejercicioIntermedio('hip_thrust_maquina', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('peso_muerto_barra', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('prensa_inclinada', 3, '10-12', '2-0-1'),
    ejercicioIntermedio('zancadas', 3, '10-12 por pierna', '2-0-1'),
    ejercicioIntermedio('aductor_externo', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('aductor_interno', 3, '12-15', '3-0-1', true),
  ],
  pecho_espalda: [
    ejercicioIntermedio('press_pecho_hammer', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('remo_mancuerna_banco', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('jalon_pecho', 3, '8-10', '2-0-1'),
    ejercicioIntermedio('crossover_polea_alta', 3, '12-15', '3-0-1', true),
    ejercicioIntermedio('crunch_lateral_inclinado', 4, '15-20', '2-0-1'),
  ],
  full_body: [
    ejercicioIntermedio('sentadilla_barra', 4, '6-8', '2-0-1'),
    ejercicioIntermedio('press_inclinado_hammer', 3, '8-10', '2-0-1'),
    ejercicioIntermedio('remo_cerrado_maquina', 3, '8-10', '2-0-1'),
    ejercicioIntermedio('press_militar_barra', 3, '8-10', '2-0-1'),
    ejercicioIntermedio('curl_barra', 3, '10-12', '3-0-1'),
    ejercicioIntermedio('extension_triceps_copa', 3, '10-12', '3-0-1'),
  ],
};

/** Qué sesiones rota el plan según los días por semana que eligió la persona.
 * Cada músculo grande se trabaja 2 veces por semana como mínimo, salvo con 1 o
 * 2 días, donde cada sesión es cuerpo completo. Con 6 días es el programa
 * original completo. NO hay días de calendario fijos: al terminar una sesión
 * "toca la siguiente", sin importar qué día sea. */
const CICLO_POR_DIAS: Record<number, SesionId[]> = {
  1: ['full_body'],
  2: ['full_a', 'full_b'],
  3: ['full_a', 'full_b', 'full_c'],
  4: ['pierna_completa', 'torso_a', 'pierna_gluteo', 'torso_b'],
  5: ['pierna_completa', 'empuje', 'traccion', 'pierna_gluteo', 'pecho_espalda'],
  6: ['pierna_completa', 'empuje', 'traccion', 'pierna_gluteo', 'pecho_espalda', 'full_body'],
};

/** Todas las sesiones que existen — el calendario las usa para adivinar qué
 * rutina se hizo un día pasado, aunque la persona haya cambiado sus días. */
export const TODAS_LAS_SESIONES = Object.keys(SPLIT_PRINCIPIANTE) as SesionId[];

/** La sesión que toca ahora: `diaActual` cuenta sesiones (avanza al terminar
 * una), no días del calendario. */
export function sesionDeHoy(diaActual: number, diasSemana: number): SesionId {
  const ciclo = CICLO_POR_DIAS[diasDePlan(diasSemana)];
  return ciclo[(diaActual - 1) % ciclo.length];
}

export function nombreDeSesion(sesion: SesionId): string {
  return NOMBRE_DIA_RUTINA[sesion];
}

export function calentamientoDeSesion(sesion: SesionId): TrenCalentamiento | null {
  return CALENTAMIENTO_DIA_RUTINA[sesion];
}

/** La sesión que se hace ahora: la que toca en la rotación o, si la persona
 * pidió un día extra ligero (planes de 4+ días), esa. */
export function sesionActual(p: Progreso): SesionId {
  return p.extraHoy && p.diasSemana >= 4 ? 'extra_ligera' : sesionDeHoy(p.diaActual, p.diasSemana);
}

// Prescripción de Intermedio para los bloques nuevos: cada ejercicio hereda la
// que ya tiene en el programa original (primera aparición); si no aparece, un
// aislamiento estándar. Así no se inventan series/reps distintas por sesión.
const CONFIG_INTERMEDIO_POR_ID = new Map<string, EjercicioIntermedio>();
for (const cfgs of Object.values(SPLIT_INTERMEDIO)) {
  for (const c of cfgs) if (!CONFIG_INTERMEDIO_POR_ID.has(c.id)) CONFIG_INTERMEDIO_POR_ID.set(c.id, c);
}

function intermedioDesdeIds(ids: string[]): EjercicioIntermedio[] {
  return ids.map((id) => CONFIG_INTERMEDIO_POR_ID.get(id) ?? ejercicioIntermedio(id, 3, '12-15', '3-0-1'));
}

/** Ruta Principiante usa `SPLIT_PRINCIPIANTE` (ids tal cual, series/reps del
 * catálogo). Ruta Intermedio usa `SPLIT_INTERMEDIO`, con sus propios
 * series/reps/tempo más exigentes y la nota de Rest-Pause cuando aplica —
 * el resto del ejercicio (imagen, guía, músculos) sigue viniendo del
 * catálogo compartido, solo se sobrescribe el volumen de entrenamiento. */
export function ejerciciosDeSesion(sesion: SesionId, nivel: Nivel): Ejercicio[] {
  if (nivel === 'principiante') return SPLIT_PRINCIPIANTE[sesion].map((id) => CATALOGO[id]);
  const configs = sesion in SPLIT_INTERMEDIO ? SPLIT_INTERMEDIO[sesion as SesionBase] : intermedioDesdeIds(SPLIT_PRINCIPIANTE[sesion]);
  return configs.map((cfg) => ({
    ...CATALOGO[cfg.id],
    series: cfg.series,
    reps: cfg.restPause ? `${cfg.reps} (Rest-Pause en la última serie)` : cfg.reps,
    tempo: cfg.tempo,
  }));
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

// Ejercicios retirados que tienen sustituto directo: un progreso guardado que
// aún los nombre (ej. un reemplazo del día) se resuelve al sustituto en vez de
// caer en "Ejercicio anterior".
const SUSTITUTO_DE_RETIRADOS: Record<string, string> = {
  curl_hammer_polea_baja: 'curl_polea_baja_supino',
};

export function obtenerEjercicio(id: string): Ejercicio {
  return CATALOGO[SUSTITUTO_DE_RETIRADOS[id] ?? id] ?? EJERCICIO_DESCONOCIDO;
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
  /** Repeticiones en Reserva (RIR, 15/09/2026) — cuántas repeticiones más
   * cree el usuario que podía hacer antes de fallar (0 = al fallo, 4 = muy
   * fácil). Solo se pide en Ruta Intermedio (ver `registrar` en
   * app/app/page.tsx); un principiante todavía no puede juzgar su esfuerzo
   * con precisión, así que no se le pregunta. Opcional para que los logs
   * viejos (sin esta pregunta) sigan siendo válidos sin migración. Se usa
   * en `sugerenciaPeso` para decidir si subir el peso la próxima vez. */
  rir?: number;
}

/** Máximo de días de entrenamiento por semana: el 7º queda de descanso. */
export const DIAS_MAX_PLAN = 6;

/** Lleva cualquier valor (el onboarding permite 1-7) al rango del plan (1-6). */
export function diasDePlan(n: number | null | undefined): number {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 4;
  return Math.min(DIAS_MAX_PLAN, Math.max(1, v));
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
  /** null hasta que la persona lo elige en Perfil (calculadora de macros) —
   * ya no se asume 'hombre' en silencio. */
  sexo: Sexo | null;
  /** Días de entrenamiento por semana que eligió la persona (1-6). NO son días
   * fijos de la semana: puede ir cuando quiera, el plan rota sesiones. El 7º
   * día siempre queda de descanso recomendado (ver DIAS_MAX_PLAN). */
  diasSemana: number;
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
  /** Solo en este dispositivo. Día (YYYY-MM-DD) en que la persona eligió
   * "entrenar igual" pese al descanso recomendado — ese día no se le vuelve
   * a insistir. */
  descansoIgnorado?: string;
  /** Pidió el día extra ligero: se hace en vez de la siguiente sesión y NO
   * avanza la rotación. Se limpia al terminarlo. */
  extraHoy?: boolean;
}

const KEY = 'gymevo_progreso';

/** Fecha LOCAL del dispositivo (YYYY-MM-DD). Antes se usaba la fecha UTC, y en
 * Colombia (UTC-5) un entrenamiento de las 7 pm en adelante quedaba guardado
 * con la fecha del día siguiente — el calendario lo habría mostrado un día
 * corrido justo para quien entrena de noche. */
export function fechaLocalISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function hoyISO(): string {
  return fechaLocalISO();
}

function diasEntre(a: string, b: string): number {
  const msPorDia = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPorDia);
}

function respuestasDias(): number {
  const r = leerRespuestas();
  return r ? diasDePlan(r.diasSemana) : DIAS_MAX_PLAN;
}

export function leerProgreso(): Progreso {
  if (typeof window === 'undefined') {
    return { nivel: 'principiante', meta: 'musculo', sexo: null, diasSemana: 4, diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: false, descansoDuracionSeg: 60, sonidoDescanso: true, pesoKg: null, unidadPeso: 'lb', estaturaCm: null, edad: null, pesoInicialKg: null, cinturaCm: null, cinturaInicialCm: null, fechaInicioMedidas: null };
  }
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    // Primera vez: si el onboarding ya se completó en esta sesión, hereda
    // su nivel/meta (evita que el primer progreso guardado nazca con los
    // valores por defecto pisando lo que el usuario acaba de elegir).
    const respuestas = leerRespuestas();
    const inicial: Progreso = { nivel: respuestas?.nivel ?? 'principiante', meta: respuestas?.meta ?? 'musculo', sexo: respuestas?.sexo ?? null, diasSemana: diasDePlan(respuestas?.diasSemana), diaActual: 1, racha: 0, ultimaFecha: null, hechosHoy: [], reemplazosHoy: {}, logs: [], descansoAutomatico: false, descansoDuracionSeg: 60, sonidoDescanso: true, pesoKg: null, unidadPeso: 'lb', estaturaCm: null, edad: null, pesoInicialKg: null, cinturaCm: null, cinturaInicialCm: null, fechaInicioMedidas: null };
    localStorage.setItem(KEY, JSON.stringify(inicial));
    return inicial;
  }
  const p = JSON.parse(raw) as Progreso;
  // Compatibilidad con progreso guardado antes de este campo.
  if (p.nivel === undefined) p.nivel = leerRespuestas()?.nivel ?? 'principiante';
  if (p.meta === undefined) p.meta = leerRespuestas()?.meta ?? 'musculo';
  if (p.sexo === undefined) p.sexo = leerRespuestas()?.sexo ?? null;
  // Progreso anterior a este campo: seguía el plan de 6 días de siempre — se
  // conserva ese comportamiento (o lo que respondió en el onboarding, si lo hay).
  if (p.diasSemana === undefined) p.diasSemana = respuestasDias();
  if (p.descansoAutomatico === undefined) p.descansoAutomatico = false;
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
/** Cambia cuántos días por semana quiere entrenar (1-6). El plan nuevo arranca
 * por su primera sesión: `diaActual` cuenta sesiones del plan anterior y, sin
 * reiniciarlo, la persona caería en una sesión cualquiera del ciclo nuevo. */
export function cambiarDias(p: Progreso, dias: number): Progreso {
  return { ...p, diasSemana: diasDePlan(dias), diaActual: 1, hechosHoy: [], reemplazosHoy: {}, extraHoy: false };
}

/** Qué sesión del ciclo toca (1 a N), para mostrarla en Perfil. */
export function posicionEnCiclo(p: Progreso): { posicion: number; total: number } {
  const total = CICLO_POR_DIAS[diasDePlan(p.diasSemana)].length;
  return { posicion: ((p.diaActual - 1) % total) + 1, total };
}

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

/** Cuánto subir el peso incremento de "sube el peso" — pequeño y fijo para no
 * proponer saltos peligrosos, distinto según la unidad (2.5 kg ≈ 5 lb, los
 * incrementos de disco más chicos que existen en un gimnasio real). */
const INCREMENTO_SUGERIDO: Record<'kg' | 'lb', number> = { kg: 2.5, lb: 5 };

/** Sugerencia de peso para la próxima vez, basada en el RIR (Repeticiones en
 * Reserva) que el usuario reportó la última vez — autorregulación simple
 * (15/09/2026, Ruta Intermedio): si sobró margen (RIR 3-4, "fácil"/"muy
 * fácil"), sugiere subir un incremento chico; si costó (RIR 0-1, "al fallo"/
 * "duro"), sugiere mantener el mismo peso para consolidar la técnica; RIR 2
 * ("moderado") también mantiene, es la zona correcta para seguir ahí. Sin
 * RIR registrado (log viejo, o Ruta Principiante que no lo pregunta) no hay
 * sugerencia — se usa el dato plano de `ultimoRegistro` como hasta ahora. */
export function sugerenciaPeso(p: Progreso, ejercicioId: string): { pesoSugerido: number; subio: boolean } | null {
  const ultimo = ultimoRegistro(p, ejercicioId);
  if (!ultimo || ultimo.rir === undefined || ultimo.peso <= 0) return null;
  const incremento = INCREMENTO_SUGERIDO[p.unidadPeso];
  const subio = ultimo.rir >= 3;
  return { pesoSugerido: subio ? ultimo.peso + incremento : ultimo.peso, subio };
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

const SUFIJO_UNILATERAL = / por (pierna|lado|brazo)$/;

/** Lo que de verdad se hace hoy: cada ejercicio del plan o, si la persona tocó
 * el Botón de Rescate, su alternativa. La alternativa HEREDA series, reps y
 * tempo del ejercicio del plan — un intermedio que rescata la sentadilla sigue
 * con sus 6-8 pesadas, no con las 10-12 de la ficha del catálogo. Lo único
 * propio de la alternativa es cómo se cuenta (por pierna / lado / brazo). */
export function aplicarReemplazos(ejercicios: Ejercicio[], reemplazos: Record<string, string>): Ejercicio[] {
  const delPlan = new Map(ejercicios.map((e) => [e.id, e]));
  return ejercicios.map((e) => {
    const sustitutoId = reemplazos[e.id];
    if (!sustitutoId) return e;
    const yaEnPlan = delPlan.get(sustitutoId);
    if (yaEnPlan) return yaEnPlan;
    const alt = obtenerEjercicio(sustitutoId);
    const partes = e.reps.match(/^(.*?)( \(.*\))?$/);
    const rango = (partes?.[1] ?? e.reps).replace(SUFIJO_UNILATERAL, '');
    const extra = partes?.[2] ?? '';
    const sufijo = alt.reps.match(SUFIJO_UNILATERAL)?.[0] ?? '';
    return { ...alt, series: e.series, reps: `${rango}${sufijo}${extra}`, tempo: e.tempo };
  });
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
  return { ...p, diaActual: p.extraHoy ? p.diaActual : p.diaActual + 1, extraHoy: false, racha, ultimaFecha: hoy, hechosHoy: [], reemplazosHoy: {} };
}

/** Racha en riesgo (M4 de 56): ya pasó ≥1 día completo sin entrenar y aún no
 * venció del todo. NUNCA en el día de descanso — ahí no hay nada que
 * registrar por diseño, así que "hechosHoy vacío" es lo normal, no una señal
 * de riesgo (bug real encontrado por el usuario: la llama salía en color de
 * alerta un domingo sin haber hecho nada mal). */
// ── Semana, racha semanal y descanso (sin días de calendario fijos) ──────────
// La persona elige cuántos días entrena por semana, no cuáles. La meta es esa
// cantidad de días con series registradas en la semana (lunes a domingo), y la
// racha cuenta semanas seguidas que la cumplieron.

function sumarDiasISO(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + dias)).toISOString().slice(0, 10);
}

function inicioDeSemana(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = domingo
  return sumarDiasISO(fecha, -((dow + 6) % 7));
}

/** Fechas (YYYY-MM-DD) en las que la persona registró series. Hoy solo cuenta
 * cuando ya cerró su sesión: a mitad de un entrenamiento hay series de hoy,
 * pero la semana y el descanso no deben cambiar todavía. */
function fechasEntrenadas(p: Progreso, hoy: string): Set<string> {
  const fechas = new Set(p.logs.map((l) => l.fecha));
  if (p.ultimaFecha !== hoy) fechas.delete(hoy);
  return fechas;
}

function diasEntrenadosEnSemana(fechas: Set<string>, inicio: string): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (fechas.has(sumarDiasISO(inicio, i))) n++;
  return n;
}

export interface ResumenSemana {
  /** Días por semana que eligió. */
  meta: number;
  /** Días de esta semana (lunes a domingo) con series registradas. */
  hechos: number;
  faltan: number;
  /** Días que quedan de la semana contando hoy. */
  diasRestantes: number;
}

export function resumenSemana(p: Progreso, hoy: string = hoyISO()): ResumenSemana {
  const inicio = inicioDeSemana(hoy);
  const hechos = diasEntrenadosEnSemana(fechasEntrenadas(p, hoy), inicio);
  const meta = diasDePlan(p.diasSemana);
  return { meta, hechos, faltan: Math.max(0, meta - hechos), diasRestantes: 7 - diasEntre(inicio, hoy) };
}

/** Semanas seguidas que cumplieron su meta. La semana en curso suma solo si ya
 * la cumplió; si todavía no, no rompe la racha (aún queda tiempo). */
export function semanasSeguidas(p: Progreso, hoy: string = hoyISO()): number {
  const fechas = fechasEntrenadas(p, hoy);
  const meta = diasDePlan(p.diasSemana);
  let inicio = inicioDeSemana(hoy);
  let semanas = 0;
  if (diasEntrenadosEnSemana(fechas, inicio) >= meta) semanas++;
  inicio = sumarDiasISO(inicio, -7);
  while (semanas < 520 && diasEntrenadosEnSemana(fechas, inicio) >= meta) {
    semanas++;
    inicio = sumarDiasISO(inicio, -7);
  }
  return semanas;
}

/** La racha semanal corre peligro cuando las sesiones que faltan ya solo caben
 * si entrena todos los días que quedan de la semana. */
export function rachaEnRiesgo(p: Progreso, hoy: string = hoyISO()): boolean {
  const semana = resumenSemana(p, hoy);
  return semana.faltan > 0 && semana.diasRestantes <= semana.faltan && semanasSeguidas(p, hoy) > 0;
}

export type MotivoDescanso = 'hoy' | 'semana' | 'seguidos' | 'meta';

/** Cuándo el plan propone descansar. Siempre es una propuesta: la persona puede
 * entrenar igual (ver `descansoIgnorado`). Reemplaza al "día 7" fijo. */
export function descansoRecomendado(p: Progreso, hoy: string = hoyISO()): MotivoDescanso | null {
  if (p.descansoIgnorado === hoy) return null;
  // Cerró una sesión hoy y todavía no empezó otra.
  if (p.ultimaFecha === hoy && p.hechosHoy.length === 0) return 'hoy';
  const fechas = fechasEntrenadas(p, hoy);
  let previos7 = 0;
  for (let i = 1; i <= 7; i++) if (fechas.has(sumarDiasISO(hoy, -i))) previos7++;
  if (previos7 >= 6) return 'semana';
  if (fechas.has(sumarDiasISO(hoy, -1)) && fechas.has(sumarDiasISO(hoy, -2)) && fechas.has(sumarDiasISO(hoy, -3))) return 'seguidos';
  if (resumenSemana(p, hoy).faltan === 0) return 'meta';
  return null;
}

/** Elige "entrenar igual" (o agregar un día): no se vuelve a proponer descanso
 * hoy. `ligero` = día extra ligero en vez de la siguiente sesión. */
export function entrenarIgual(p: Progreso, ligero: boolean): Progreso {
  return { ...p, descansoIgnorado: hoyISO(), extraHoy: ligero };
}
