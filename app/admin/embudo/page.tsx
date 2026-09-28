// EMBUDO POR ETAPAS — a pedido explícito del dueño (27/09/2026): saber en
// qué paso se quedó cada usuario registrado (no solo un conteo), para poder
// entrar a su ficha y actuar. "Landing" queda aparte y solo como número: las
// visitas anónimas no guardan ningún dato de quién es la persona (decisión
// del dueño 2.A, 28/09/2026 — coherente con la Política de Privacidad, que
// promete "sin cookies de rastreo").

import Link from 'next/link';
import { CreditCard, Eye, RefreshCcw, TrendingDown, UserX } from 'lucide-react';
import { ETAPA_LABEL, obtenerConteoEtapas, obtenerResumenFunnel, obtenerUsuariosPorEtapa, type EtapaUsuario } from '@/lib/admin';

const PLAN_LABEL: Record<string, string> = { pro: 'Pro', free: 'Gratis' };

const ETAPAS: { id: EtapaUsuario; icono: React.ElementType }[] = [
  { id: 'en_prueba', icono: RefreshCcw },
  { id: 'prueba_vencida', icono: UserX },
  { id: 'pagando', icono: CreditCard },
  { id: 'cancelado', icono: TrendingDown },
];

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export default async function EmbudoPage({ searchParams }: { searchParams: Promise<{ etapa?: string }> }) {
  const { etapa: etapaParam } = await searchParams;
  const etapaActiva: EtapaUsuario = (ETAPAS.find((e) => e.id === etapaParam)?.id ?? 'prueba_vencida') as EtapaUsuario;

  const [conteos, funnel, usuarios] = await Promise.all([obtenerConteoEtapas(), obtenerResumenFunnel(), obtenerUsuariosPorEtapa(etapaActiva)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Embudo — dónde está cada quién</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Elige una etapa para ver quiénes están ahí y entrar a su ficha. &ldquo;Landing&rdquo; queda solo como número: una visita sin registrarse no guarda ningún dato de quién es la persona.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-[var(--radius-card)] border border-dashed border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-4 opacity-80">
          <Eye size={15} className="text-[var(--text-tertiary)]" />
          <p className="mt-2 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{funnel.visitasLanding30d}</p>
          <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">Landing (30 días, sin nombres)</p>
        </div>
        {ETAPAS.map((e) => {
          const Icono = e.icono;
          const activa = e.id === etapaActiva;
          return (
            <Link
              key={e.id}
              href={`/admin/embudo?etapa=${e.id}`}
              className={`rounded-[var(--radius-card)] border p-4 transition-colors ${
                activa
                  ? 'border-[var(--accent)] bg-[var(--chip-bg)]'
                  : 'border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)]'
              }`}
            >
              <Icono size={15} className={activa ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'} />
              <p className="mt-2 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">{conteos[e.id]}</p>
              <p className="mt-0.5 text-xs text-[var(--text-tertiary)]">{ETAPA_LABEL[e.id]}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">{ETAPA_LABEL[etapaActiva]}</p>
        {usuarios.length === 0 ? (
          <p className="py-6 text-center text-sm text-[var(--text-tertiary)]">Nadie está en esta etapa todavía.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {usuarios.map((u) => (
              <Link
                key={u.id}
                href={`/admin/usuarios/${u.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{u.nombre || u.email || 'Sin nombre'}</p>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">
                    {u.email} · Se registró {formatearFecha(u.createdAt)}
                    {u.accessUntil ? ` · Vence ${formatearFecha(u.accessUntil)}` : ''}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.plan === 'pro' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] text-[var(--text-tertiary)]'
                  }`}
                >
                  {PLAN_LABEL[u.plan] ?? u.plan}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
