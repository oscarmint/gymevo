'use client';

// PAYWALL — Sesión 4 (02B §C + 50 §C). El precio nunca aparece sin el timeline
// de trial (C4) ni sin el desbloqueo nombrado (el mecanismo: el Botón de Rescate).
// C3ter: sin Hotmart conectado todavía (Sesión 6), el CTA navega a /login —
// simula el flujo con estado local, nunca un checkout falso.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Lock, ShieldCheck, X } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';

type PlanId = 'anual' | 'mensual';

export default function PaywallPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [plan, setPlan] = useState<PlanId>('anual');

  useEffect(() => {
    setRespuestas(leerRespuestas());
  }, []);

  const meta = respuestas ? META_LABEL[respuestas.meta] : 'ganar músculo';
  const horario = respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde';

  function empezarTrial() {
    // Sesión 6: aquí se abre el checkout real de Hotmart (off/showOnlyTrial=1/sck).
    // Por ahora, mock: pasa directo al login (magic link) para "guardar" el plan.
    router.push('/login?desde=paywall');
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)] px-5 py-6 [font-family:var(--font-body)]">
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        {/* (1) Cierre — SIEMPRE visible, nunca con delay */}
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => router.push('/')}
          className="flex size-11 items-center justify-center self-start rounded-full text-[var(--text-secondary)]"
        >
          <X size={22} />
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* (2) Headline con la META real del usuario */}
          <h1 className="mt-2 text-balance text-[28px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
            Tu plan para <span className="text-[var(--accent)]">{meta}</span> está listo
          </h1>
          <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">
            Hecho con tus respuestas, con el Botón de Rescate incluido para cuando entrenes {horario}
          </p>
        </motion.div>

        {/* (3) Visual del valor: timeline del trial — el default con trial (C4) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-5"
        >
          <TimelineTrial />
        </motion.div>

        {/* (4)(5) Plan cards — ANUAL primero, pre-seleccionado */}
        <div className="mt-6 flex flex-col gap-3">
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
        </div>

        {/* (6) CTA con beneficio, 1ª persona */}
        <motion.button
          type="button"
          onClick={empezarTrial}
          whileTap={{ scale: 0.97 }}
          className="mt-6 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-[16.5px] font-semibold text-[var(--bg)] shadow-[0_8px_30px_color-mix(in_oklab,var(--accent)_25%,transparent)]"
        >
          Empezar mis 7 días gratis
        </motion.button>

        {/* (4bis) La verdad del puente del trial — 3 bullets obligatorios */}
        <ul className="mt-4 flex flex-col gap-1.5 text-center text-[13px] text-[var(--text-secondary)]">
          <li>✓ Hoy no pagas nada</li>
          <li>✓ Te avisamos 1 día antes del cobro</li>
          <li>✓ Cancela en 1 tap</li>
        </ul>

        {/* (8) Salida limpia */}
        <div className="mt-5 flex items-center justify-center gap-1 text-[14px] text-[var(--text-tertiary)]">
          <button type="button" onClick={() => router.push('/')} className="px-2 py-3">
            Ahora no
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className="px-2 py-3">
            Restaurar compra
          </button>
        </div>

        {/* (9) Trust row */}
        <div className="mt-2 flex items-center justify-center gap-4 text-[12px] text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1.5">
            <Lock size={14} /> Pago seguro
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} /> Garantía Hotmart 7 días
          </span>
        </div>
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
            {i < nodos.length - 1 && <span className="w-[2px] flex-1 bg-[var(--accent)]" />}
          </div>
          <div className="pb-5">
            <p className="text-[15px] font-semibold text-[var(--text-primary)]">{n.titulo}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">{n.sub}</p>
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
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-center justify-between rounded-[var(--radius-card)] border px-5 py-4 text-left transition-colors ${
        seleccionado
          ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_6%,transparent)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)]'
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 left-4 rounded-full bg-[var(--accent)] px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.05em] text-[var(--bg)]">
          {badge}
        </span>
      )}
      <div>
        <p className="text-[16px] font-semibold text-[var(--text-primary)]">{nombre}</p>
        <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">{detalle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[22px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
            {precioMes}
            <span className="text-[13px] font-normal text-[var(--text-secondary)]">/mes</span>
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
    </button>
  );
}
