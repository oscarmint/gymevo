'use client';

// LOADING "CONSTRUYENDO TU PLAN" — 50 §B. No es relleno: es la apertura del
// paywall (patrón Noom). 4-6s, líneas personalizadas con respuestas reales,
// nunca un spinner genérico.

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
    `Calculando tu plan de ${dias} días/semana`,
    `Preparando tu Botón de Rescate para ${horario}`,
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
    timers.push(setTimeout(() => router.push('/paywall'), DURACION_TOTAL_MS + 500));
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
      <div className="relative flex size-[120px] items-center justify-center">
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

      <h1 className="mt-8 text-[23px] font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
        Construyendo tu plan…
      </h1>

      <ul className="mt-8 flex w-full max-w-[320px] flex-col gap-4">
        {lineas.map((texto, i) => {
          const estado = i < lineaActiva ? 'hecha' : i === lineaActiva ? 'activa' : 'pendiente';
          return (
            <motion.li
              key={texto}
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: estado === 'pendiente' ? 0.4 : 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-3 text-[15px] text-[var(--text-primary)]"
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
