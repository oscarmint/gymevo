'use client';

// PAYWALL — reescrito 03/09/2026 a especificación exacta del usuario (hard
// paywall estilo landing larga, efecto señuelo de 3 planes, cierre con
// retraso). Reemplaza la versión de 4 planes (Mensual/Trimestral/Semestral/
// Anual, todos con trial) de la ronda anterior. El Mensual pasó de "sin
// trial" a 3 días gratis el 08/09/2026 (a pedido explícito, para probar si
// mejora su conversión — cada plan define su propia duración en `PLANES`).
// 21/09/2026: se eliminó la prueba gratis y la suscripción — ahora es PAGO
// ÚNICO por N meses de acceso (PSE, Nequi, Efecty, tarjeta o PayPal), sin
// cobro automático; el usuario renueva pagando de nuevo (ver lib/planes.ts).
// El CTA abre el checkout REAL de Hotmart si las variables
// NEXT_PUBLIC_HOTMART_CHECKOUT_{MENSUAL,SEMESTRAL,ANUAL} están configuradas
// (públicas, no secretas — son la URL del link de pago). Sin ellas todavía,
// cae al mock (/login) para no romper nada mientras se conectan.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, Check, ChevronDown, Loader2, Lock, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { formatearCOP, useTRM } from '@/lib/trm';
import { PrecioAnimado } from '@/components/landing/ui';
import { DIAS_DE_PRUEBA } from '@/lib/planes';

type PlanId = 'mensual' | 'semestral' | 'anual';

const KEY_PLAN = 'gymevo_plan_elegido';

/** Estructura de 3 planes con efecto señuelo (02C): Mensual es el ANCLA caro
 * (para que el resto se vea barato); Semestral es el escalón intermedio;
 * Anual es el plan recomendado, con el mayor ahorro y el trial más largo de
 * sobra para engancharse. `trialDias: 0` significa "cobra de inmediato, sin
 * prueba" — el Mensual pasó de 0 a 3 días (07/09/2026, a pedido explícito,
 * para probar si un trial corto también mejora su conversión). */
const PLANES: Record<PlanId, { nombre: string; meses: number; precioTotal: number }> = {
  mensual: { nombre: 'Mensual', meses: 1, precioTotal: 4.99 },
  semestral: { nombre: 'Semestral', meses: 6, precioTotal: 19.99 },
  anual: { nombre: 'Anual', meses: 12, precioTotal: 29.99 },
};

/** Versión corta ("24 sep 2027") para líneas de una sola fila. */
function fechaCorta(meses: number): string {
  const f = new Date();
  f.setMonth(f.getMonth() + meses);
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(f).replace(/\./g, '');
}

/** El checkout de Hotmart solo muestra el diseño de GymEvo (Checkout Builder)
 * cuando el link lleva `checkoutMode=10`; sin él sale el diseño por defecto.
 * Se agrega aquí para no depender de cómo estén escritos los links en Vercel. */
function conDisenoGymEvo(url: string): string {
  try {
    const u = new URL(url);
    if (!u.searchParams.has('checkoutMode')) u.searchParams.set('checkoutMode', '10');
    return u.toString();
  } catch {
    return url;
  }
}

const CHECKOUT_ENV: Record<PlanId, string | undefined> = {
  mensual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_MENSUAL,
  semestral: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_SEMESTRAL,
  anual: process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL,
};

export default function PaywallPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { trm } = useTRM();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [plan, setPlan] = useState<PlanId>('anual');
  const [redirigiendo, setRedirigiendo] = useState(false);
  const [errorRedirect, setErrorRedirect] = useState<string | null>(null);
  const [puedeCerrar, setPuedeCerrar] = useState(false);
  // FAQ colapsada por defecto (hallazgo revisor-visual, 14/09/2026): el
  // scroll completo antes del CTA/cierre era muy largo — con solo 2
  // preguntas esto ya no es información crítica para decidir, así que se
  // pliega y el que quiera resolver una duda puntual la despliega.
  const [faqAbierta, setFaqAbierta] = useState(false);
  // Feedback real al tocar el botón "X" antes de tiempo (hallazgo
  // revisor-visual: verse atenuado pero no responder a un toque se sentía
  // roto — un pequeño meneo deja claro que el botón SÍ registró el toque,
  // solo que todavía no hace nada, sin acortar el tiempo de lectura pedido).
  const [cerrarMeneo, setCerrarMeneo] = useState(false);
  const [renovando, setRenovando] = useState(false);
  const [finPrueba, setFinPrueba] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // sessionStorage no existe en el servidor: leerlo en el initializer de
  // useState causa mismatch de hydration. Este efecto es la forma correcta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRespuestas(leerRespuestas());
    const params = new URLSearchParams(window.location.search);
    setRenovando(params.get('renovar') === '1');
    setFinPrueba(params.get('fin_prueba') === '1');
    // Recuerda la última elección entre visitas (hallazgo revisor-visual:
    // sin esto, un usuario que cierra y vuelve pierde su plan preferido).
    const guardado = localStorage.getItem(KEY_PLAN);
    if (guardado === 'mensual' || guardado === 'semestral' || guardado === 'anual') {
      setPlan(guardado);
    }
    // Cierre con retraso (pedido explícito): antes 2.5s, bajado a 1.5s
    // (14/09/2026, hallazgo revisor-visual: ya se ve atenuado al 40% desde
    // el día 0, así que el usuario SABE que ahí hay una salida — no hace
    // falta hacerlo esperar tanto para activarla). El botón sigue ahí todo
    // el tiempo, solo tarda en activarse (heurística 3: control y libertad).
    const t = setTimeout(() => setPuedeCerrar(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const meta = respuestas ? META_LABEL[respuestas.meta] : 'ganar músculo';
  const horario = respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde';
  const infoPlan = PLANES[plan];

  function elegirPlan(id: PlanId) {
    setPlan(id);
    localStorage.setItem(KEY_PLAN, id);
  }

  function pagar() {
    const enlace = CHECKOUT_ENV[plan];
    const checkoutUrl = enlace ? conDisenoGymEvo(enlace) : undefined;

    if (checkoutUrl) {
      // Hallazgo revisor-visual: saltar en silencio a un dominio externo en
      // el momento del pago es justo lo que teme el avatar ("¿es otra app
      // con cobros ocultos?"). Un aviso breve antes de salir da confianza
      // sin agregar fricción real (300ms, no un loader eterno).
      setRedirigiendo(true);
      setErrorRedirect(null);
      const tRedirect = setTimeout(() => {
        // El webhook conecta la compra a la cuenta por CORREO (ver
        // app/api/webhooks/hotmart/route.ts) — no hace falta pasar nada más
        // acá. Después de pagar, Hotmart lleva al comprador a /login.
        window.location.href = checkoutUrl;
      }, 200);
      // Si en 2.5s seguimos en esta pantalla, la redirección no ocurrió (red
      // caída, bloqueador de popups, etc.) — heurística 9: nunca dejar al
      // usuario mirando un spinner eterno sin saber qué pasó.
      const tError = setTimeout(() => {
        setRedirigiendo(false);
        setErrorRedirect(checkoutUrl);
      }, 2500);
      timersRef.current = [tRedirect, tError];
      return;
    }

    // Checkout todavía no configurado (faltan las variables de entorno) —
    // mock: pasa directo al login para no romper nada mientras se conecta.
    router.push('/login?desde=paywall');
  }

  // Hallazgo revisor-visual: durante los 2.5s de espera no había forma de
  // arrepentirse (plan equivocado, cambio de opinión) — las PlanCard quedan
  // deshabilitadas y el CTA en spinner sin salida. Cancelar detiene el salto
  // a Hotmart mientras siga pendiente.
  function cancelarRedireccion() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRedirigiendo(false);
  }

  return (
    // relative + fondo radial propio (mismo recurso de Hero/CtaFinal de la
    // landing, mismos tokens de acento) — antes era un fill plano, la única
    // de las 4 pantallas del dinero sin ningún elemento de profundidad.
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--bg)] px-5 py-6 [font-family:var(--font-body)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(560px 340px at 85% -8%, color-mix(in oklab, var(--accent) 9%, transparent) 0%, transparent 60%), ' +
            'radial-gradient(420px 300px at 0% 15%, color-mix(in oklab, var(--accent-2) 8%, transparent) 0%, transparent 55%)',
        }}
      />
      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* (5) Cierre con retraso de 1.5s (pedido explícito) — nunca
            desaparece del todo, solo tarda en activarse: sigue en el mismo
            lugar todo el tiempo (heurística 3), atenuado pero SIEMPRE
            visible (hallazgo revisor-visual: invisible del todo se sentía
            como una pantalla sin salida al abrir). Sigue siendo clickeable
            antes de tiempo (ya no pointer-events-none) para poder dar
            feedback real al toque — un meneo, en vez de no responder nada,
            que se sentía roto. */}
        <motion.button
          type="button"
          aria-label="Cerrar"
          onClick={() => {
            if (puedeCerrar) {
              router.push('/');
              return;
            }
            setCerrarMeneo(true);
          }}
          animate={cerrarMeneo && !reduce ? { x: [0, -4, 4, -3, 3, 0] } : {}}
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => setCerrarMeneo(false)}
          className={`flex size-11 items-center justify-center self-start rounded-full text-[var(--text-secondary)] transition-opacity duration-300 ${
            puedeCerrar ? 'opacity-100' : 'opacity-40'
          }`}
        >
          <X size={22} />
        </motion.button>

        {/* (1) Titular orientado al mecanismo de supervivencia en el gym —
            no "Suscríbete" — + prueba visual del Botón de Rescate. */}
        <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-sm font-semibold text-[var(--text-tertiary)]">
            {renovando ? 'Sigue donde ibas' : finPrueba ? 'Tu prueba gratis terminó' : 'Se acabó adivinar qué máquina usar'}
          </p>
          <h1 className="mt-1 text-balance text-3xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
            {renovando ? (
              <>
                Renueva tu <span className="whitespace-nowrap text-[var(--accent)]">acceso</span>
              </>
            ) : finPrueba ? (
              <>
                Elige tu <span className="whitespace-nowrap text-[var(--accent)]">plan</span> y sigue
              </>
            ) : (
              <>
                Desbloquea tu <span className="whitespace-nowrap text-[var(--accent)]">Botón de Rescate</span>
              </>
            )}
          </h1>
          <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">
            {renovando
              ? 'Los meses que elijas se suman a los que te queden. Tu racha y tu progreso siguen intactos.'
              : finPrueba
                ? 'Tu racha y tu progreso te esperan. Elige un plan y realiza el pago para seguir entrenando.'
                : `Tu plan para ${meta} ya está hecho con tus respuestas — listo para cuando entrenes ${horario}`}
          </p>
        </motion.div>

        {/* Mecanismo + timeline fusionados en UNA sola tarjeta (14/09/2026,
            hallazgo revisor-visual: eran 2 tarjetas con borde+padding+margen
            propios, sumando altura sin sumar información distinta — el
            video de prueba visual y el timeline del trial son dos pasos de
            la MISMA historia "por qué confiar en esto", no dos temas). */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 0.3 }}
          className="mt-5 overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)]"
        >
          <video
            aria-hidden="true"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-24 w-full object-cover motion-reduce:hidden"
          >
            <source src="/videos/hero-gimnasio.mp4" type="video/mp4" />
          </video>
          {/* Respaldo sin video para prefers-reduced-motion: mismo alto, sin
              movimiento, para que la tarjeta nunca se vea rota o vacía. */}
          <div className="hidden h-24 w-full bg-[var(--surface-2)] motion-reduce:block" />
          <div className="flex items-center gap-3 p-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--chip-bg)]">
              <RefreshCcw size={22} color="var(--accent)" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">¿Máquina ocupada? Un toque y listo.</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                El Botón de Rescate te da otro ejercicio al instante, sin perder el día ni improvisar.
              </p>
            </div>
          </div>
        </motion.div>

        {/* (2) Estructura de precios — Anual primero y pre-seleccionado
            (recomendado), Semestral en medio, Mensual al final (el ancla
            cara — precio más alto por mes de los 3 — para que los otros dos
            se vean baratos en contraste, efecto señuelo real). Los 3 tienen
            trial ahora; lo que los distingue es el precio, no el trial. */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.3 }}
          className="mt-6 flex flex-col gap-3"
        >
          {(['anual', 'semestral', 'mensual'] as const).map((id) => {
            const info = PLANES[id];
            const precioMes = info.precioTotal / info.meses;
            const ahorroPct = Math.round((1 - precioMes / PLANES.mensual.precioTotal) * 100);
            return (
              <PlanCard
                key={id}
                id={id}
                seleccionado={plan === id}
                onSelect={() => elegirPlan(id)}
                deshabilitado={redirigiendo}
                badge={id === 'anual' ? 'MÁS POPULAR' : undefined}
                nombre={info.nombre}
                precioMes={`$${precioMes.toFixed(2)}`}
                detalle={
                  info.meses === 1
                    ? `$${info.precioTotal.toFixed(2)} USD por 1 mes`
                    : `$${info.precioTotal.toFixed(2)} USD por ${info.meses} meses · ahorras ${ahorroPct}%`
                }
                trm={trm}
              />
            );
          })}
        </motion.div>

        {/* Confianza justo en el momento de la duda (hallazgo de revisión
            externa): la misma promesa de "Antes de empezar" vivía solo más
            abajo, lejos del botón — el usuario decide ACÁ, no en el FAQ. */}

        {/* (6) CTA — nunca dice "Suscríbete"; el texto cambia según si el
            plan elegido tiene trial o no (transparencia: el botón dice
            exactamente lo que va a pasar). */}
        <motion.button
          type="button"
          onClick={pagar}
          disabled={redirigiendo}
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          whileTap={redirigiendo ? undefined : { scale: 0.97 }}
          className="boton-3d mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-xl font-bold text-[var(--bg)] disabled:opacity-80"
        >
          {redirigiendo ? (
            <>
              <Loader2 size={18} className="animate-spin motion-reduce:animate-none" /> Te llevamos a Hotmart, pago seguro…
            </>
          ) : (
            `${renovando ? 'Renovar' : 'Activar'} mi plan · $${infoPlan.precioTotal.toFixed(2)} USD`
          )}
        </motion.button>

        {redirigiendo && (
          <button
            type="button"
            onClick={cancelarRedireccion}
            className="mt-3 flex h-11 items-center justify-center gap-1.5 self-center px-4 text-sm font-semibold text-[var(--text-secondary)]"
          >
            <X size={15} /> Cancelar
          </button>
        )}

        <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
          Pago único · acceso hasta {fechaCorta(infoPlan.meses)} · no se renueva solo
        </p>

        {/* Garantía nombrada junto al CTA (antes solo vivía en el trust row, lejos) */}
        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[var(--accent)]"
        >
          <ShieldCheck size={13} /> Garantía de devolución de 7 días, sin preguntas
        </motion.p>

        {/* Prueba gratis (21/09/2026): opción terciaria y una sola frase; cuando
            termina, proxy.ts devuelve aquí con ?fin_prueba=1 y deja de mostrarse. */}
        {!renovando && !finPrueba && (
          <motion.p
            initial={reduce ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.34, duration: 0.3 }}
            className="mt-4 text-center text-sm text-[var(--text-secondary)]"
          >
            ¿Prefieres probar antes?{' '}
            <button
              type="button"
              onClick={() => router.push('/login?desde=prueba')}
              className="min-h-11 font-semibold text-[var(--accent)] underline underline-offset-4"
            >
              {`Empieza ${DIAS_DE_PRUEBA} días gratis, sin tarjeta`}
            </button>
          </motion.p>
        )}

        {/* Si la redirección no ocurrió en unos segundos (red caída,
            bloqueador de popups, etc.) — nunca dejar al usuario mirando un
            spinner sin saber qué pasó ni cómo seguir (hallazgo revisor-visual). */}
        {errorRedirect && (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-3 flex flex-col items-center gap-2 rounded-xl border-2 border-[var(--status-warning)] bg-[color-mix(in_oklab,var(--status-warning)_8%,transparent)] px-4 py-3 text-center"
          >
            {/* El texto va en --text-primary, no en --status-warning: ese
                token no llega al contraste mínimo AA sobre el fondo cálido
                claro de la ficha — el color de aviso se queda en ícono/borde,
                que no cargan con el requisito de contraste de texto. */}
            <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)]">
              <AlertTriangle size={14} color="var(--status-warning)" /> No pudimos abrirte el pago automáticamente.
            </p>
            <a href={errorRedirect} className="text-sm font-semibold text-[var(--accent)] underline underline-offset-2">
              Toca aquí para continuar
            </a>
          </div>
        )}

        {/* (4) Transparencia radical anti-cancelación — responde de frente
            el miedo #1 (cobros ocultos) con las 3 garantías exactas
            pedidas: cancelar con un toque, aviso antes del cobro, cero
            sorpresas. */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          className="mt-8 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-5"
        >
          {/* Antes vivía aquí también un bloque de 3 viñetas (hoy no pagas /
              fecha de aviso / cancela cuando quieras) — el revisor-visual lo
              marcó como redundante casi palabra por palabra con el timeline
              de arriba (mismo plan, mismas fechas, dos veces). Se elimina y
              queda solo lo que el timeline NO cubre: las 3 dudas concretas
              en formato pregunta-respuesta. */}
          <button
            type="button"
            onClick={() => setFaqAbierta((v) => !v)}
            aria-expanded={faqAbierta}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]"
          >
            Antes de empezar
            <ChevronDown size={16} className={`transition-transform duration-200 ${faqAbierta ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {faqAbierta && (
              <motion.div
                initial={reduce ? {} : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduce ? {} : { height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4">
                  <div className="flex flex-col gap-3">
                    {/* "¿Me cobrarán hoy?" vivía aquí — se quitó (14/09/2026,
                        hallazgo revisor-visual): repetía casi palabra por
                        palabra el timeline de arriba y la línea "Hoy no
                        pagas nada" sobre el CTA. */}
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Puedo probar antes de pagar?</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Sí: {DIAS_DE_PRUEBA} días gratis con acceso completo. Cuando terminan, para seguir entrenando eliges un plan y realizas el pago.
                      </p>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Se renueva solo?</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        No. Tu acceso dura el tiempo del plan que elijas y te avisamos antes de que venza para que renueves si quieres.
                      </p>
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Hay cobros escondidos?</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                        Cero. El precio que ves arriba es lo único que pagas — nada de cargos extra.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* (8) Salida limpia — el enlace es un correo a soporte real, no una
            restauración automática (todavía no hay checkout de Hotmart
            conectado para verificarla sola) — el texto lo dice tal cual es,
            nunca promete algo que el botón no hace (hallazgo revisor-visual:
            "Restaurar compra" sonaba a acción automática para un avatar que
            ya teme los cobros ocultos). */}
        <motion.div
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.48, duration: 0.3 }}
          className="mt-5 flex items-center justify-center gap-1 text-sm text-[var(--text-tertiary)]"
        >
          <button type="button" onClick={() => router.push('/')} className="px-2 py-3">
            Ahora no
          </button>
          <span aria-hidden="true">·</span>
          <a href="mailto:gymevo@outlook.com?subject=Restaurar%20mi%20compra" className="px-2 py-3">
            ¿Ya pagaste? Escríbenos
          </a>
        </motion.div>

        {/* (9) Trust row — solo "Pago seguro" (la garantía ya se dijo junto al
            CTA; repetirla aquí de nuevo no sumaba información nueva) */}
        <motion.div
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.56, duration: 0.3 }}
          className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--text-tertiary)]"
        >
          <Lock size={14} /> Pago seguro
        </motion.div>
      </div>
    </div>
  );
}

function PlanCard({
  seleccionado,
  onSelect,
  deshabilitado,
  badge,
  nombre,
  precioMes,
  detalle,
  trm,
}: {
  id: PlanId;
  seleccionado: boolean;
  onSelect: () => void;
  deshabilitado?: boolean;
  badge?: string;
  /** "Ahorra N%" frente al precio mensual — la razón real para elegir un
   * plan más largo, no solo un adorno (curva de descuento de 02C). */
  nombre: string;
  /** Precio de referencia tachado (el dispositivo ownable de FICHA-ARTE:
   * el mismo tachado verde que marca un ejercicio completado, aplicado aquí
   * al precio "antes" — reutiliza un rasgo YA probado en vez de inventar
   * uno nuevo, tras 2 rondas fallidas con la espiral decorativa). */
  precioMes: string;
  detalle: string;
  /** TRM del día (pesos colombianos por dólar) — null mientras carga o si
   * falló, y entonces simplemente no se muestra la conversión. */
  trm: number | null;
}) {
  const precioCOP = trm ? formatearCOP(precioMes, trm) : null;
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={deshabilitado}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col rounded-[var(--radius-card)] border px-5 py-4 text-left transition-colors disabled:opacity-50 ${
        seleccionado
          ? 'boton-3d-borde border-transparent bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]'
          : 'superficie-3d border-[color-mix(in_oklab,var(--text-tertiary)_38%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {badge && (
        // bg-[var(--accent-2)] + texto --bg medía 3.68:1 (bajo el 4.5:1 de
        // AA para texto chico) — accent-2-deep + texto primario da 7.6:1,
        // misma familia tonal, ya pasa (hallazgo revisor-visual, 14/09/2026).
        <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--accent-2-deep)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--text-primary)]">
          {badge}
        </span>
      )}
      {seleccionado && (
        <motion.span
          layoutId="plan-anillo"
          aria-hidden="true"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] ring-2 ring-[var(--accent)]"
        />
      )}
      {seleccionado && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          {/* min-h-7 (hallazgo revisor-visual, 14/09/2026): Anual lleva 2
              chips, Semestral 1, Mensual ninguno — sin un alto mínimo
              reservado, las 3 cabeceras quedaban de distinto alto y el
              conjunto se sentía asimétrico. Con el piso, alinean igual
              tengan chip o no. */}
          <div className="flex min-h-7 flex-wrap items-center gap-1.5">
            <p className="text-[16px] font-semibold text-[var(--text-primary)]">{nombre}</p>
            {/* El chip "N días gratis" vivía aquí también — se quitó
                (hallazgo revisor-visual, 14/09/2026): desde que los 3 planes
                tienen trial, ya no diferencia nada y solo sumaba un tercer
                color de chip compitiendo con "Ahorra %" y "MÁS POPULAR". El
                dato del trial sigue presente, una sola vez, en la línea de
                detalle de abajo ("Tras tus N días gratis..."). */}
            {/* Mismo bug de contraste que ya se corrigió en el badge "MÁS
                POPULAR" (hallazgo revisor-visual, 14/09/2026): texto
                --accent-2 sobre su propio 16% de fondo medía ~2.8:1, bajo
                AA — accent-2-deep sólido + texto primario da 7.6:1. */}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {/* Un solo número héroe por tarjeta (hallazgo revisor-visual: el
                "USD" repetido dos veces + la conversión en su propia línea
                competían con el precio grande) — "USD" y la conversión a
                pesos ahora comparten una sola línea chica debajo. El precio
                de las tarjetas NO seleccionadas baja un escalón de tamaño y
                peso (hallazgo revisor-visual, 14/09/2026: los 3 precios
                pesaban casi igual entre sí y frente al héroe real de la
                pantalla, diluyendo la jerarquía) — el plan elegido sigue
                siendo el único número realmente protagonista. */}
            <p
              className={`leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)] ${
                seleccionado ? 'text-2xl font-bold' : 'text-lg font-semibold'
              }`}
            >
              <PrecioAnimado texto={precioMes} />
              <span className="text-xs font-normal text-[var(--text-secondary)]">/mes</span>
            </p>
            <p className="mt-0.5 text-[13px] tabular-nums text-[var(--text-secondary)]">
              USD{precioCOP ? ` · ≈ ${precioCOP}` : ''}
            </p>
          </div>
          <span
            className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
              seleccionado ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--text-tertiary)]'
            }`}
          >
            {seleccionado && <Check size={13} color="var(--bg)" strokeWidth={3} />}
          </span>
        </div>
      </div>
      {/* El "$2.50/mes" de arriba es un precio EFECTIVO (el total repartido
          entre los meses) — nunca lo que se cobra de verdad. Sin esta línea,
          quien ve un número mensual grande espera un cargo mensual chico y
          se sorprende con el cargo real (hallazgo: "la explicación no está
          clara"). Va debajo de TODA la fila (no bajo el nombre a la
          izquierda) porque el ojo termina de leer en el precio, a la derecha. */}
      <p className="mt-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-2 text-[13px] text-[var(--text-secondary)]">
        {detalle}
      </p>
    </motion.button>
  );
}
