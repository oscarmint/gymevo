'use client';

import { useEffect } from 'react';
import {
  CALENTAMIENTO_IMG,
  calentamientoDeSesion,
  cardioDeSesion,
  ejerciciosDeSesion,
  leerProgreso,
  leerSesionElegida,
  obtenerEjercicio,
  sesionActual,
  sesionesDelPlan,
  type Progreso,
  type SesionId,
} from '@/lib/routine';

/** Guarda en el teléfono las imágenes del plan de la persona (pedido del
 * dueño, 05/10/2026: que no dependan del internet del gimnasio). Le pide al
 * service worker (public/sw.js) que las descargue y las deje en su caché; las
 * que ya estén guardadas no se vuelven a bajar.
 *
 * Dos tandas, para no gastar datos de más:
 *   1. SIEMPRE las de HOY (la sesión que toca, su calentamiento, su cardio y
 *      la alternativa de cada ejercicio, porque el Botón de Rescate puede
 *      cambiarlo en pleno gimnasio).
 *   2. El resto de la semana, solo si no hay "ahorro de datos" activado y la
 *      conexión es buena (o el navegador no la reporta, como Safari). */
function imagenesDeSesion(sesion: SesionId, nivel: Progreso['nivel']): string[] {
  const urls: string[] = [];
  for (const ej of ejerciciosDeSesion(sesion, nivel)) {
    if (ej.imagenExplicacion) urls.push(ej.imagenExplicacion);
    const alternativa = obtenerEjercicio(ej.alternativaId);
    if (alternativa.imagenExplicacion) urls.push(alternativa.imagenExplicacion);
  }
  const tren = calentamientoDeSesion(sesion);
  if (tren) urls.push(CALENTAMIENTO_IMG[tren]);
  const cardio = cardioDeSesion(sesion, nivel);
  if (cardio.imagen) urls.push(cardio.imagen);
  return urls;
}

function unicas(urls: string[]): string[] {
  return Array.from(new Set(urls.filter(Boolean)));
}

export function PrecargarImagenes() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const conexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conexion?.saveData) return;

    const temporizador = window.setTimeout(async () => {
      try {
        const progreso = leerProgreso();
        const hoy = sesionActual(progreso, leerSesionElegida(progreso));
        const tandaHoy = unicas([...imagenesDeSesion(hoy, progreso.nivel), '/ilustraciones/entrenador-inicio.gif']);
        const tandaSemana = unicas(sesionesDelPlan(progreso.diasSemana).flatMap((s) => imagenesDeSesion(s, progreso.nivel))).filter(
          (u) => !tandaHoy.includes(u)
        );

        const registro = await navigator.serviceWorker.ready;
        registro.active?.postMessage({ tipo: 'PRECARGAR', urls: tandaHoy });

        const conexionBuena = !conexion?.effectiveType || conexion.effectiveType === '4g';
        if (conexionBuena) registro.active?.postMessage({ tipo: 'PRECARGAR', urls: tandaSemana });
      } catch {
        // Sin service worker o sin progreso legible: la app funciona igual,
        // solo que las imágenes se guardan a medida que se van viendo.
      }
    }, 2500);

    return () => window.clearTimeout(temporizador);
  }, []);

  return null;
}
