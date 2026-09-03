// Datos del onboarding — se guardan en sessionStorage (sin cuenta todavía, modelo
// onboarding-first de 02C). En Sesión 6 esto se reemplaza por el estado real que
// viaja al backend (Supabase) tras el pago.

export type Nivel = "principiante" | "intermedio";
export type Meta = "musculo" | "grasa";
export type Horario = "manana" | "mediodia" | "tarde" | "noche";
/** Sexo biológico — solo se usa para la fórmula de gasto calórico
 * (Mifflin-St Jeor) en la calculadora de macros; no se muestra en ninguna
 * otra parte de la app. */
export type Sexo = "hombre" | "mujer";

export interface RespuestasOnboarding {
  nivel: Nivel;
  meta: Meta;
  frustracion: string;
  horario: Horario;
  diasSemana: number;
  sexo: Sexo;
}

const KEY = "gymevo_onboarding";

export function guardarRespuestas(r: RespuestasOnboarding) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(r));
}

export function leerRespuestas(): RespuestasOnboarding | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RespuestasOnboarding;
  } catch {
    return null;
  }
}

export const NIVEL_LABEL: Record<Nivel, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
};

export const SEXO_LABEL: Record<Sexo, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
};

export const META_LABEL: Record<Meta, string> = {
  musculo: "ganar músculo",
  grasa: "perder grasa",
};

export const HORARIO_LABEL: Record<Horario, string> = {
  manana: "en la mañana",
  mediodia: "al mediodía",
  tarde: "en la tarde",
  noche: "en la noche",
};
