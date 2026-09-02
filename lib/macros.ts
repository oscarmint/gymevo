// Calculadora de macros — ebook "Transformación en 90 días", cap. 3.
// Ruta A (ganar músculo) y Ruta B (bajar grasa) usan el mismo entrenamiento
// (los ejercicios son casi los mismos); lo que cambia es la alimentación.
// Se calcula directo en g/kg de peso corporal (el punto medio del rango que
// da el ebook), sin pedirle al usuario que calcule su gasto calórico — las
// calorías salen de sumar los tres macros, no al revés.

import type { Meta } from './onboarding';

export interface Macros {
  kcal: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
}

const GRAMOS_POR_KG: Record<Meta, { proteina: number; carbohidratos: number; grasas: number }> = {
  // Ruta A — Ganar músculo: proteína 1.6-2.0, carbohidratos 3-5, grasas 0.7-1 g/kg (puntos medios).
  musculo: { proteina: 1.8, carbohidratos: 4, grasas: 0.85 },
  // Ruta B — Bajar grasa y tonificar: proteína 1.8-2.4 (más alta, protege músculo en déficit),
  // carbohidratos más ajustados, grasas 0.6-0.8 g/kg (puntos medios).
  grasa: { proteina: 2.1, carbohidratos: 2.5, grasas: 0.7 },
};

export function calcularMacros(pesoKg: number, meta: Meta): Macros {
  const g = GRAMOS_POR_KG[meta];
  const proteinaG = Math.round(pesoKg * g.proteina);
  const carbohidratosG = Math.round(pesoKg * g.carbohidratos);
  const grasasG = Math.round(pesoKg * g.grasas);
  const kcal = Math.round(proteinaG * 4 + carbohidratosG * 4 + grasasG * 9);
  return { kcal, proteinaG, carbohidratosG, grasasG };
}
