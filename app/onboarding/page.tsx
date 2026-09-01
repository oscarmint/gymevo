'use client';

// ONBOARDING — Sesión 4 (02B + 50). Modelo onboarding-first (02C): el usuario
// responde SIN cuenta y ve su plan antes de que se le pida pagar. Las preguntas
// ecoan los dolores de FICHA-AVATAR.md (57) y el ESTADO.md → "Avatar y venta".

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { Check, ChevronLeft, NotebookPen, RefreshCcw, ShieldAlert, Users, X, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { guardarRespuestas, HORARIO_LABEL, META_LABEL, NIVEL_LABEL, type Horario, type Meta, type Nivel } from '@/lib/onboarding';

type PasoId = 'nivel' | 'meta' | 'frustracion' | 'reconocimiento' | 'horario' | 'compromiso';

const PASOS: PasoId[] = ['nivel', 'meta', 'frustracion', 'reconocimiento', 'horario', 'compromiso'];

interface Opcion<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

const OPCIONES_NIVEL: Opcion<Nivel>[] = [
  { value: 'principiante', label: 'Recién empiezo, no sé qué hacer' },
  { value: 'intermedio', label: 'Ya entreno pero estoy estancado' },
];

const OPCIONES_META: Opcion<Meta>[] = [
  { value: 'musculo', label: 'Ganar músculo' },
  { value: 'grasa', label: 'Perder grasa' },
];

const OPCIONES_FRUSTRACION: Opcion<string>[] = [
  { value: 'maquinas', label: 'Las máquinas siempre están ocupadas', icon: RefreshCcw },
  { value: 'entrenadores', label: 'Los entrenadores no me hacen caso', icon: Users },
  { value: 'lesion', label: 'Me da miedo lesionarme por mala técnica', icon: ShieldAlert },
  { value: 'apps', label: 'Ya probé apps que me cambian la rutina cada día', icon: Zap },
];

const RECONOCIMIENTO_POR_FRUSTRACION: Record<string, string> = {
  maquinas:
    'No es que te falte constancia: cada vez que la máquina está ocupada, pierdes el hilo de tu plan y terminas improvisando. Por eso existe el Botón de Rescate — otro ejercicio al instante, sin perder el día.',
  entrenadores:
    'No es que no merezcas ayuda: un entrenador de planta no puede darte atención personalizada a las 6 PM con el gimnasio lleno. GymEvo es el entrenador que sí está pendiente de ti, todos los días.',
  lesion:
    'Ese miedo es válido — casi nadie te explica bien la técnica en un gimnasio comercial. Por eso cada ejercicio de tu plan trae la forma correcta de hacerlo, sin que tengas que adivinar.',
  apps: 'Cada vez que una app te cambió la rutina de la nada, no aprendiste nada nuevo — solo te confundiste más. GymEvo no hace eso: tu plan es fijo, con salida cuando la necesitas, no un algoritmo caótico.',
};

const OPCIONES_HORARIO: Opcion<Horario>[] = [
  { value: 'manana', label: 'En la mañana' },
  { value: 'mediodia', label: 'Al mediodía' },
  { value: 'tarde', label: 'En la tarde (hora pico)' },
  { value: 'noche', label: 'En la noche' },
];

function feedbackDias(dias: number): string {
  if (dias <= 3) return 'Meta suave para empezar sin abandonar';
  if (dias <= 5) return 'Meta realista — el punto ideal para progresar';
  return 'Meta ambiciosa — te acompañamos con el Botón de Rescate';
}

export default function OnboardingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pasoIdx, setPasoIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const [nivel, setNivel] = useState<Nivel | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [frustracion, setFrustracion] = useState<string | null>(null);
  const [horario, setHorario] = useState<Horario | null>(null);
  const [dias, setDias] = useState(4);

  const avanzando = useRef(false);

  const paso = PASOS[pasoIdx];
  const progreso = Math.round(((pasoIdx + 1) / PASOS.length) * 100);
  const progresoMostrado = Math.max(progreso, 8); // truco de arranque (50 → A2)

  function ir(siguiente: number) {
    setDir(siguiente > pasoIdx ? 1 : -1);
    setPasoIdx(siguiente);
  }

  function seleccionarYAvanzar<T>(setter: (v: T) => void, valor: T) {
    if (avanzando.current) return;
    avanzando.current = true;
    setter(valor);
    setTimeout(() => {
      avanzando.current = false;
      if (pasoIdx < PASOS.length - 1) ir(pasoIdx + 1);
      else terminar();
    }, 320);
  }

  function terminar() {
    guardarRespuestas({
      nivel: nivel ?? 'principiante',
      meta: meta ?? 'musculo',
      frustracion: frustracion ?? 'apps',
      horario: horario ?? 'tarde',
      diasSemana: dias,
    });
    router.push('/onboarding/generando');
  }

  const variants: Variants = {
    enter: (d: 1 | -1) => ({ x: reduce ? 0 : d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: 1 | -1) => ({ x: reduce ? 0 : d * -24, opacity: 0 }),
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] px-5 pt-4 pb-8 [font-family:var(--font-body)]">
      {/* Profundidad sutil (DESIGN-CORE): nunca un fill plano, ni en pantallas cortas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(700px 420px at 15% -10%, color-mix(in oklab, var(--accent) 18%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(620px 460px at 100% 55%, color-mix(in oklab, var(--accent-2) 16%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(560px 380px at 100% 100%, color-mix(in oklab, var(--accent-2) 12%, transparent) 0%, transparent 55%)',
        }}
      />

      {/* Barra superior: atrás + progreso + salir — SIEMPRE visible (02B regla 3).
          "Salir" existe siempre (no solo cuando Atrás está deshabilitado): control
          y libertad real, sin obligar a devolverse paso a paso para abandonar. */}
      <div className="mx-auto flex w-full max-w-md items-center gap-3">
        <button
          type="button"
          aria-label="Atrás"
          onClick={() => pasoIdx > 0 && ir(pasoIdx - 1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] disabled:opacity-30"
          disabled={pasoIdx === 0}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            animate={{ width: `${progresoMostrado}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <button
          type="button"
          aria-label="Salir del cuestionario"
          onClick={() => router.push('/')}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-tertiary)]"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {paso === 'nivel' && (
            <PantallaPregunta key="nivel" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuál es tu situación hoy?" micro="Esto decide tu ruta: Principiante o Intermedio" />
              <Chips opciones={OPCIONES_NIVEL} valor={nivel} onSelect={(v) => seleccionarYAvanzar(setNivel, v)} />
              <TarjetaRuta nivel={nivel} meta={meta} horario={horario} dias={null} />
            </PantallaPregunta>
          )}

          {paso === 'meta' && (
            <PantallaPregunta key="meta" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuál es tu meta ahora?" micro="Esto define el enfoque de tu plan" />
              <Chips opciones={OPCIONES_META} valor={meta} onSelect={(v) => seleccionarYAvanzar(setMeta, v)} />
              <TarjetaRuta nivel={nivel} meta={meta} horario={horario} dias={null} />
            </PantallaPregunta>
          )}

          {paso === 'frustracion' && (
            <PantallaPregunta key="frustracion" dir={dir} variants={variants}>
              <Pregunta titulo="¿Qué es lo que más te frustra hoy?" />
              <Chips
                opciones={OPCIONES_FRUSTRACION}
                valor={frustracion}
                onSelect={(v) => seleccionarYAvanzar(setFrustracion, v)}
              />
              <TarjetaRuta nivel={nivel} meta={meta} horario={horario} dias={null} />
            </PantallaPregunta>
          )}

          {paso === 'reconocimiento' && (
            <PantallaPregunta key="reconocimiento" dir={dir} variants={variants}>
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span
                  aria-hidden="true"
                  className="mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)]"
                >
                  {/* Celebración N1 de FICHA-ARTE: "trazo verde" que se dibuja,
                      no un ícono estático — único momento emocional del flujo. */}
                  <motion.svg width={28} height={28} viewBox="0 0 28 28" fill="none">
                    <motion.path
                      d="M6 14.5l5.5 5.5L22 9"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: reduce ? 1 : 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                    />
                  </motion.svg>
                </span>
                <h1 className="text-balance text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
                  Te entendemos
                </h1>
                <p className="mt-4 max-w-xs text-base leading-relaxed text-[var(--text-secondary)]">
                  {RECONOCIMIENTO_POR_FRUSTRACION[frustracion ?? 'apps']}
                </p>
              </div>
              <button
                type="button"
                onClick={() => ir(pasoIdx + 1)}
                className="mt-6 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
              >
                Continuar
              </button>
            </PantallaPregunta>
          )}

          {paso === 'horario' && (
            <PantallaPregunta key="horario" dir={dir} variants={variants}>
              <Pregunta titulo="¿A qué hora entrenas normalmente?" micro="Así te avisamos a la hora que sí revisas la app" />
              <Chips opciones={OPCIONES_HORARIO} valor={horario} onSelect={(v) => seleccionarYAvanzar(setHorario, v)} />
              <TarjetaRuta nivel={nivel} meta={meta} horario={horario} dias={null} />
            </PantallaPregunta>
          )}

          {paso === 'compromiso' && (
            <PantallaPregunta key="compromiso" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuántos días entrenarás por semana?" />
              <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-5xl font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                  {dias}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">días/semana</span>
              </div>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={dias}
                onChange={(e) => setDias(Number(e.target.value))}
                className="mt-8 w-full accent-[var(--accent)]"
                aria-label="Días de entrenamiento por semana"
              />
              <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                <span>1</span>
                <span>7</span>
              </div>
              <p className="mt-4 text-center text-sm font-medium text-[var(--accent)]">{feedbackDias(dias)}</p>
              <button
                type="button"
                onClick={terminar}
                className="mt-8 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
              >
                Fijar mi meta
              </button>
              <TarjetaRuta nivel={nivel} meta={meta} horario={horario} dias={dias} />
            </PantallaPregunta>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PantallaPregunta({
  children,
  dir,
  variants,
}: {
  children: React.ReactNode;
  dir: 1 | -1;
  variants: Variants;
}) {
  return (
    <motion.div
      custom={dir}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-1 flex-col justify-start"
    >
      {children}
    </motion.div>
  );
}

/** "Tu ruta se está armando" — llena con VALOR real el espacio que dejaban
 * vacío los pasos cortos (2-4 chips): no es relleno decorativo, es la vista
 * previa de lo que se está personalizando, con el mismo lenguaje de "cuaderno
 * que se va llenando" del dispositivo ownable de FICHA-ARTE (check = tachado). */
function TarjetaRuta({
  nivel,
  meta,
  horario,
  dias,
}: {
  nivel: Nivel | null;
  meta: Meta | null;
  horario: Horario | null;
  dias: number | null;
}) {
  const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const hayAlgunaRespuesta = nivel !== null || meta !== null || horario !== null;
  const filas: { label: string; valor: string | null }[] = [
    { label: 'Nivel', valor: nivel ? NIVEL_LABEL[nivel] : null },
    { label: 'Meta', valor: meta ? capitalizar(META_LABEL[meta]) : null },
    { label: 'Horario', valor: horario ? capitalizar(HORARIO_LABEL[horario]) : null },
    { label: 'Días/semana', valor: dias ? String(dias) : null },
  ];

  return (
    <div className="mt-10 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_30%,transparent)] bg-[var(--surface)] p-6">
      {/* Borde SÓLIDO (no punteado): los chips no-seleccionados también usan
          borde punteado — con el mismo estilo aquí, la tarjeta se leía como
          "tocable" sin serlo (hallazgo revisor-visual). El ámbar (2ª nota de
          FICHA-ARTE) vive aquí de forma REAL y visible, no solo en un
          degradé de fondo casi imperceptible. */}
      <div className="flex items-center gap-2">
        <NotebookPen size={16} color="var(--accent-2)" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent-2)]">Tu ruta se está armando</p>
      </div>

      {!hayAlgunaRespuesta ? (
        // Arranque honesto: nunca las 4 filas en "—" a la vez (se lee como
        // widget roto) — un mensaje de bienvenida mientras no hay nada que mostrar.
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          Cada respuesta se va guardando aquí, como en una libreta — vas a verla llenarse en un momento.
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {filas.map((fila, i) => (
            <div
              key={fila.label}
              className={`flex items-center justify-between ${
                i < filas.length - 1 ? 'border-b border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] pb-3' : ''
              }`}
            >
              <span className="text-sm text-[var(--text-secondary)]">{fila.label}</span>
              {fila.valor ? (
                <motion.span
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]"
                >
                  <Check size={14} color="var(--accent)" strokeWidth={3} /> {fila.valor}
                </motion.span>
              ) : (
                <span className="text-sm text-[var(--text-tertiary)]">—</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pregunta({ titulo, micro }: { titulo: string; micro?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-balance text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] [font-family:var(--font-display)]">
        {titulo}
      </h1>
      {micro && <p className="mt-2 text-sm text-[var(--text-secondary)]">{micro}</p>}
    </div>
  );
}

function Chips<T extends string>({
  opciones,
  valor,
  onSelect,
}: {
  opciones: Opcion<T>[];
  valor: T | null;
  onSelect: (v: T) => void;
}) {
  // Navegación por flechas entre chips (a11y — el tab nativo solo avanza de a
  // uno; ↑/↓ deben moverse dentro del grupo, como un radiogroup real).
  function moverFoco(desde: number, delta: 1 | -1) {
    const siguiente = (desde + delta + opciones.length) % opciones.length;
    const el = document.getElementById(`chip-${opciones[siguiente].value}`);
    el?.focus();
  }

  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {opciones.map((o, i) => {
        const seleccionado = valor === o.value;
        const Icono = o.icon;
        return (
          <motion.button
            key={o.value}
            id={`chip-${o.value}`}
            type="button"
            role="radio"
            aria-checked={seleccionado}
            onClick={() => onSelect(o.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                moverFoco(i, 1);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                moverFoco(i, -1);
              }
            }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-button)] border px-4 py-3.5 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              seleccionado
                ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                : 'border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
          >
            {Icono && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]">
                <Icono size={18} color="var(--text-secondary)" />
              </span>
            )}
            <span className="flex-1">{o.label}</span>
            {seleccionado && (
              <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="shrink-0">
                <Check size={20} color="var(--accent)" strokeWidth={2.5} />
              </motion.span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
