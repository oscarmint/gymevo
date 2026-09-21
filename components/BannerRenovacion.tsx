'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { DIAS_DE_GRACIA } from '@/lib/planes';
import { leerVencimientoRemoto } from '@/lib/supabase/sync';

const DIA_MS = 86_400_000;
const AVISAR_DESDE_DIAS = 7;

/** Aviso de renovación dentro de la app (pago único, sin cobro automático):
 * aparece cuando faltan 7 días o menos para que venza el acceso, y durante
 * los días de gracia después de vencer. Con más tiempo de sobra no molesta. */
export function BannerRenovacion() {
  const [dias, setDias] = useState<number | null>(null);

  useEffect(() => {
    leerVencimientoRemoto().then((fin) => {
      if (fin) setDias(Math.ceil((fin.getTime() - Date.now()) / DIA_MS));
    });
  }, []);

  if (dias === null || dias > AVISAR_DESDE_DIAS) return null;

  const vencido = dias <= 0;
  const titulo = vencido
    ? 'Tu acceso venció'
    : dias === 1
      ? 'Tu acceso vence mañana'
      : `Tu acceso vence en ${dias} días`;
  const detalle = vencido
    ? `Renueva ahora: tienes unos días de gracia (hasta ${DIAS_DE_GRACIA} después de vencer) antes de perder el acceso.`
    : 'Renueva con PSE, Nequi, tarjeta o Efecty y sigue sin perder tu racha ni tu progreso. Los meses se suman a los que te quedan.';

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
