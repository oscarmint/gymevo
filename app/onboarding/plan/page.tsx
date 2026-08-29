'use client';

// VISTA PREVIA DEL DÍA 1 — el paso que faltaba entre "generando" y el paywall
// (04-ARQUITECTURA: Onboarding → Resultado/Preview → Paywall). Cal AI y Duolingo
// nunca piden pago antes de mostrar el resultado real — este es exactamente ese
// resultado: el plan de HOY, con nombres y técnica reales, no una promesa vaga.
// El resto de días queda bloqueado con honestidad (50 §C2, variante "pérdida
// honesta"): no es blur falso de contenido inventado, es la ruta real sin abrir.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, RefreshCcw } from 'lucide-react';
import { leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { ejerciciosDeHoy, nombreDeHoy, tituloRuta } from '@/lib/routine';

const NOMBRES_RESTO_SEMANA = ['Tirón', 'Piernas', 'Full body'];

export default function VistaPreviaDiaUnoPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [cargado, setCargado] = useState(false);

  // sessionStorage no existe en el servidor: leerlo en el initializer de
  // useState causa mismatch de hydration. Este efecto es la forma correcta.
  useEffect(() => {
    const r = leerRespuestas();
    if (!r) {
      router.replace('/onboarding');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRespuestas(r);
    setCargado(true);
  }, [router]);

  if (!cargado || !respuestas) return null;

  const ejercicios = ejerciciosDeHoy(1);
  const nombreDia1 = nombreDeHoy(1);

  return (
    <div className="min-h-dvh bg-[var(--bg)] px-5 pt-8 pb-10 [font-family:var(--font-body)]">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto w-full max-w-md"
      >
        <p className="text-center text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">
          {tituloRuta(respuestas.nivel, respuestas.meta)}
        </p>
        <h1 className="mt-2 text-balance text-center text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
          Tu Día 1: {nombreDia1}
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Hecho con tus respuestas — nada que armar, nada que adivinar.
        </p>

        {/* Día 1 — el resultado REAL, no una promesa (5 trabajos del onboarding: crear deseo) */}
        <div className="mt-6 flex flex-col gap-3">
          {ejercicios.map((ej, i) => (
            <motion.div
              key={ej.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className="rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-4"
            >
              <p className="text-base font-semibold text-[var(--text-primary)]">{ej.nombre}</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {ej.series}×{ej.reps} · tempo {ej.tempo} · descanso {ej.descansoSeg}s
              </p>
            </motion.div>
          ))}

          {/* Botón de Rescate, presente desde el Día 1 — el mecanismo, no una lista de features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + ejercicios.length * 0.06 }}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--chip-bg)] p-4"
          >
            <RefreshCcw size={18} color="var(--accent)" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              ¿Máquina ocupada? Un toque y tienes tu alternativa.
            </p>
          </motion.div>
        </div>

        {/* El resto de la ruta — bloqueado con honestidad, no relleno inventado */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            El resto de tu semana
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {NOMBRES_RESTO_SEMANA.map((nombre) => (
              <div
                key={nombre}
                className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3 opacity-70"
              >
                <span className="text-sm font-medium text-[var(--text-secondary)]">{nombre}</span>
                <Lock size={15} color="var(--text-tertiary)" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">Se desbloquea con tu plan</p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/paywall')}
          className="mt-8 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_25%,transparent)]"
        >
          Ver mi plan completo
        </button>
      </motion.div>
    </div>
  );
}
