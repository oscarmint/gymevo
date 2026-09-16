// Calculadora de macros — método completo de nutrición deportiva (no solo
// g/kg de peso). Fuentes citadas explícitamente para que cualquiera pueda
// verificar los números, no "porque sí":
//
// 1. BMR (gasto en reposo): ecuación de Mifflin-St Jeor — la que respaldan
//    la Academy of Nutrition and Dietetics y el ACSM como la más precisa en
//    población general (error medio ~10%, vs. 15-20% de fórmulas viejas
//    como Harris-Benedict).
//      Hombres: 10×peso(kg) + 6.25×estatura(cm) − 5×edad + 5
//      Mujeres: 10×peso(kg) + 6.25×estatura(cm) − 5×edad − 161
//
// 2. TDEE (gasto total): BMR × factor de actividad (PAL), estándar usado en
//    fisiología del ejercicio:
//      1-2 días/semana → 1.375 (actividad ligera)
//      3-5 días/semana → 1.55  (actividad moderada)
//      6-7 días/semana → 1.725 (actividad alta)
//    Se deriva de `diasSemana` (ya lo respondió el usuario en onboarding) —
//    no hace falta preguntarlo aparte.
//
// 3. Proteína: ISSN Position Stand on Protein and Exercise (Jäger et al.,
//    2017) — 1.4-2.0 g/kg/día para ganar/mantener músculo en la mayoría de
//    quienes entrenan; hasta 2.3-3.1 g/kg/día para proteger la masa magra
//    en déficit calórico. Se usa el punto medio de cada rango según ruta.
//
// 4. Carbohidratos: ISSN — 3-5 g/kg/día en entrenamiento de fuerza general
//    (Ruta A); un poco más ajustado en déficit (Ruta B), dentro del mismo
//    marco de evidencia.
//
// 5. Grasas: ISSN — 20-35% de las calorías totales (aquí: 25%, el punto
//    medio), con un piso de 0.6 g/kg para no comprometer la salud hormonal.
//
// Las calorías YA NO se suman desde los macros (como en la versión anterior,
// más simple): ahora se calculan primero (TDEE ± superávit/déficit) y los
// macros se derivan de ahí — así el número de calorías es específico de
// cada persona (estatura, edad, sexo, cuántos días entrena), no un promedio.

import type { Meta } from './onboarding';

export type Sexo = 'hombre' | 'mujer';

export interface Macros {
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
}

export interface DatosParaMacros {
  pesoKg: number;
  estaturaCm: number;
  edad: number;
  sexo: Sexo;
  diasSemana: number;
  meta: Meta;
}

/** Mifflin-St Jeor — la ecuación de gasto en reposo más precisa disponible
 * para población general (ver fuente arriba). */
export function calcularBMR(pesoKg: number, estaturaCm: number, edad: number, sexo: Sexo): number {
  const base = 10 * pesoKg + 6.25 * estaturaCm - 5 * edad;
  return sexo === 'hombre' ? base + 5 : base - 161;
}

/** Factor de actividad (PAL) — 15/09/2026: fijo en 1.55 (moderado/alto),
 * especificación exacta dada por el usuario ("calculadora_nutricional",
 * validada por medicina deportiva) porque el programa real de GymEvo
 * entrena 6 días a la semana sin importar la ruta (Principiante o
 * Intermedio) — ya no depende de la respuesta de onboarding `diasSemana`
 * (esa sigue existiendo solo para mostrarla en Perfil, no para este cálculo).
 * Antes variaba 1.375/1.55/1.725 según los días que el usuario decía
 * entrenar; se simplifica porque el programa ya no es una elección libre. */
const FACTOR_ACTIVIDAD = 1.55;

export function factorActividad(): number {
  return FACTOR_ACTIVIDAD;
}

// Especificación exacta dada por el usuario 15/09/2026 ("calculadora_nutricional",
// validada por medicina deportiva) — reemplaza los rangos del 03/09/2026.
const PROTEINA_G_KG: Record<Meta, number> = {
  musculo: 1.8, // Ruta A: hipertrofia
  grasa: 2.1, // Ruta B: protección anticatabólica en déficit
};

// Antes se calculaba como % de las calorías; ahora es directo por kg.
const GRASA_G_KG: Record<Meta, number> = {
  musculo: 0.9,
  grasa: 0.7,
};

// Ruta A: superávit moderado para hipertrofia minimizando ganancia de grasa.
// Ruta B: déficit moderado para oxidar grasa protegiendo la masa muscular.
// Ambos sobre el TDEE real de la persona. Un déficit más agresivo (ej. -800)
// queda BLOQUEADO por diseño: el ajuste es fijo, la app nunca deja elegir un
// déficit mayor al de aquí.
const AJUSTE_KCAL: Record<Meta, number> = {
  musculo: 250,
  grasa: -400,
};

export function calcularMacros(datos: DatosParaMacros): Macros {
  const { pesoKg, estaturaCm, edad, sexo, meta } = datos;
  const bmr = calcularBMR(pesoKg, estaturaCm, edad, sexo);
  const tdee = bmr * FACTOR_ACTIVIDAD;
  // Piso de seguridad: nunca por debajo del BMR (el gasto en reposo), sin
  // importar qué tan agresivo sea el déficit — evitar una restricción
  // calórica insegura es más importante que respetar el número exacto.
  const kcal = Math.round(Math.max(tdee + AJUSTE_KCAL[meta], bmr));

  const proteinaG = Math.round(pesoKg * PROTEINA_G_KG[meta]);
  const grasasG = Math.round(pesoKg * GRASA_G_KG[meta]);

  // Los carbohidratos son el remanente calórico (kcal totales − proteína −
  // grasa) — sin piso de g/kg: la especificación 15/09/2026 los deja como
  // la variable de ajuste, no como un macro con mínimo propio.
  const carbohidratosG = Math.round((kcal - proteinaG * 4 - grasasG * 9) / 4);

  return { kcal, proteinaG, carbohidratosG, grasasG };
}
