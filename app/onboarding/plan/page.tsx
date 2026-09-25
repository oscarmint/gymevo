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
import { registrarEvento } from '@/lib/analitica';
import { aplicarReemplazos, diasDePlan, ejerciciosDeSesion, nombreDeSesion, obtenerEjercicio, sesionDelCiclo, tituloRuta } from '@/lib/routine';

export default function VistaPreviaDiaUnoPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [cargado, setCargado] = useState(false);
  // Demo del Botón de Rescate: original → alternativa. Tocar de nuevo vuelve al original.
  const [cambios, setCambios] = useState<Record<string, string>>({});
  const [ultimoCambio, setUltimoCambio] = useState<string | null>(null);
  // Carga cognitiva: 5 ejercicios a la vista y el resto plegado (el plan real tiene todos).
  const [verTodos, setVerTodos] = useState(false);

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
    registrarEvento('plan_preview_view');
  }, [router]);

  if (!cargado || !respuestas) return null;

  const diasPlan = diasDePlan(respuestas.diasSemana);
  const sesionDia1 = sesionDelCiclo(0, diasPlan);
  const ejerciciosBase = ejerciciosDeSesion(sesionDia1, respuestas.nivel);
  const ejercicios = aplicarReemplazos(ejerciciosBase, cambios);
  const nombreDia1 = nombreDeSesion(sesionDia1);
  // Las demás sesiones de SU plan (según los días que eligió), no nombres de relleno.
  const restoSemana = Array.from({ length: diasPlan - 1 }, (_, i) => nombreDeSesion(sesionDelCiclo(i + 1, diasPlan)));

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
          {(verTodos ? ejercicios : ejercicios.slice(0, 5)).map((ej, i) => {
            const original = ejerciciosBase[i];
            const cambiado = ej.id !== original.id;
            return (
              <motion.div
                key={original.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + i * 0.06 }}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                  cambiado
                    ? 'border-[color-mix(in_oklab,var(--accent)_55%,transparent)] bg-[var(--chip-bg)]'
                    : 'border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-[var(--text-primary)]">{ej.nombre}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {ej.series} series de {ej.reps} · descanso {ej.descansoSeg}s
                  </p>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  aria-label={cambiado ? `Volver a ${original.nombre}` : `Probar el Botón de Rescate en ${ej.nombre}`}
                  onClick={() => {
                    setCambios((c) => {
                      const { [original.id]: _quitado, ...resto } = c;
                      return cambiado ? resto : { ...c, [original.id]: obtenerEjercicio(original.id).alternativaId };
                    });
                    setUltimoCambio(cambiado ? null : original.id);
                    if (!cambiado) registrarEvento('demo_rescate');
                  }}
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full border ${
                    cambiado
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]'
                      : 'border-[color-mix(in_oklab,var(--accent)_45%,transparent)] text-[var(--accent)]'
                  }`}
                >
                  <RefreshCcw size={18} />
                </motion.button>
              </motion.div>
            );
          })}

          {!verTodos && ejercicios.length > 5 && (
            <button
              type="button"
              onClick={() => setVerTodos(true)}
              className="flex min-h-11 items-center justify-center rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] px-4 text-sm font-semibold text-[var(--text-secondary)]"
            >
              + {ejercicios.length - 5} ejercicios más de este día
            </button>
          )}

          {/* Botón de Rescate, presente desde el Día 1 — el mecanismo, no una lista de features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + ejercicios.length * 0.06 }}
            className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] p-4"
          >
            <RefreshCcw size={18} color="var(--accent)" className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-[var(--text-primary)]" aria-live="polite">
              {ultimoCambio
                ? '¡Listo! Así de rápido cambias de ejercicio en el gym, sin perder la sesión. Toca de nuevo para volver.'
                : '¿Máquina ocupada? Pruébalo: toca ↻ en cualquier ejercicio.'}
            </p>
          </motion.div>
        </div>

        {/* El resto de la ruta — bloqueado con honestidad, no relleno inventado */}
        {restoSemana.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            El resto de tu semana
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {restoSemana.map((nombre, i) => (
              <div
                key={`${i}-${nombre}`}
                className="flex items-center justify-between rounded-xl bg-[var(--surface-2)] px-4 py-3 opacity-70"
              >
                <span className="text-sm font-medium text-[var(--text-secondary)]">{nombre}</span>
                <Lock size={15} color="var(--text-tertiary)" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-[var(--text-tertiary)]">Se desbloquea con tu plan</p>
        </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/paywall')}
          className="boton-3d mt-8 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
        >
          Ver mi plan completo
        </button>
        <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
          7 días gratis, sin tarjeta · sin renovación automática · garantía de 7 días
        </p>
      </motion.div>
    </div>
  );
}
