import { Trash2 } from 'lucide-react';
import { obtenerCostosServicios } from '@/lib/admin';
import { FormularioCosto } from './FormularioCosto';
import { eliminarCostoServicio } from './actions';

const FORMATO_USD = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD' });
const FORMATO_COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

function formatearMonto(monto: number, moneda: string): string {
  return moneda === 'COP' ? FORMATO_COP.format(monto) : FORMATO_USD.format(monto);
}

export default async function AdminCostosPage() {
  const { servicios, totalMensualUSD } = await obtenerCostosServicios();
  const hayOtraMoneda = servicios.some((s) => s.moneda !== 'USD');

  return (
    <div className="flex flex-col gap-6">
      <FormularioCosto />

      <div className="superficie-3d rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Costo total mensual</p>
        <p className="mt-2 text-3xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{FORMATO_USD.format(totalMensualUSD)}</p>
        {hayOtraMoneda && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            No incluye los servicios en otra moneda de la lista de abajo (mezclar monedas sin una TRM fija daría un total falso).
          </p>
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Servicios</p>
        {servicios.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">
            Todavía no agregaste ningún servicio — empieza con Supabase, Vercel, Resend o tu dominio.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{s.servicio}</p>
                  {s.notas && <p className="truncate text-xs text-[var(--text-tertiary)]">{s.notas}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{formatearMonto(s.montoMensual, s.moneda)}/mes</p>
                  <form
                    action={async () => {
                      'use server';
                      await eliminarCostoServicio(s.id);
                    }}
                  >
                    <button
                      type="submit"
                      aria-label={`Quitar ${s.servicio}`}
                      className="flex size-8 items-center justify-center rounded-full text-[var(--text-tertiary)] hover:text-[var(--status-error)]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
