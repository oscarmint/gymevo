'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock, Gift } from 'lucide-react';
import { DIAS_DE_GRACIA } from '@/lib/planes';
import { leerEstadoAccesoRemoto } from '@/lib/supabase/sync';

const DIA_MS = 86_400_000;
const AVISAR_DESDE_DIAS = 7;

type Aviso = { tipo: 'prueba' | 'pago'; dias: number };

/** Aviso de acceso dentro de la app, con dos casos:
 *  - prueba gratis: siempre visible mientras dure, con los días
 *    que quedan y la invitación a elegir plan antes de que termine;
 *  - plan pago: aparece cuando faltan 7 días o menos para que
 *    venza, y durante los días de gracia después de vencer. */
export function BannerRenovacion() {
  const [aviso, setAviso] = useState<Aviso | null>(null);

  useEffect(() => {
    leerEstadoAccesoRemoto().then((e) => {
      if (!e) return;
      if (e.plan === 'pro') {
        if (e.accessUntil) setAviso({ tipo: 'pago', dias: Math.ceil((e.accessUntil.getTime() - Date.now()) / DIA_MS) });
      } else if (e.trialEndsAt) {
        setAviso({ tipo: 'prueba', dias: Math.ceil((e.trialEndsAt.getTime() - Date.now()) / DIA_MS) });
      }
    });
  }, []);

  if (!aviso) return null;

  if (aviso.tipo === 'prueba') {
    if (aviso.dias <= 0) return null;
    const titulo = aviso.dias === 1 ? 'Último día de tu prueba gratis' : `Te quedan ${aviso.dias} días de prueba gratis`;
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--surface)] p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chip-bg)]">
          <Gift size={17} color="var(--accent)" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{titulo}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            Cuando termine, elige un plan y realiza el pago para seguir con tu racha y tu progreso.
          </p>
          <Link href="/paywall" className="mt-1.5 inline-block text-xs font-semibold text-[var(--accent)]">
            Ver planes
          </Link>
        </div>
      </div>
    );
  }

  if (aviso.dias > AVISAR_DESDE_DIAS) return null;
  const vencido = aviso.dias <= 0;
  const titulo = vencido ? 'Tu acceso venció' : aviso.dias === 1 ? 'Tu acceso vence mañana' : `Tu acceso vence en ${aviso.dias} días`;
  const detalle = vencido
    ? `Renueva ahora: tienes hasta ${DIAS_DE_GRACIA} días de gracia antes de perder el acceso.`
    : 'Renueva y sigue sin perder tu racha ni tu progreso. Los meses se suman a los que te quedan.';

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--status-warning)_35%,transparent)] bg-[var(--surface)] p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--status-warning)_14%,transparent)]">
        <CalendarClock size={17} color="var(--status-warning)" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{detalle}</p>
        <Link href="/paywall?renovar=1" className="mt-1.5 inline-block text-xs font-semibold text-[var(--accent)]">
          Renovar mi acceso
        </Link>
      </div>
    </div>
  );
}
