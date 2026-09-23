// Calendario de entrenamientos (21/09/2026): cada día del mes se pinta según
// cuánto de su rutina se hizo. Funciones puras, sin estado ni React.
//
//   rojo      → tocaba entrenar y no se registró ninguna serie
//   amarillo  → se hizo entre 1% y menos del 80% de las series de la rutina
//   verde     → se hizo el 80% o más
//   descanso  → día de descanso completado (no cuenta como falta)
//
// El plan avanza por "día de programa" (`Progreso.diaActual`), no por fecha
// del calendario, así que la rutina de una fecha pasada no está guardada: se
// deduce comparando los ejercicios registrados ese día con cada día del
// programa (el que más coincide gana). El porcentaje = series registradas /
// series de esa rutina, sin importar si cambió un ejercicio por su
// alternativa con el Botón de Rescate.

import { TODAS_LAS_SESIONES, ejerciciosDeSesion, nombreDeSesion, obtenerEjercicio, type Ejercicio, type Progreso, type RegistroLog } from './routine';

export type EstadoDia = 'verde' | 'amarillo' | 'rojo' | 'descanso' | 'hoy_pendiente' | 'futuro' | 'sin_datos';

export interface SerieRegistrada {
  peso: number;
  reps: number;
  rir?: number;
}

export interface LineaEjercicio {
  nombre: string;
  seriesHechas: number;
  seriesPlan: number | null;
  /** Cada serie registrada ese día, en el orden en que se hicieron. */
  series: SerieRegistrada[];
}

export interface InfoDia {
  fecha: string; // YYYY-MM-DD (fecha local)
  estado: EstadoDia;
  /** 0-100, solo si hubo series registradas ese día. */
  porcentaje: number | null;
  seriesHechas: number;
  seriesPlan: number;
  ejercicios: LineaEjercicio[];
  /** Nombre de la rutina del programa que se hizo ("Pierna completa"…). */
  nombreRutina: string | null;
}

export const UMBRAL_VERDE = 0.8;

function sumarDias(fecha: string, dias: number): string {
  const [y, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(y, m - 1, d + dias));
  return f.toISOString().slice(0, 10);
}

interface RutinaPrograma {
  nombre: string;
  ejercicios: Ejercicio[];
}

/** Todas las sesiones del programa, con nombre: la persona pudo haber cambiado
 * sus días por semana, así que se compara contra todas y no solo contra su
 * plan de hoy. */
function rutinasDelPrograma(nivel: Progreso['nivel']): RutinaPrograma[] {
  return TODAS_LAS_SESIONES.map((sesion) => ({ nombre: nombreDeSesion(sesion), ejercicios: ejerciciosDeSesion(sesion, nivel) }));
}

/** La rutina del programa que más coincide con lo registrado ese día. */
function rutinaMasParecida(logs: RegistroLog[], rutinas: RutinaPrograma[]): RutinaPrograma | null {
  const idsRegistrados = new Set(logs.map((l) => l.ejercicioId));
  let mejor: RutinaPrograma | null = null;
  let mejorPuntaje = 0;
  for (const rutina of rutinas) {
    let puntaje = 0;
    for (const e of rutina.ejercicios) {
      if (idsRegistrados.has(e.id) || idsRegistrados.has(e.alternativaId)) puntaje++;
    }
    if (puntaje > mejorPuntaje) {
      mejorPuntaje = puntaje;
      mejor = rutina;
    }
  }
  return mejor;
}

function seriesDeLaRutina(rutina: RutinaPrograma): number {
  return rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);
}

/** Fechas de la racha vigente (de la primera a la última): todas cerraron su
 * día, así que un día SIN series dentro de esa ventana fue un descanso. */
function ventanaDeRacha(p: Progreso): { desde: string; hasta: string } | null {
  if (!p.ultimaFecha || p.racha <= 0) return null;
  return { desde: sumarDias(p.ultimaFecha, -(p.racha - 1)), hasta: p.ultimaFecha };
}

export function infoDelDia(p: Progreso, fecha: string, hoy: string): InfoDia {
  const vacio = (estado: EstadoDia): InfoDia => ({ fecha, estado, porcentaje: null, seriesHechas: 0, seriesPlan: 0, ejercicios: [], nombreRutina: null });

  if (fecha > hoy) return vacio('futuro');

  const logsDelDia = p.logs.filter((l) => l.fecha === fecha);

  if (logsDelDia.length === 0) {
    const inicio = p.logs.reduce<string | null>((min, l) => (min === null || l.fecha < min ? l.fecha : min), null);
    if (inicio === null || fecha < inicio) return vacio('sin_datos');

    const v = ventanaDeRacha(p);
    const enRacha = v !== null && fecha >= v.desde && fecha <= v.hasta;
    if (enRacha) return vacio('descanso');

    if (fecha === hoy) return vacio('hoy_pendiente');
    return vacio('rojo');
  }

  const rutinas = rutinasDelPrograma(p.nivel);
  const rutina = rutinaMasParecida(logsDelDia, rutinas);
  // Sin coincidencia (ids que ya no existen): se asume una rutina promedio.
  const seriesPlan = rutina
    ? seriesDeLaRutina(rutina)
    : Math.round(rutinas.reduce((acc, r) => acc + seriesDeLaRutina(r), 0) / Math.max(1, rutinas.length));
  const seriesHechas = logsDelDia.reduce((acc, l) => acc + l.series, 0);
  const fraccion = seriesPlan > 0 ? Math.min(1, seriesHechas / seriesPlan) : 1;

  // Detalle por ejercicio: lo registrado ese día (serie por serie), con las
  // series que tocaban.
  const porId = new Map<string, RegistroLog[]>();
  for (const l of logsDelDia) porId.set(l.ejercicioId, [...(porId.get(l.ejercicioId) ?? []), l]);
  const ejercicios: LineaEjercicio[] = [...porId.entries()].map(([id, registros]) => {
    const planeado = rutina?.ejercicios.find((e) => e.id === id || e.alternativaId === id) ?? null;
    return {
      nombre: obtenerEjercicio(id).nombre,
      seriesHechas: registros.reduce((acc, l) => acc + l.series, 0),
      seriesPlan: planeado ? planeado.series : null,
      series: registros.map((l) => ({ peso: l.peso, reps: l.reps, ...(l.rir !== undefined ? { rir: l.rir } : {}) })),
    };
  });

  return {
    fecha,
    estado: fraccion >= UMBRAL_VERDE ? 'verde' : 'amarillo',
    porcentaje: Math.round(fraccion * 100),
    seriesHechas,
    seriesPlan,
    ejercicios,
    nombreRutina: rutina ? rutina.nombre : null,
  };
}

export interface ResumenMes {
  verdes: number;
  amarillos: number;
  rojos: number;
  descansos: number;
}

export function resumenDelMes(dias: InfoDia[]): ResumenMes {
  const r: ResumenMes = { verdes: 0, amarillos: 0, rojos: 0, descansos: 0 };
  for (const d of dias) {
    if (d.estado === 'verde') r.verdes++;
    else if (d.estado === 'amarillo') r.amarillos++;
    else if (d.estado === 'rojo') r.rojos++;
    else if (d.estado === 'descanso') r.descansos++;
  }
  return r;
}

/** Todos los días de un mes (mes0 = 0..11), con su estado. */
export function diasDelMes(p: Progreso, anio: number, mes0: number, hoy: string): InfoDia[] {
  const total = new Date(anio, mes0 + 1, 0).getDate();
  const dias: InfoDia[] = [];
  for (let d = 1; d <= total; d++) {
    const fecha = `${anio}-${String(mes0 + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dias.push(infoDelDia(p, fecha, hoy));
  }
  return dias;
}

/** Cuántos espacios en blanco van antes del día 1 (semana que empieza en lunes). */
export function huecosIniciales(anio: number, mes0: number): number {
  const dow = new Date(anio, mes0, 1).getDay(); // 0 = domingo
  return (dow + 6) % 7;
}
