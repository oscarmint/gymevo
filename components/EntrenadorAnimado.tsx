'use client';

// Entrenador animado — pantalla de arranque de "Plan del día" (pedido
// explícito del usuario): un personaje ilustrado (SVG propio, mismo lenguaje
// visual que CuerpoMuscular.tsx — nunca una foto de un tercero) que celebra
// el inicio del entrenamiento con un gesto inventado ("puño al aire") antes
// de cargar la rutina. Alterna masculino/femenino según el sexo REAL de la
// persona (Progreso.sexo) — nunca el mismo personaje para todos, a pedido
// explícito ("no deben ser los mismos para respetar derechos").

import { motion, useReducedMotion } from 'motion/react';
import type { Sexo } from '@/lib/onboarding';

function Rafaga({ cx, cy }: { cx: number; cy: number }) {
  // "Ráfaga" de energía detrás de cada puño — 3 anillos que laten en bucle,
  // desfasados, simulando el impacto del gesto (nunca un gradiente/glow
  // regado: son trazos finitos, coherente con FICHA-ARTE).
  return (
    <>
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="11"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          initial={{ opacity: 0.55, scale: 0.6 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
    </>
  );
}

function FiguraMasculina() {
  return (
    <>
      <circle cx="100" cy="46" r="20" />
      <rect x="90" y="64" width="20" height="12" rx="4" />
      {/* Torso en V atlético */}
      <path d="M62,84 C62,78 80,74 100,74 C120,74 138,78 138,84 L128,168 C112,176 88,176 72,168 Z" />
      {/* Brazo izquierdo en alto, puño cerrado */}
      <path d="M66,86 C48,82 34,66 26,44 L40,34 C48,52 58,64 72,72 Z" />
      <circle cx="26" cy="38" r="12" />
      {/* Brazo derecho en alto, puño cerrado */}
      <path d="M134,86 C152,82 166,66 174,44 L160,34 C152,52 142,64 128,72 Z" />
      <circle cx="174" cy="38" r="12" />
      {/* Piernas en postura firme */}
      <path d="M72,168 L104,168 L98,232 L78,232 Z" />
      <path d="M96,168 L128,168 L122,232 L102,232 Z" />
      <ellipse cx="82" cy="236" rx="14" ry="7" />
      <ellipse cx="118" cy="236" rx="14" ry="7" />
    </>
  );
}

function FiguraFemenina() {
  return (
    <>
      <circle cx="100" cy="46" r="19" />
      <rect x="91" y="63" width="18" height="11" rx="4" />
      <path d="M68,82 C68,76 82,72 100,72 C118,72 132,76 132,82 L124,150 C110,158 90,158 76,150 Z" />
      <path d="M70,84 C52,80 38,64 30,42 L44,32 C52,50 62,62 76,70 Z" />
      <circle cx="30" cy="36" r="11" />
      <path d="M130,84 C148,80 162,64 170,42 L156,32 C148,50 138,62 124,70 Z" />
      <circle cx="170" cy="36" r="11" />
      <path d="M76,150 L124,150 L132,172 L68,172 Z" />
      <path d="M74,172 L100,172 L95,232 L80,232 Z" />
      <path d="M100,172 L126,172 L120,232 L105,232 Z" />
      <ellipse cx="86" cy="236" rx="13" ry="6" />
      <ellipse cx="114" cy="236" rx="13" ry="6" />
    </>
  );
}

export function EntrenadorAnimado({ sexo }: { sexo: Sexo }) {
  const reduce = useReducedMotion();

  return (
    <motion.svg
      viewBox="0 0 200 240"
      className="h-64 w-auto"
      role="img"
      aria-label={sexo === 'mujer' ? 'Entrenadora animada celebrando el inicio del entrenamiento' : 'Entrenador animado celebrando el inicio del entrenamiento'}
      initial={reduce ? undefined : { y: 0 }}
      animate={reduce ? undefined : { y: [0, -10, 0] }}
      transition={reduce ? undefined : { duration: 0.7, repeat: Infinity, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {!reduce && (
        <>
          <Rafaga cx={sexo === 'mujer' ? 30 : 26} cy={37} />
          <Rafaga cx={sexo === 'mujer' ? 170 : 174} cy={37} />
        </>
      )}
      <g fill="var(--accent)">{sexo === 'mujer' ? <FiguraFemenina /> : <FiguraMasculina />}</g>
    </motion.svg>
  );
}
