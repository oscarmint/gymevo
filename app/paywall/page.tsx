'use client';

// PAYWALL — reescrito 03/09/2026 a especificación exacta del usuario (hard
// paywall estilo landing larga, efecto señuelo de 3 planes, trial solo en
// Semestral/Anual, cierre con retraso). Reemplaza la versión de 4 planes
// (Mensual/Trimestral/Semestral/Anual, todos con trial) de la ronda anterior.
// El CTA abre el checkout REAL de Hotmart si las variables
// NEXT_PUBLIC_HOTMART_CHECKOUT_{MENSUAL,SEMESTRAL,ANUAL} están configuradas
// (públicas, no secretas — son la URL del link de pago). Sin ellas todavía,
// cae al mock (/login) para no romper nada mientras se conectan.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, Check, Loader2, Lock, RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { formatearCOP, useTRM } from '@/lib/trm';

type PlanId = 'mensual' | 'semestral' | 'anual';

const KEY_PLAN = 'gymevo_plan_elegido';

/** Estructura de 3 planes con efecto señuelo (02C): Mensual es el ANCLA caro
 * sin trial (para que el resto se vea barato); Semestral es el escalón
 * intermedio; Anual es el plan recomendado, con el mayor ahorro y el trial
 * más largo de sobra para engancharse. El trial (7 días) va SOLO en
 * Semestral/Anual — el Mensual cobra de inmediato, a pedido explícito. */
const PLANES: Record<PlanId, { nombre: string; meses: number; precioTotal: number; trial: boolean }> = {
  mensual: { nombre: 'Mensual', meses: 1, precioTotal: 4.99, trial: false },
  semestral: { nombre: 'Semestral', meses: 6, precioTotal: 19.99, trial: true },
  anual: { nombre: 'Anual', meses: 12, precioTotal: 29.99, trial: true },
};

/** "/mes" · "/6 meses" · "/año" — evita el texto largo y con saltos raros de
 * "cada N meses" en tarjetas angostas de 375px. */
function periodoLabel(meses: number): string {
  if (meses === 1) return '/mes';
  if (meses === 12) return '/año';
  return `/${meses} meses`;
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
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // sessionStorage no existe en el servidor: leerlo en el initializer de
  // useState causa mismatch de hydration. Este efecto es la forma correcta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRespuestas(leerRespuestas());
    // Recuerda la última elección entre visitas (hallazgo revisor-visual:
    // sin esto, un usuario que cierra y vuelve pierde su plan preferido).
    const guardado = localStorage.getItem(KEY_PLAN);
    if (guardado === 'mensual' || guardado === 'semestral' || guardado === 'anual') {
      setPlan(guardado);
    }
    // Cierre con retraso (pedido explícito): 2.5s para que la oferta se
    // alcance a leer antes de poder salir — el botón sigue ahí, solo tarda
    // en activarse, nunca se esconde ni se elimina la salida por completo
    // (heurística 3: control y libertad, con un límite de tiempo razonable).
    const t = setTimeout(() => setPuedeCerrar(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const meta = respuestas ? META_LABEL[respuestas.meta] : 'ganar músculo';
  const horario = respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde';
  const infoPlan = PLANES[plan];

  function elegirPlan(id: PlanId) {
    setPlan(id);
    localStorage.setItem(KEY_PLAN, id);
  }

  function empezarTrial() {
    const checkoutUrl = CHECKOUT_ENV[plan];

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
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] px-5 py-6 [font-family:var(--font-body)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* (5) Cierre con retraso de 2.5s (pedido explícito) — nunca
            desaparece del todo, solo tarda en activarse: sigue en el mismo
            lugar todo el tiempo (heurística 3), pero no es tocable ni
            visible hasta que el usuario tuvo tiempo de leer la oferta. */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => puedeCerrar && router.push('/')}
          disabled={!puedeCerrar}
          aria-hidden={!puedeCerrar}
          tabIndex={puedeCerrar ? 0 : -1}
          className={`flex size-11 items-center justify-center self-start rounded-full text-[var(--text-secondary)] transition-opacity duration-300 ${
            puedeCerrar ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <X size={22} />
        </button>

        {/* (1) Titular orientado al mecanismo de supervivencia en el gym —
            no "Suscríbete" — + prueba visual del Botón de Rescate. */}
        <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-sm font-semibold text-[var(--text-tertiary)]">Se acabó adivinar qué máquina usar</p>
          <h1 className="mt-1 text-balance text-3xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
            Desbloquea tu <span className="whitespace-nowrap text-[var(--accent)]">Botón de Rescate</span>
          </h1>
          <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">
            Tu plan para {meta} ya está hecho con tus respuestas — listo para cuando entrenes {horario}
          </p>
        </motion.div>

        {/* Prueba visual pedida en el prompt ("una imagen o ilustración
            CLARA de la app"): el mismo video real de gimnasio que ya usan
            la landing y Plan de hoy — nunca una captura o ilustración
            inventada (32-DEL-MVP-AL-PRODUCTO: no fingir producto que no
            existe). Debajo, el ícono + copy explican el mecanismo exacto. */}
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
            className="h-36 w-full object-cover motion-reduce:hidden"
          >
            <source src="/videos/hero-gimnasio.mp4" type="video/mp4" />
          </video>
          {/* Respaldo sin video para prefers-reduced-motion: mismo alto, sin
              movimiento, para que la tarjeta nunca se vea rota o vacía. */}
          <div className="hidden h-36 w-full bg-[var(--surface-2)] motion-reduce:block" />
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

        {/* (3) Visual del valor: timeline del trial (solo si el plan
            elegido lo tiene) o el cobro directo (Mensual, sin trial). */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="mt-5 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-5"
        >
          {infoPlan.trial ? <TimelineTrial plan={plan} /> : <TimelineSinTrial plan={plan} />}
        </motion.div>

        {/* (2) Estructura de precios — Anual primero y pre-seleccionado
            (recomendado), Semestral en medio (escalón con trial), Mensual al
            final (el ancla cara, sin trial, para que los otros dos se vean
            baratos en contraste — efecto señuelo real, no decorativo). */}
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
                ahorro={ahorroPct > 0 ? `Ahorra ${ahorroPct}%` : undefined}
                trial={info.trial}
                nombre={info.nombre}
                precioTachado={id === 'anual' ? `$${PLANES.mensual.precioTotal.toFixed(2)}` : undefined}
                precioMes={`$${precioMes.toFixed(2)}`}
                detalle={info.meses === 1 ? 'Se cobra cada mes, desde hoy' : `Se cobra $${info.precioTotal.toFixed(2)}${periodoLabel(info.meses)}`}
                trm={trm}
              />
            );
          })}
        </motion.div>

        {/* (6) CTA — nunca dice "Suscríbete"; el texto cambia según si el
            plan elegido tiene trial o no (transparencia: el botón dice
            exactamente lo que va a pasar). */}
        <motion.button
          type="button"
          onClick={empezarTrial}
          disabled={redirigiendo}
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          className="boton-3d mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-xl font-bold text-[var(--bg)] disabled:opacity-80"
        >
          {redirigiendo ? (
            <>
              <Loader2 size={18} className="animate-spin motion-reduce:animate-none" /> Te llevamos a Hotmart, pago seguro…
            </>
          ) : infoPlan.trial ? (
            'Empezar mis 7 días gratis'
          ) : (
            'Activar mi Botón de Rescate'
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

        {/* Garantía nombrada junto al CTA (antes solo vivía en el trust row, lejos) */}
        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-[var(--accent-2)]"
        >
          <ShieldCheck size={13} /> Garantía Hotmart de 7 días — sin preguntas
        </motion.p>

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
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent-2)]">Antes de empezar</p>
          <div className="mt-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4">
            <ul className="flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              {[
                infoPlan.trial ? 'Hoy no pagas nada' : 'Pagas hoy, sin trial en este plan',
                infoPlan.trial ? 'Te avisamos 1 día antes del cobro' : 'Nunca un cobro extra sin avisarte antes',
                'Cancela con un solo toque, cuando quieras',
              ].map((texto) => (
                <li key={texto} className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
                    <Check size={12} color="var(--accent)" strokeWidth={3} />
                  </span>
                  {texto}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-4">
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Me cobrarán hoy?</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {infoPlan.trial
                    ? 'No. Tienes 7 días gratis. Te avisamos por correo antes de que termine tu prueba.'
                    : 'Sí — el plan Mensual se cobra desde hoy, sin período de prueba. Si prefieres probar gratis 7 días, elige Semestral o Anual arriba.'}
                </p>
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Puedo cancelar fácil?</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Sí, cuando quieras, con un toque desde tu perfil — sin llamadas ni trámites.
                </p>
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Hay cobros escondidos?</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  Cero. El precio que ves arriba es el único que se cobra — nada de cargos extra ni renovaciones sorpresa.
                </p>
              </div>
            </div>
          </div>
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
          <a href="mailto:soporte@gymevo.app?subject=Restaurar%20mi%20compra" className="px-2 py-3">
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

function TimelineTrial({ plan }: { plan: PlanId }) {
  const info = PLANES[plan];
  const nodos = [
    { estado: 'lleno' as const, titulo: 'Hoy — acceso completo', sub: 'Todo tu plan, sin límites' },
    { estado: 'lleno' as const, titulo: 'Día 6 — te avisamos', sub: 'Correo antes de cualquier cobro' },
    {
      estado: 'vacio' as const,
      titulo: `Día 7 — 1er cobro: $${info.precioTotal.toFixed(2)}${periodoLabel(info.meses)}`,
      sub: 'Cancela antes sin costo',
    },
  ];
  return (
    <div className="flex flex-col">
      {nodos.map((n, i) => (
        <div key={n.titulo} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={`size-3 shrink-0 rounded-full ${
                n.estado === 'lleno' ? 'bg-[var(--accent)]' : 'border-2 border-[var(--accent)] bg-transparent'
              }`}
            />
            {i < nodos.length - 1 && <span className="w-px flex-1 bg-[var(--accent)]" />}
          </div>
          <div className="pb-5">
            <p className="text-base font-semibold text-[var(--text-primary)]">{n.titulo}</p>
            <p className="text-xs text-[var(--text-secondary)]">{n.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Plan Mensual (sin trial): el timeline de 3 días no aplica — se reemplaza
 * por una sola línea honesta de "cobro hoy", nunca fingiendo un trial que
 * ese plan no tiene (transparencia radical, pedido explícito). */
function TimelineSinTrial({ plan }: { plan: PlanId }) {
  const info = PLANES[plan];
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
        <Check size={16} color="var(--bg)" strokeWidth={3} />
      </span>
      <div>
        <p className="text-base font-semibold text-[var(--text-primary)]">
          Hoy — cobro de ${info.precioTotal.toFixed(2)}, acceso completo
        </p>
        <p className="text-xs text-[var(--text-secondary)]">Sin trial en este plan. Cancela cuando quieras, sin costo.</p>
      </div>
    </div>
  );
}

function PlanCard({
  seleccionado,
  onSelect,
  deshabilitado,
  badge,
  ahorro,
  trial,
  nombre,
  precioTachado,
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
  ahorro?: string;
  /** El gancho "7 días gratis" va SOLO en los planes que de verdad lo
   * incluyen (Semestral/Anual) — nunca en Mensual, a pedido explícito. */
  trial: boolean;
  nombre: string;
  /** Precio de referencia tachado (el dispositivo ownable de FICHA-ARTE:
   * el mismo tachado verde que marca un ejercicio completado, aplicado aquí
   * al precio "antes" — reutiliza un rasgo YA probado en vez de inventar
   * uno nuevo, tras 2 rondas fallidas con la espiral decorativa). */
  precioTachado?: string;
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
      className={`relative flex items-center justify-between rounded-[var(--radius-card)] border px-5 py-4 text-left transition-colors disabled:opacity-50 ${
        seleccionado
          ? 'boton-3d-borde border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]'
          : 'superficie-3d border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--accent-2)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--bg)]">
          {badge}
        </span>
      )}
      {seleccionado && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--accent), transparent)' }}
        />
      )}
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[16px] font-semibold text-[var(--text-primary)]">{nombre}</p>
          {ahorro && (
            <span className="whitespace-nowrap rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--accent)]">
              {ahorro}
            </span>
          )}
          {trial && (
            <span className="whitespace-nowrap rounded-full bg-[color-mix(in_oklab,var(--accent-2)_16%,transparent)] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--accent-2)]">
              7 días gratis
            </span>
          )}
        </div>
        <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">{detalle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          {precioTachado && (
            <p className="text-base font-bold tabular-nums text-[var(--text-secondary)] line-through decoration-[var(--accent)] decoration-4">
              {precioTachado}/mes
            </p>
          )}
          <p className="text-2xl font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
            {precioMes}
            <span className="text-xs font-normal text-[var(--text-secondary)]">/mes</span>
          </p>
          {/* Precio en pesos colombianos (TRM oficial del día) — la mayoría
              de la venta es en Colombia; ver solo USD ahuyenta clientes que
              no saben cuánto es en su moneda. Se omite en silencio si la TRM
              no cargó (nunca bloquea ni rompe la tarjeta por esto). */}
          {precioCOP && <p className="mt-0.5 text-xs tabular-nums text-[var(--text-secondary)]">≈ {precioCOP}</p>}
        </div>
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
            seleccionado ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--text-tertiary)]'
          }`}
        >
          {seleccionado && <Check size={13} color="var(--bg)" strokeWidth={3} />}
        </span>
      </div>
    </motion.button>
  );
}
