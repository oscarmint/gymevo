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
import { RefreshCcw } from 'lucide-react';
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

  if (!cargado || !respuestas) {
    // Esqueleto con la forma de la pantalla (nunca pantalla en blanco).
    return (
      <div aria-hidden="true" className="min-h-dvh bg-[var(--bg)] px-5 pt-8 pb-10">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
          <div className="mx-auto h-3 w-32 rounded-full bg-[var(--surface-2)]" />
          <div className="mx-auto h-7 w-64 rounded-lg bg-[var(--surface-2)]" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[74px] rounded-2xl bg-[var(--surface)]" />
          ))}
        </div>
      </div>
    );
  }

  const diasPlan = diasDePlan(respuestas.diasSemana);
  const sesionDia1 = sesionDelCiclo(0, diasPlan);
  const ejerciciosBase = ejerciciosDeSesion(sesionDia1, respuestas.nivel);
  const ejercicios = aplicarReemplazos(ejerciciosBase, cambios);
  const nombreDia1 = nombreDeSesion(sesionDia1);
  // Las demás sesiones de SU plan (según los días que eligió), no nombres de relleno.
  const restoSemana = Array.from({ length: diasPlan - 1 }, (_, i) => {
    const sesion = sesionDelCiclo(i + 1, diasPlan);
    return { nombre: nombreDeSesion(sesion), ejercicios: ejerciciosDeSesion(sesion, respuestas.nivel).slice(0, 3).map((e) => e.nombre) };
  });

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
                      : i === 0 && !ultimoCambio
                        ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--accent)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_22%,transparent)]'
                        : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-tertiary)]'
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
                : '¿Máquina ocupada? Pruébalo ahora: toca ↻ en el primer ejercicio.'}
            </p>
          </motion.div>
        </div>

        {/* El resto de la ruta — bloqueado con honestidad, no relleno inventado */}
        {restoSemana.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            El resto de tu semana
          </p>
          {/* Curiosidad en vez de candado (25/09/2026): los días que siguen se
              ven vagamente bajo un desenfoque — la persona reconoce que hay
              plan real detrás — y el texto encima invita a desbloquearlos. */}
          <div className="relative mt-3">
            <div aria-hidden="true" className="flex flex-col gap-2 blur-[5px] select-none">
              {restoSemana.map((dia, i) => (
                <div key={`${i}-${dia.nombre}`} className="rounded-xl bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{dia.nombre}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{dia.ejercicios.join(' · ')}</p>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="rounded-full border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[color-mix(in_oklab,var(--bg)_94%,transparent)] px-4 py-2 text-sm font-bold text-[var(--text-primary)]">
                Desbloquea tu semana completa
              </p>
            </div>
          </div>
        </div>
        )}

        {/* CTA fijo al borde inferior: se ve sin bajar por todo el plan. */}
        <div className="sticky bottom-0 z-20 -mx-5 mt-8 bg-[color-mix(in_oklab,var(--bg)_92%,transparent)] px-5 pb-4 pt-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => router.push('/paywall')}
            className="boton-3d flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)]"
          >
            Activar mi plan completo
          </button>
          <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
            Prueba de 7 días ya activa, sin tarjeta · pago único, sin renovación · Garantía del Primer Plan Claro: 7 días tras pagar
          </p>
        </div>
      </motion.div>
    </div>
  );
}
