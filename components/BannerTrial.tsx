'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gift } from 'lucide-react';
import { leerFinDePruebaRemoto } from '@/lib/supabase/sync';

const DIA_MS = 86_400_000;

/** Recordatorio de la prueba gratis dentro de la app (hallazgo 21/09/2026: el
 * trial no existía dentro del producto). Solo aparece si la membresía está en
 * prueba: cuántos días quedan, qué llevas logrado y cuándo se avisa el cobro. */
export function BannerTrial({ sesionesCompletadas }: { sesionesCompletadas: number }) {
  const [dias, setDias] = useState(0);

  useEffect(() => {
    leerFinDePruebaRemoto().then((fin) => {
      if (fin) setDias(Math.ceil((fin.getTime() - Date.now()) / DIA_MS));
    });
  }, []);

  if (dias <= 0) return null;

  const titulo = dias === 1 ? 'Último día de tu prueba gratis' : `Te quedan ${dias} días de prueba gratis`;
  const logro =
    sesionesCompletadas === 0
      ? 'Completa tu primer entrenamiento hoy y ve tu plan funcionando.'
      : `Llevas ${sesionesCompletadas} ${sesionesCompletadas === 1 ? 'día entrenado' : 'días entrenados'} en tu prueba.`;
  const aviso = dias === 1 ? 'Te avisamos por correo antes de cobrar; cancelas desde Perfil.' : 'Te avisamos por correo antes de cualquier cobro.';

  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--surface)] p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--chip-bg)]">
        <Gift size={17} color="var(--accent)" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{titulo}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
          {logro} {aviso}
        </p>
        {sesionesCompletadas > 0 && (
          <Link href="/app/historial" className="mt-1.5 inline-block text-xs font-semibold text-[var(--accent)]">
            Ver mi progreso
          </Link>
        )}
      </div>
    </div>
  );
}
