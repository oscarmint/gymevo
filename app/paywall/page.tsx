'use client';

// PAYWALL — Sesión 4 (02B §C + 50 §C). El precio nunca aparece sin el timeline
// de trial (C4) ni sin el desbloqueo nombrado (el mecanismo: el Botón de Rescate).
// Sesión 7 (auditoría): el CTA ya abre el checkout REAL de Hotmart si las
// variables NEXT_PUBLIC_HOTMART_CHECKOUT_{MENSUAL,ANUAL} están configuradas
// (son públicas, no secretas — son la URL del link de pago). Sin ellas
// todavía (el usuario no las ha puesto en Vercel), cae de vuelta al mock
// anterior (/login) para no romper nada mientras se conectan.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Loader2, Lock, ShieldCheck, X } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';

type PlanId = 'anual' | 'mensual';

export default function PaywallPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [plan, setPlan] = useState<PlanId>('anual');
  const [redirigiendo, setRedirigiendo] = useState(false);

  // sessionStorage no existe en el servidor: leerlo en el initializer de
  // useState causa mismatch de hydration. Este efecto es la forma correcta.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRespuestas(leerRespuestas());
  }, []);

  const meta = respuestas ? META_LABEL[respuestas.meta] : 'ganar músculo';
  const horario = respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde';

  function empezarTrial() {
    const checkoutUrl =
      plan === 'anual'
        ? process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_ANUAL
        : process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_MENSUAL;

    if (checkoutUrl) {
      // Hallazgo revisor-visual: saltar en silencio a un dominio externo en
      // el momento del pago es justo lo que teme el avatar ("¿es otra app
      // con cobros ocultos?"). Un aviso breve antes de salir da confianza
      // sin agregar fricción real (300ms, no un loader eterno).
      setRedirigiendo(true);
      setTimeout(() => {
        // El webhook conecta la compra a la cuenta por CORREO (ver
        // app/api/webhooks/hotmart/route.ts) — no hace falta pasar nada más
        // acá. Después de pagar, Hotmart lleva al comprador a /login.
        window.location.href = checkoutUrl;
      }, 200);
      return;
    }

    // Checkout todavía no configurado (faltan las variables de entorno) —
    // mock: pasa directo al login para no romper nada mientras se conecta.
    router.push('/login?desde=paywall');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] px-5 py-6 [font-family:var(--font-body)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* (1) Cierre — SIEMPRE visible, nunca con delay */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => router.push('/')}
          className="flex size-11 items-center justify-center self-start rounded-full text-[var(--text-secondary)]"
        >
          <X size={22} />
        </button>

        <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Eyebrow que reconoce el dolor real antes del alivio (FICHA-AVATAR:
              terror a lesionarse + vergüenza de no saber qué hacer frente a las
              máquinas) — hallazgo revisor-visual: el headline saltaba directo
              a la solución sin agitar la objeción que trae al avatar hasta acá. */}
          <p className="text-sm font-semibold text-[var(--text-tertiary)]">Se acabó adivinar qué máquina usar</p>
          {/* (2) Headline con la META real del usuario */}
          <h1 className="mt-1 text-balance text-3xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
            Tu plan para <span className="text-[var(--accent)]">{meta}</span> está listo
          </h1>
          <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">
            Hecho con tus respuestas, con el Botón de Rescate incluido para cuando entrenes {horario}
          </p>
        </motion.div>

        {/* (3) Visual del valor: timeline del trial — el default con trial (C4) */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-5"
        >
          <TimelineTrial />
        </motion.div>

        {/* (4)(5) Plan cards — ANUAL primero, pre-seleccionado */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.3 }}
          className="mt-6 flex flex-col gap-3"
        >
          <PlanCard
            id="anual"
            seleccionado={plan === 'anual'}
            onSelect={() => setPlan('anual')}
            badge="MÁS POPULAR"
            nombre="Anual"
            precioMes="$2.50"
            detalle="Se cobra $29.99/año · 6 meses gratis"
          />
          <PlanCard
            id="mensual"
            seleccionado={plan === 'mensual'}
            onSelect={() => setPlan('mensual')}
            nombre="Mensual"
            precioMes="$4.99"
            detalle="Se cobra cada mes"
          />
        </motion.div>

        {/* (6) CTA con beneficio, 1ª persona */}
        <motion.button
          type="button"
          onClick={empezarTrial}
          disabled={redirigiendo}
          whileTap={redirigiendo ? undefined : { scale: 0.97 }}
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.3 }}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-[16.5px] font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_25%,transparent)] disabled:opacity-80"
        >
          {redirigiendo ? (
            <>
              <Loader2 size={18} className="animate-spin motion-reduce:animate-none" /> Te llevamos a Hotmart, pago seguro…
            </>
          ) : (
            'Empezar mis 7 días gratis'
          )}
        </motion.button>

        {/* Garantía nombrada junto al CTA (antes solo vivía en el trust row, lejos) */}
        <motion.p
          initial={reduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-secondary)]"
        >
          <ShieldCheck size={13} /> Garantía Hotmart de 7 días — sin preguntas
        </motion.p>

        {/* (4bis) La verdad del puente del trial — 3 bullets obligatorios, con
            checkmark custom (círculo acento 12%) en vez del "✓" del sistema */}
        <motion.ul
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.3 }}
          className="mt-4 flex flex-col items-center gap-2 text-sm text-[var(--text-secondary)]"
        >
          {['Hoy no pagas nada', 'Te avisamos 1 día antes del cobro', 'Cancela con un toque'].map((texto) => (
            <li key={texto} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
                <Check size={12} color="var(--accent)" strokeWidth={3} />
              </span>
              {texto}
            </li>
          ))}
        </motion.ul>

        {/* Mini-FAQ de transparencia — responde de frente la objeción #1 de Mateo
            (miedo al cobro oculto), en formato pregunta-respuesta explícito. */}
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-6 flex flex-col gap-3 rounded-[var(--radius-card)] bg-[var(--surface-2)] p-4"
        >
          <div>
            <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Me cobrarán hoy?</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              No. Tienes 7 días gratis. Te avisamos por correo antes de que termine tu prueba.
            </p>
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-[var(--text-primary)]">¿Puedo cancelar fácil?</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Sí, cuando quieras, con un toque desde tu perfil — sin llamadas ni trámites.
            </p>
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

function TimelineTrial() {
  const nodos = [
    { estado: 'lleno' as const, titulo: 'Hoy — acceso completo', sub: 'Todo tu plan, sin límites' },
    { estado: 'lleno' as const, titulo: 'Día 6 — te avisamos', sub: 'Correo antes de cualquier cobro' },
    { estado: 'vacio' as const, titulo: 'Día 7 — 1er cobro: $29.99/año', sub: 'Cancela antes sin costo' },
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

function PlanCard({
  seleccionado,
  onSelect,
  badge,
  nombre,
  precioMes,
  detalle,
}: {
  id: PlanId;
  seleccionado: boolean;
  onSelect: () => void;
  badge?: string;
  nombre: string;
  precioMes: string;
  detalle: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`relative flex items-center justify-between rounded-[var(--radius-card)] border px-5 py-4 text-left transition-colors ${
        seleccionado
          ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]'
          : 'border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--bg)]">
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
        <p className="text-[16px] font-semibold text-[var(--text-primary)]">{nombre}</p>
        <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">{detalle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-2xl font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
            {precioMes}
            <span className="text-xs font-normal text-[var(--text-secondary)]">/mes</span>
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
    </motion.button>
  );
}
