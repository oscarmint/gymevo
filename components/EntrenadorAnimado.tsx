'use client';

// Entrenador animado — pantalla de arranque de "Plan del día" (pedido
// explícito del usuario, con referencia de estilo "flat design" entregada
// en el chat). Ilustración propia en SVG (no una foto/asset de un tercero:
// no hay generador de imágenes disponible en esta sesión, así que se
// construye a mano con figuras planas — mismo criterio que CuerpoMuscular.tsx)
// haciendo un curl de mancuerna en bucle. Alterna hombre/mujer según el sexo
// REAL de la persona (Progreso.sexo) — nunca el mismo personaje para todos,
// a pedido explícito ("no deben ser los mismos para respetar derechos").

import { motion, useReducedMotion } from 'motion/react';
import type { Sexo } from '@/lib/onboarding';

/** Rango del curl: brazo casi extendido → mancuerna junto al hombro. El
 * pivote (transformOrigin) es el codo, no el hombro — así el antebrazo gira
 * de verdad en vez de mover todo el brazo. */
function BrazoConMancuerna({ codo, reduce }: { codo: { x: number; y: number }; reduce: boolean }) {
  return (
    <motion.g
      style={{ transformOrigin: `${codo.x}px ${codo.y}px` }}
      initial={reduce ? undefined : { rotate: -6 }}
      animate={reduce ? undefined : { rotate: -92 }}
      transition={reduce ? undefined : { duration: 0.55, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      {/* Antebrazo */}
      <rect x={codo.x - 6} y={codo.y - 2} width="12" height="34" rx="6" fill="var(--ilustracion-piel)" />
      {/* Mancuerna */}
      <g transform={`translate(${codo.x}, ${codo.y + 34})`}>
        <rect x="-13" y="-5" width="26" height="10" rx="3" fill="var(--text-tertiary)" />
        <rect x="-16" y="-8" width="7" height="16" rx="2" fill="var(--ilustracion-ropa-1)" />
        <rect x="9" y="-8" width="7" height="16" rx="2" fill="var(--ilustracion-ropa-1)" />
      </g>
    </motion.g>
  );
}

function Cara({ sonrisaAncha = true }: { sonrisaAncha?: boolean }) {
  return (
    <>
      <circle cx="92" cy="52" r="2.4" fill="var(--surface)" />
      <circle cx="108" cy="52" r="2.4" fill="var(--surface)" />
      <path d={sonrisaAncha ? 'M90,60 Q100,68 110,60' : 'M92,60 Q100,65 108,60'} stroke="var(--surface)" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  );
}

function FiguraMasculina({ reduce }: { reduce: boolean }) {
  return (
    <>
      {/* Pelo corto */}
      <path d="M74,42 C74,26 88,18 100,18 C112,18 126,26 126,42 C126,34 118,30 100,30 C82,30 74,34 74,42 Z" fill="var(--ilustracion-pelo)" />
      {/* Cabeza */}
      <circle cx="100" cy="48" r="24" fill="var(--ilustracion-piel)" />
      <Cara />
      {/* Cuello + torso (camiseta) */}
      <rect x="92" y="68" width="16" height="12" rx="4" fill="var(--ilustracion-piel)" />
      <path d="M64,88 C64,80 82,76 100,76 C118,76 136,80 136,88 L130,168 C110,176 90,176 70,168 Z" fill="var(--ilustracion-ropa-1)" />
      {/* Brazo relajado (izquierdo del personaje) */}
      <path d="M68,90 C56,96 50,112 52,132 L64,132 C63,114 66,100 76,92 Z" fill="var(--ilustracion-piel)" />
      {/* Brazo con mancuerna (derecho del personaje) — el que se anima */}
      <path d="M132,90 C142,94 148,104 150,116 L138,120 C136,110 132,102 124,96 Z" fill="var(--ilustracion-piel)" />
      <BrazoConMancuerna codo={{ x: 144, y: 118 }} reduce={reduce} />
      {/* Shorts + piernas */}
      <path d="M70,168 L130,168 L136,192 L64,192 Z" fill="var(--ilustracion-ropa-2)" />
      <path d="M68,192 L98,192 L94,244 L76,244 Z" fill="var(--ilustracion-piel)" />
      <path d="M102,192 L132,192 L124,244 L108,244 Z" fill="var(--ilustracion-piel)" />
      <rect x="70" y="244" width="30" height="12" rx="5" fill="var(--ilustracion-pelo)" />
      <rect x="102" y="244" width="30" height="12" rx="5" fill="var(--ilustracion-pelo)" />
    </>
  );
}

function FiguraFemenina({ reduce }: { reduce: boolean }) {
  return (
    <>
      {/* Cabello largo, detrás del cuerpo */}
      <path d="M70,50 C68,80 68,110 74,132 L86,128 C82,104 82,76 86,54 Z" fill="var(--ilustracion-pelo)" />
      <path d="M130,50 C132,80 132,110 126,132 L114,128 C118,104 118,76 114,54 Z" fill="var(--ilustracion-pelo)" />
      <path d="M74,40 C74,24 86,16 100,16 C114,16 126,24 126,40 C126,30 116,26 100,26 C84,26 74,30 74,40 Z" fill="var(--ilustracion-pelo)" />
      {/* Cabeza */}
      <circle cx="100" cy="47" r="23" fill="var(--ilustracion-piel)" />
      <Cara />
      <rect x="92" y="66" width="16" height="11" rx="4" fill="var(--ilustracion-piel)" />
      {/* Torso (top deportivo), más entallado en la cintura */}
      <path d="M68,86 C68,79 84,75 100,75 C116,75 132,79 132,86 L126,140 C110,148 90,148 74,140 Z" fill="var(--ilustracion-ropa-2)" />
      <path d="M72,90 C60,96 54,111 56,130 L67,130 C66,113 69,100 78,92 Z" fill="var(--ilustracion-piel)" />
      <path d="M128,90 C138,94 144,103 146,115 L135,119 C133,109 129,101 122,95 Z" fill="var(--ilustracion-piel)" />
      <BrazoConMancuerna codo={{ x: 140, y: 117 }} reduce={reduce} />
      {/* Leggings */}
      <path d="M74,140 L126,140 L132,164 L68,164 Z" fill="var(--ilustracion-ropa-1)" />
      <path d="M72,164 L98,164 L96,244 L80,244 Z" fill="var(--ilustracion-ropa-1)" />
      <path d="M102,164 L128,164 L120,244 L104,244 Z" fill="var(--ilustracion-ropa-1)" />
      <rect x="74" y="244" width="26" height="11" rx="5" fill="var(--ilustracion-pelo)" />
      <rect x="100" y="244" width="26" height="11" rx="5" fill="var(--ilustracion-pelo)" />
    </>
  );
}

export function EntrenadorAnimado({ sexo }: { sexo: Sexo }) {
  const reduce = !!useReducedMotion();

  return (
    <svg
      viewBox="0 0 200 260"
      className="h-64 w-auto"
      role="img"
      aria-label={sexo === 'mujer' ? 'Entrenadora animada haciendo un curl con mancuerna' : 'Entrenador animado haciendo un curl con mancuerna'}
    >
      {sexo === 'mujer' ? <FiguraFemenina reduce={reduce} /> : <FiguraMasculina reduce={reduce} />}
    </svg>
  );
}
