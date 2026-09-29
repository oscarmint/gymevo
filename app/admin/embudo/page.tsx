// EMBUDO POR ETAPAS — a pedido explícito del dueño (27/09/2026): saber en
// qué paso se quedó cada usuario registrado (no solo un conteo), para poder
// entrar a su ficha y actuar. "Landing" queda aparte y solo como número: las
// visitas anónimas no guardan ningún dato de quién es la persona (decisión
// del dueño 2.A, 28/09/2026 — coherente con la Política de Privacidad, que
// promete "sin cookies de rastreo").

import Link from 'next/link';
import { CreditCard, Eye, RefreshCcw, TrendingDown, UserX } from 'lucide-react';
import { ETAPA_LABEL, obtenerConteoEtapas, obtenerEmbudoPorPasos, obtenerResumenFunnel, obtenerUsuariosPorEtapa, type EtapaUsuario } from '@/lib/admin';

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

  const [conteos, funnel, usuarios, pasos] = await Promise.all([
    obtenerConteoEtapas(),
    obtenerResumenFunnel(),
    obtenerUsuariosPorEtapa(etapaActiva),
    obtenerEmbudoPorPasos(),
  ]);
  const maximoPasos = Math.max(1, ...pasos.map((p) => p.conteo));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Embudo — dónde está cada quién</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Elige una etapa para ver quiénes están ahí y entrar a su ficha. &ldquo;Landing&rdquo; queda solo como número: una visita sin registrarse no guarda ningún dato de quién es la persona.
        </p>
      </div>

      {/* GENERAL — el resumen de un vistazo: de todo el que llega a la
          landing, cuántos terminan pagando (pedido del dueño, 29/09/2026).
          Últimos 30 días, mismo criterio anónimo que el resto del embudo. */}
      {pasos.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_25%,transparent)] bg-[var(--chip-bg)] p-5">
          <p className="text-sm text-[var(--text-secondary)]">
            De <span className="font-semibold text-[var(--text-primary)]">{pasos[0].conteo}</span> visitas a la landing en los últimos 30 días,{' '}
            <span className="font-semibold text-[var(--text-primary)]">{pasos[pasos.length - 1].conteo}</span> terminaron pagando —{' '}
            <span className="font-bold text-[var(--accent)]">
              {pasos[0].conteo > 0 ? Math.round((pasos[pasos.length - 1].conteo / pasos[0].conteo) * 100 * 10) / 10 : 0}%
            </span>{' '}
            de conversión de punta a punta.
          </p>
        </div>
      )}

      {/* DESGLOSADO — el camino completo paso a paso, para ver EXACTAMENTE
          dónde se cae la gente (landing, onboarding, plan, paywall, registro,
          prueba, primer entrenamiento, pago) — no solo cuántos ya se
          registraron, que es lo que cubren las 4 etapas de abajo. */}
      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Por pasos (últimos 30 días)</p>
        <p className="mb-4 text-xs text-[var(--text-tertiary)]">Cuántas veces pasó cada cosa — no personas únicas, ni guarda quién es cada una.</p>
        <div className="flex flex-col gap-3">
          {pasos.map((p) => (
            <div key={p.id} className="flex items-center gap-3">
              <p className="w-40 shrink-0 truncate text-xs text-[var(--text-secondary)]">{p.etiqueta}</p>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
                <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${Math.max(2, (p.conteo / maximoPasos) * 100)}%` }} />
              </div>
              <p className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums text-[var(--text-primary)]">{p.conteo}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-[var(--text-primary)]">Ya registrados, por etapa</p>
        <p className="mb-3 text-xs text-[var(--text-tertiary)]">De aquí para abajo, solo quienes ya crearon una cuenta — toca una etapa para ver quiénes son.</p>
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
