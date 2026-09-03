import { buscarUsuarios } from '@/lib/admin';
import { FormularioAcceso } from './FormularioAcceso';

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

const PLAN_LABEL: Record<string, string> = { pro: 'Pro', free: 'Gratis' };

export default async function AdminUsuariosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const usuarios = await buscarUsuarios(q ?? '');

  return (
    <div className="flex flex-col gap-6">
      <FormularioAcceso />

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <form className="mb-4" method="get">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Buscar por correo…"
            className="h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </form>

        {usuarios.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">
            {q ? `No hay ningún usuario con "${q}" en su correo.` : 'Todavía no hay usuarios.'}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{u.nombre || u.email || 'Sin nombre'}</p>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    {u.email} · Alta {formatearFecha(u.createdAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.plan === 'pro' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {PLAN_LABEL[u.plan] ?? u.plan}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
