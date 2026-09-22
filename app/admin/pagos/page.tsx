import { obtenerPagos } from '@/lib/admin';

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

const ESTADO_LABEL: Record<string, string> = {
  active: 'Activo',
  trialing: 'En prueba',
  past_due: 'Pago atrasado',
  cancelled: 'Cancelado',
  expired: 'Vencido',
  refunded: 'Reembolsado',
  chargeback: 'Contracargo',
};

const FILTROS = ['', 'active', 'trialing', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback'];

export default async function AdminPagosPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const { estado, q } = await searchParams;
  const pagos = await obtenerPagos(estado ?? '', q ?? '');

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <form className="flex flex-col gap-3 sm:flex-row" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar por correo…"
            className="h-11 flex-1 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
          <select
            name="estado"
            defaultValue={estado ?? ''}
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            {FILTROS.map((f) => (
              <option key={f} value={f}>
                {f ? (ESTADO_LABEL[f] ?? f) : 'Todos los estados'}
              </option>
            ))}
          </select>
          <button type="submit" className="boton-3d h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--bg)]">
            Filtrar
          </button>
        </form>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        {pagos.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">No hay compras con ese filtro.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pagos.map((p, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {p.email} {p.agregadoManualmente && <span className="font-normal text-[var(--text-tertiary)]">· a mano</span>}
                  </p>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    Primer pago {formatearFecha(p.firstPaidAt)} · Actualizado {formatearFecha(p.updatedAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{ESTADO_LABEL[p.status] ?? p.status}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Vence {formatearFecha(p.accessUntil)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
