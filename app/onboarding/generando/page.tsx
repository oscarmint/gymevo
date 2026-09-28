'use client';

// LOADING "CONSTRUYENDO TU PLAN" — 50 §B. No es relleno: es la apertura del
// paywall (patrón Noom). 4-6s, líneas personalizadas con respuestas reales,
// nunca un spinner genérico. Al terminar pide el correo (login) ANTES de
// mostrar el Día 1 y el paywall: el plan ya está hecho y se guarda en su cuenta.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, NIVEL_LABEL, leerRespuestas } from '@/lib/onboarding';

const DURACION_TOTAL_MS = 4800;

export default function GenerandoPlanPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const respuestas = leerRespuestas();
  const [pct, setPct] = useState(0);
  const [lineaActiva, setLineaActiva] = useState(0);

  const nivel = respuestas ? NIVEL_LABEL[respuestas.nivel] : 'Principiante';
  const meta = respuestas ? META_LABEL[respuestas.meta] : 'ganar músculo';
  const horario = respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde';
  const dias = respuestas?.diasSemana ?? 4;

  const lineas = [
    `Analizando tu nivel: ${nivel.toLowerCase()}`,
    `Ajustando a tu meta: ${meta}`,
    'Eligiendo los ejercicios de tu nivel',
    `Armando tu plan de ${dias} días/semana`,
    'Preparando alternativas por si una máquina está ocupada',
  ];

  useEffect(() => {
    if (!respuestas) {
      router.replace('/onboarding');
      return;
    }
    const pasoMs = DURACION_TOTAL_MS / lineas.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    lineas.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setLineaActiva(i + 1);
          setPct(Math.round(((i + 1) / lineas.length) * 100));
        }, pasoMs * (i + 1))
      );
    });
    // Al llegar a 100% se muestra "Tu ruta está lista" un instante (700ms)
    // antes de pasar a la vista previa: cierre del momento, no un salto brusco.
    // 28/09/2026 (pedido del dueño): va a /onboarding/plan, NO a /login — la
    // persona ve su Día 1 real (ejercicios, series) ANTES de que se le pida
    // guardar el plan o registrarse, coherente con la regla UX #2 ("valor
    // visible antes de pedir registro"). Esa pantalla ya lee sessionStorage
    // y no necesita sesión; recién su botón "Activar mi plan completo" lleva
    // al paywall, y solo al elegir "Empezar mis 7 días gratis" ahí, proxy.ts
    // pide iniciar sesión (al intentar entrar a /app sin cuenta) — el login
    // pasa a ser la puerta natural de /app, no un paso forzado de en medio.
    timers.push(setTimeout(() => router.push('/onboarding/plan'), DURACION_TOTAL_MS + 500 + 700));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circunferencia = 2 * Math.PI * 52;

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-6 [font-family:var(--font-body)]"
      aria-live="polite"
      aria-busy={pct < 100}
    >
      <div className="relative flex size-32 items-center justify-center">
        <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            animate={{ strokeDashoffset: circunferencia - (circunferencia * pct) / 100 }}
            transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute text-[24px] font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
          {pct}%
        </span>
      </div>

      <h1 className="mt-8 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        {pct === 100 ? 'Tu ruta está lista' : 'Construyendo tu plan…'}
      </h1>

      <ul className="mt-8 flex w-full max-w-xs flex-col gap-4">
        {lineas.map((texto, i) => {
          const estado = i < lineaActiva ? 'hecha' : i === lineaActiva ? 'activa' : 'pendiente';
          return (
            <motion.li
              key={texto}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: estado === 'pendiente' ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 text-sm text-[var(--text-primary)]"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
                {estado === 'hecha' ? (
                  <Check size={18} color="var(--accent)" strokeWidth={2.5} />
                ) : estado === 'activa' ? (
                  <motion.span
                    className="size-2.5 rounded-full bg-[var(--accent)]"
                    animate={reduce ? {} : { opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                ) : (
                  <span className="size-2.5 rounded-full border border-[var(--text-tertiary)]" />
                )}
              </span>
              <span>{texto}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
