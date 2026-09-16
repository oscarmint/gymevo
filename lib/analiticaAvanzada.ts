// Analítica avanzada de progreso — Opción B de "sentir la diferencia entre
// niveles" (15/09/2026, ver ESTADO.md): solo Ruta Intermedio la ve en
// Historial. Un principiante se motiva con constancia (racha, mensajes
// simples — ya existe en Historial); alguien con más experiencia se motiva
// viendo datos reales de su progreso (volumen por músculo, fuerza estimada,
// récords) — mezclar ambos en la misma pantalla abruma al principiante y se
// queda corto para el intermedio. Funciones puras, sin estado ni React, para
// poder probarlas aisladas.

import type { GrupoMuscular } from './routine';
import { MUSCULO_LABEL, obtenerEjercicio, type RegistroLog } from './routine';

/** 1RM estimado con la fórmula de Epley — la más usada en apps de fuerza
 * (Fitbod, Strong) porque es simple y razonablemente precisa hasta ~10 reps.
 * Series con 0 peso (isométricos como la plancha) no tienen 1RM, se filtran
 * antes de llegar aquí. */
export function estimado1RM(peso: number, reps: number): number {
  if (peso <= 0 || reps <= 0) return 0;
  return Math.round(peso * (1 + reps / 30));
}

export interface VolumenGrupo {
  grupo: GrupoMuscular;
  etiqueta: string;
  volumen: number;
}

/** Volumen total (peso × reps × series, sumado) de los últimos `dias`,
 * agrupado por músculo — para responder "¿qué entrené más esta semana?" de
 * un vistazo. Ordenado de mayor a menor, solo los grupos con algo registrado. */
export function volumenPorGrupoMuscular(logs: RegistroLog[], dias = 7): VolumenGrupo[] {
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const desdeISO = desde.toISOString().slice(0, 10);

  const acumulado = new Map<GrupoMuscular, number>();
  for (const log of logs) {
    if (log.fecha < desdeISO) continue;
    const grupo = obtenerEjercicio(log.ejercicioId).grupoMuscular;
    const volumen = log.peso * log.reps * log.series;
    acumulado.set(grupo, (acumulado.get(grupo) ?? 0) + volumen);
  }

  return Array.from(acumulado.entries())
    .map(([grupo, volumen]) => ({ grupo, etiqueta: MUSCULO_LABEL[grupo], volumen }))
    .sort((a, b) => b.volumen - a.volumen);
}

export interface ProgresionEjercicio {
  ejercicioId: string;
  nombre: string;
  e1rmActual: number;
  e1rmInicial: number;
  deltaPct: number | null;
  esRecordReciente: boolean;
}

/** Progresión de fuerza estimada por ejercicio: compara el 1RM estimado más
 * reciente contra el primero que se tiene registrado — mismo criterio de
 * "ancla" que ya usa `pesoInicialKg` en Perfil (nunca compara contra un
 * punto a mitad de camino, así el número no varía según cuándo se mire).
 * Solo entran ejercicios con ≥2 sesiones distintas (una sola marca no es una
 * tendencia) y con peso real (isométricos quedan fuera). Máximo 4 — más que
 * eso es ruido en una pantalla de celular (14-LEYES-DE-DISENO). */
export function progresionPorEjercicio(logs: RegistroLog[], maximo = 4): ProgresionEjercicio[] {
  const porEjercicio = new Map<string, RegistroLog[]>();
  for (const log of logs) {
    if (log.peso <= 0) continue;
    const lista = porEjercicio.get(log.ejercicioId) ?? [];
    lista.push(log);
    porEjercicio.set(log.ejercicioId, lista);
  }

  const resultado: ProgresionEjercicio[] = [];
  for (const [ejercicioId, entradas] of porEjercicio) {
    const fechasDistintas = new Set(entradas.map((e) => e.fecha));
    if (fechasDistintas.size < 2) continue;

    const ordenadas = [...entradas].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const primeraFecha = ordenadas[0].fecha;
    const ultimaFecha = ordenadas[ordenadas.length - 1].fecha;

    const e1rmInicial = Math.max(...ordenadas.filter((e) => e.fecha === primeraFecha).map((e) => estimado1RM(e.peso, e.reps)));
    const deEsaUltimaFecha = ordenadas.filter((e) => e.fecha === ultimaFecha);
    const e1rmActual = Math.max(...deEsaUltimaFecha.map((e) => estimado1RM(e.peso, e.reps)));
    const e1rmMaximoHistorico = Math.max(...ordenadas.map((e) => estimado1RM(e.peso, e.reps)));

    resultado.push({
      ejercicioId,
      nombre: obtenerEjercicio(ejercicioId).nombre,
      e1rmActual,
      e1rmInicial,
      deltaPct: e1rmInicial > 0 ? Math.round(((e1rmActual - e1rmInicial) / e1rmInicial) * 100) : null,
      // Récord reciente = el mejor 1RM de la última fecha registrada iguala
      // (o supera) el mejor de toda la historia de ese ejercicio.
      esRecordReciente: e1rmActual >= e1rmMaximoHistorico && e1rmActual > e1rmInicial,
    });
  }

  return resultado
    .sort((a, b) => {
      const fechaB = Math.max(...logs.filter((l) => l.ejercicioId === b.ejercicioId).map((l) => new Date(l.fecha).getTime()));
      const fechaA = Math.max(...logs.filter((l) => l.ejercicioId === a.ejercicioId).map((l) => new Date(l.fecha).getTime()));
      return fechaB - fechaA;
    })
    .slice(0, maximo);
}

/** El récord más reciente entre todos los ejercicios (para la celebración
 * destacada) — null si ninguno tiene una marca nueva en su última sesión. */
export function recordMasReciente(progresiones: ProgresionEjercicio[]): ProgresionEjercicio | null {
  return progresiones.find((p) => p.esRecordReciente) ?? null;
}
