'use client';

// ONBOARDING — Sesión 4 (02B + 50). Modelo onboarding-first (02C): el usuario
// responde SIN cuenta y ve su plan antes de que se le pida pagar. Las preguntas
// ecoan los dolores de FICHA-AVATAR.md (57) y el ESTADO.md → "Avatar y venta".

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'motion/react';
import { Check, ChevronLeft, RefreshCcw, ShieldAlert, Users, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { guardarRespuestas, type Horario, type Meta, type Nivel } from '@/lib/onboarding';

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
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] px-5 pt-4 pb-8 [font-family:var(--font-body)]">
      {/* Barra superior: atrás + progreso — SIEMPRE visible (02B regla 3) */}
      <div className="mx-auto flex w-full max-w-[420px] items-center gap-3">
        <button
          type="button"
          aria-label="Atrás"
          onClick={() => pasoIdx > 0 && ir(pasoIdx - 1)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] disabled:opacity-30"
          disabled={pasoIdx === 0}
        >
          <ChevronLeft size={22} />
        </button>
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-[var(--accent)]"
            animate={{ width: `${progresoMostrado}%` }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-[420px] flex-1 flex-col">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          {paso === 'nivel' && (
            <PantallaPregunta key="nivel" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuál es tu situación hoy?" micro="Esto decide tu ruta: Principiante o Intermedio" />
              <Chips opciones={OPCIONES_NIVEL} valor={nivel} onSelect={(v) => seleccionarYAvanzar(setNivel, v)} />
            </PantallaPregunta>
          )}

          {paso === 'meta' && (
            <PantallaPregunta key="meta" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuál es tu meta ahora?" micro="Esto define el enfoque de tu plan" />
              <Chips opciones={OPCIONES_META} valor={meta} onSelect={(v) => seleccionarYAvanzar(setMeta, v)} />
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
            </PantallaPregunta>
          )}

          {paso === 'reconocimiento' && (
            <PantallaPregunta key="reconocimiento" dir={dir} variants={variants}>
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <span
                  aria-hidden="true"
                  className="mb-6 flex size-16 items-center justify-center rounded-full bg-[var(--chip-bg)]"
                >
                  <Check size={28} color="var(--accent)" strokeWidth={2.5} />
                </span>
                <h1 className="text-balance text-[26px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
                  Te entendemos
                </h1>
                <p className="mt-4 max-w-[320px] text-[15.5px] leading-relaxed text-[var(--text-secondary)]">
                  {RECONOCIMIENTO_POR_FRUSTRACION[frustracion ?? 'apps']}
                </p>
              </div>
              <button
                type="button"
                onClick={() => ir(pasoIdx + 1)}
                className="mt-6 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[16px] font-semibold text-[var(--bg)]"
              >
                Continuar
              </button>
            </PantallaPregunta>
          )}

          {paso === 'horario' && (
            <PantallaPregunta key="horario" dir={dir} variants={variants}>
              <Pregunta titulo="¿A qué hora entrenas normalmente?" micro="Así te avisamos a la hora que sí revisas la app" />
              <Chips opciones={OPCIONES_HORARIO} valor={horario} onSelect={(v) => seleccionarYAvanzar(setHorario, v)} />
            </PantallaPregunta>
          )}

          {paso === 'compromiso' && (
            <PantallaPregunta key="compromiso" dir={dir} variants={variants}>
              <Pregunta titulo="¿Cuántos días entrenarás por semana?" />
              <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-[48px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                  {dias}
                </span>
                <span className="text-[14px] text-[var(--text-secondary)]">días/semana</span>
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
              <div className="flex justify-between text-[12px] text-[var(--text-tertiary)]">
                <span>1</span>
                <span>7</span>
              </div>
              <p className="mt-4 text-center text-[14px] font-medium text-[var(--accent)]">{feedbackDias(dias)}</p>
              <button
                type="button"
                onClick={terminar}
                className="mt-8 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[16px] font-semibold text-[var(--bg)]"
              >
                Fijar mi meta
              </button>
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
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}

function Pregunta({ titulo, micro }: { titulo: string; micro?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-balance text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] [font-family:var(--font-display)]">
        {titulo}
      </h1>
      {micro && <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">{micro}</p>}
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
  return (
    <div className="flex flex-col gap-3">
      {opciones.map((o, i) => {
        const seleccionado = valor === o.value;
        const Icono = o.icon;
        return (
          <motion.button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-button)] border px-4 py-3.5 text-left text-[16px] font-medium transition-colors ${
              seleccionado
                ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-[var(--text-primary)]'
            }`}
          >
            {Icono && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)]">
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
