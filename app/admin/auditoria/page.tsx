import { obtenerAuditoria } from '@/lib/admin';

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default async function AdminAuditoriaPage() {
  const registros = await obtenerAuditoria();

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[var(--text-secondary)]">
        Quién hizo qué y cuándo, para las acciones sensibles del panel (dar/quitar acceso, borrar un costo). Es de solo lectura — nada de esto se edita ni se borra.
      </p>
      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        {registros.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">Todavía no hay ninguna acción registrada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {registros.map((r) => (
              <div key={r.id} className="rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[var(--text-primary)]">{r.accion}</p>
                  <p className="shrink-0 text-xs text-[var(--text-tertiary)]">{formatearFecha(r.createdAt)}</p>
                </div>
                {r.detalle && <p className="mt-1 text-[var(--text-secondary)]">{r.detalle}</p>}
                {r.motivo && <p className="mt-1 text-xs text-[var(--text-tertiary)]">Motivo: {r.motivo}</p>}
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{r.adminEmail}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
