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

/** Factor de actividad (PAL) derivado de cuántos días entrena por semana —
 * ya respondido en el onboarding, no hace falta una pregunta aparte. */
export function factorActividad(diasSemana: number): number {
  if (diasSemana <= 2) return 1.375;
  if (diasSemana <= 5) return 1.55;
  return 1.725;
}

// Rangos 03/09/2026 — especificación exacta dada por el usuario (arquitectura
// "REAL FISIC"), dentro del mismo marco de evidencia ISSN citado arriba. Se
// usa el punto medio de cada rango.
const PROTEINA_G_KG: Record<Meta, number> = {
  musculo: 1.8, // Ruta A: 1.6-2.0 g/kg — punto medio
  grasa: 2.1, // Ruta B (protección anticatabólica): 1.8-2.4 g/kg — punto medio
};

const CARBOHIDRATOS_G_KG: Record<Meta, number> = {
  musculo: 4, // Ruta A: 3-5 g/kg — punto medio
  grasa: 3, // Ruta B: reducidos, concentrados peri-entreno — sin rango exacto dado, se mantiene como piso
};

// Ruta A: fats 0.6-1.0 g/kg (regulación hormonal) — punto medio. Ruta B:
// 0.6-0.8 g/kg (saciedad y sistema nervioso, sin exceso calórico) — punto
// medio. Antes se calculaba como % de las calorías; ahora es directo por
// kg, tal como lo especifica la ruta.
const GRASA_G_KG: Record<Meta, number> = {
  musculo: 0.8,
  grasa: 0.7,
};

// Ruta A: superávit leve (+150/+300 kcal, punto medio +225). Ruta B: déficit
// moderado (-300/-500 kcal, punto medio -400) — ambos sobre el TDEE real de
// la persona. Un déficit más agresivo (ej. -800) queda BLOQUEADO por diseño:
// el ajuste es fijo, la app nunca deja elegir un déficit mayor al de aquí.
const AJUSTE_KCAL: Record<Meta, number> = {
  musculo: 225,
  grasa: -400,
};

export function calcularMacros(datos: DatosParaMacros): Macros {
  const { pesoKg, estaturaCm, edad, sexo, diasSemana, meta } = datos;
  const bmr = calcularBMR(pesoKg, estaturaCm, edad, sexo);
  const tdee = bmr * factorActividad(diasSemana);
  // Piso de seguridad: nunca por debajo del BMR (el gasto en reposo), sin
  // importar qué tan agresivo sea el déficit — evitar una restricción
  // calórica insegura es más importante que respetar el número exacto.
  const kcal = Math.round(Math.max(tdee + AJUSTE_KCAL[meta], bmr));

  const proteinaG = Math.round(pesoKg * PROTEINA_G_KG[meta]);
  const grasasG = Math.round(pesoKg * GRASA_G_KG[meta]);

  const kcalRestantes = kcal - proteinaG * 4 - grasasG * 9;
  const carbohidratosMinimoG = Math.round(pesoKg * CARBOHIDRATOS_G_KG[meta] * 0.5);
  const carbohidratosG = Math.max(carbohidratosMinimoG, Math.round(kcalRestantes / 4));

  return { kcal, proteinaG, carbohidratosG, grasasG };
}
