// "Explicación del ejercicio" — corte anatómico simplificado (hueso + tendón
// + músculo) de UN patrón de movimiento (no de cada ejercicio suelto: varios
// ejercicios comparten el mismo patrón — ver PATRON_POR_EJERCICIO en
// lib/routine.ts). Ilustración propia en SVG plano, no una foto/render de
// terceros: no hay sombreado fotorrealista, es un dibujo plano a propósito.

import type { PatronMovimiento } from '@/lib/routine';

const ARTICULACION_LABEL: Record<PatronMovimiento, string> = {
  flexion_codo: 'Codo',
  extension_codo: 'Codo',
  empuje_horizontal: 'Hombro',
  empuje_vertical: 'Hombro',
  tiron_horizontal: 'Hombro',
  tiron_vertical: 'Hombro',
  extension_rodilla: 'Rodilla',
  bisagra_cadera: 'Cadera',
  flexion_tronco: 'Tronco',
};

/** Solo el patrón "flexión de codo" (curl de bíceps/martillo) está dibujado
 * por ahora — es el que pidió el usuario primero, para validar el estilo
 * antes de dibujar los otros 8 patrones. */
function CorteFlexionCodo() {
  return (
    <>
      {/* Brazo (piel) — hombro a la izquierda, mano con mancuerna a la derecha */}
      <path
        d="M40,120 C40,96 56,84 78,84 C104,84 130,92 160,104 C200,120 230,132 255,136 C275,139 285,148 285,158 C285,168 275,176 258,176 C228,172 194,158 158,142 C124,128 96,120 74,120 C56,120 40,140 40,120 Z"
        fill="var(--anatomia-piel)"
        stroke="color-mix(in oklab, var(--text-tertiary) 25%, transparent)"
        strokeWidth="1.5"
      />
      {/* Hueso — húmero (arriba) y radio/cúbito (antebrazo) asomando en el corte */}
      <path d="M64,102 C90,98 118,102 150,114 L150,124 C118,114 90,110 64,118 Z" fill="var(--anatomia-hueso)" />
      <path d="M160,120 C190,132 220,140 248,146 L246,156 C218,148 188,140 158,130 Z" fill="var(--anatomia-hueso)" />
      {/* Articulación del codo (cápsula) */}
      <circle cx="158" cy="130" r="14" fill="var(--anatomia-hueso)" stroke="color-mix(in oklab, var(--text-tertiary) 20%, transparent)" strokeWidth="1" />
      {/* Tendones — inserciones del músculo (celeste, como en el corte de referencia) */}
      <path d="M72,104 C80,100 90,99 100,101 L99,110 C90,108 81,109 74,113 Z" fill="var(--anatomia-tendon)" />
      <path d="M140,120 C150,124 158,128 163,133 L157,141 C151,136 144,132 136,129 Z" fill="var(--anatomia-tendon)" />
      {/* Músculo (bíceps) — vientre entre los dos tendones, con líneas de fibra */}
      <path
        d="M96,100 C118,98 140,106 155,120 C145,128 132,131 118,127 C104,123 92,113 96,100 Z"
        fill="var(--status-error)"
      />
      <path d="M104,107 C118,110 132,116 144,122" stroke="color-mix(in oklab, var(--text-primary) 20%, transparent)" strokeWidth="1" fill="none" opacity={0.5} />
      <path d="M100,113 C114,117 128,122 140,127" stroke="color-mix(in oklab, var(--text-primary) 20%, transparent)" strokeWidth="1" fill="none" opacity={0.5} />
      {/* Mancuerna */}
      <circle cx="272" cy="152" r="14" fill="var(--accent-2)" />
      <circle cx="298" cy="164" r="14" fill="var(--accent-2)" />
      <rect x="270" y="154" width="32" height="8" rx="4" fill="color-mix(in oklab, var(--accent-2) 70%, black)" transform="rotate(24 286 158)" />
      {/* Flecha de movimiento */}
      <path
        d="M230,60 C210,70 195,90 190,112"
        fill="none"
        stroke="var(--text-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        markerEnd="url(#flecha)"
      />
      <defs>
        <marker id="flecha" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--text-primary)" />
        </marker>
      </defs>
    </>
  );
}

const ILUSTRACION_POR_PATRON: Partial<Record<PatronMovimiento, () => React.JSX.Element>> = {
  flexion_codo: CorteFlexionCodo,
};

/** Para que el llamador decida si muestra este corte o cae de vuelta a la
 * silueta de cuerpo completo (CuerpoMuscular) — sin renderizar nada primero. */
export function hayCorteAnatomico(patron: PatronMovimiento): boolean {
  return patron in ILUSTRACION_POR_PATRON;
}

export function CorteAnatomico({ patron }: { patron: PatronMovimiento }) {
  const Ilustracion = ILUSTRACION_POR_PATRON[patron];

  if (!Ilustracion) {
    // Patrones sin ilustración todavía (los otros 8) — no se rompe, solo no
    // muestra corte; el modal cae de vuelta a algo simple en el llamador.
    return null;
  }

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 310 190" className="h-40 w-full max-w-sm" role="img" aria-label={`Corte anatómico del ${ARTICULACION_LABEL[patron].toLowerCase()} mostrando el músculo trabajado`}>
        <Ilustracion />
      </svg>
      <figcaption className="max-w-xs text-center text-xs leading-relaxed text-[var(--text-secondary)]">
        Al subir el peso el músculo se <strong className="text-[var(--text-primary)]">acorta</strong> (concéntrica); al bajarlo
        controlado, se <strong className="text-[var(--text-primary)]">alarga</strong> (excéntrica) — las dos partes cuentan.
      </figcaption>
    </figure>
  );
}
