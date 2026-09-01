// "Explicación del ejercicio" — silueta de cuerpo propia (no fotos de
// terceros: ver ESTADO.md) con la zona del músculo trabajado resaltada.
// Alterna masculino/femenino por ejercicio vía generoIlustracion() en
// lib/routine.ts. Vista frontal o posterior según el músculo (se rotula
// para que nunca quede ambiguo cuál es cuál).

import type { GrupoMuscular } from '@/lib/routine';

type Genero = 'masculino' | 'femenino';
type Vista = 'frontal' | 'posterior';

const VISTA_POR_MUSCULO: Record<GrupoMuscular, Vista> = {
  pecho: 'frontal',
  hombro: 'frontal',
  biceps: 'frontal',
  cuadriceps: 'frontal',
  core: 'frontal',
  triceps: 'posterior',
  trapecio: 'posterior',
  femoral: 'posterior',
  pantorrilla: 'posterior',
  dorsal: 'posterior',
  gluteo: 'posterior',
  espalda: 'posterior',
};

const VISTA_LABEL: Record<Vista, string> = {
  frontal: 'Vista frontal',
  posterior: 'Vista posterior',
};

/** Región resaltada por músculo — coordenadas dentro del viewBox 0 0 160 320,
 * pensadas para calzar igual sobre la silueta masculina y femenina (mismo
 * sistema de referencia: hombros ~y52, cintura ~y150, cadera ~y175). */
const REGION_POR_MUSCULO: Record<GrupoMuscular, string> = {
  pecho: 'M52,58 C52,52 66,50 80,50 C94,50 108,52 108,58 L106,88 C96,96 64,96 54,88 Z',
  hombro: 'M32,54 a14,14 0 1,0 0.1,0 Z M128,54 a14,14 0 1,0 0.1,0 Z',
  biceps: 'M26,66 C22,80 20,96 22,112 L34,112 C33,96 34,80 37,66 Z M134,66 C138,80 140,96 138,112 L126,112 C127,96 126,80 123,66 Z',
  cuadriceps: 'M50,182 L76,182 L73,248 L54,248 Z M84,182 L110,182 L106,248 L87,248 Z',
  core: 'M62,100 L98,100 L96,150 L64,150 Z',
  triceps: 'M26,66 C22,80 20,96 22,112 L34,112 C33,96 34,80 37,66 Z M134,66 C138,80 140,96 138,112 L126,112 C127,96 126,80 123,66 Z',
  trapecio: 'M56,44 C64,52 72,56 80,56 C88,56 96,52 104,44 L98,58 C92,62 68,62 62,58 Z',
  femoral: 'M50,190 L76,190 L73,246 L54,246 Z M84,190 L110,190 L106,246 L87,246 Z',
  pantorrilla: 'M55,258 L74,258 L71,300 L58,300 Z M86,258 L105,258 L102,300 L89,300 Z',
  dorsal: 'M42,70 C38,90 38,116 44,140 L60,132 C56,112 56,90 58,72 Z M118,70 C122,90 122,116 116,140 L100,132 C104,112 104,90 102,72 Z',
  gluteo: 'M48,168 C48,158 62,152 80,152 C98,152 112,158 112,168 L110,188 C96,196 64,196 50,188 Z',
  espalda: 'M58,64 L102,64 L98,140 L62,140 Z',
};

function SiluetaMasculina() {
  return (
    <>
      <ellipse cx="80" cy="26" rx="15" ry="17" />
      <rect x="72" y="38" width="16" height="10" rx="3" />
      <path d="M38,52 L122,52 L112,150 L48,150 Z" />
      <path d="M28,54 C22,56 18,64 16,76 L14,116 C14,122 22,122 24,116 L30,74 Z" />
      <path d="M132,54 C138,56 142,64 144,76 L146,116 C146,122 138,122 136,116 L130,74 Z" />
      <path d="M48,150 L112,150 L118,178 L42,178 Z" />
      <path d="M46,178 L78,178 L73,300 L52,300 Z" />
      <path d="M82,178 L114,178 L108,300 L87,300 Z" />
      <ellipse cx="60" cy="308" rx="12" ry="7" />
      <ellipse cx="100" cy="308" rx="12" ry="7" />
    </>
  );
}

function SiluetaFemenina() {
  return (
    <>
      <ellipse cx="80" cy="26" rx="14" ry="16" />
      <rect x="73" y="37" width="14" height="9" rx="3" />
      <path d="M44,50 L116,50 C110,72 104,100 100,130 L60,130 C56,100 50,72 44,50 Z" />
      <path d="M32,52 C26,54 22,62 20,74 L18,110 C18,116 25,116 27,110 L33,72 Z" />
      <path d="M128,52 C134,54 138,62 140,74 L142,110 C142,116 135,116 133,110 L127,72 Z" />
      <path d="M60,130 L100,130 L112,168 L48,168 Z" />
      <path d="M48,168 L78,168 L74,300 L54,300 Z" />
      <path d="M82,168 L112,168 L106,300 L88,300 Z" />
      <ellipse cx="61" cy="308" rx="11" ry="6" />
      <ellipse cx="99" cy="308" rx="11" ry="6" />
    </>
  );
}

export function CuerpoMuscular({ musculo, genero }: { musculo: GrupoMuscular; genero: Genero }) {
  const vista = VISTA_POR_MUSCULO[musculo];

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 160 320" className="h-56 w-auto" role="img" aria-label={`Silueta ${genero === 'masculino' ? 'masculina' : 'femenina'}, ${VISTA_LABEL[vista].toLowerCase()}, con el músculo trabajado resaltado`}>
        <g fill="var(--surface-2)" stroke="color-mix(in oklab, var(--text-tertiary) 30%, transparent)" strokeWidth="1.5" strokeLinejoin="round">
          {genero === 'masculino' ? <SiluetaMasculina /> : <SiluetaFemenina />}
        </g>
        <path d={REGION_POR_MUSCULO[musculo]} fill="var(--status-error)" opacity={0.78} />
      </svg>
      <figcaption className="text-xs font-medium text-[var(--text-tertiary)]">{VISTA_LABEL[vista]}</figcaption>
    </figure>
  );
}
