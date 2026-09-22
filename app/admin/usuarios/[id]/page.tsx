import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { obtenerFichaUsuario } from '@/lib/admin';
import { FormularioAcceso } from '../FormularioAcceso';
import { FormularioRevocar } from './FormularioRevocar';

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

const PLAN_LABEL: Record<string, string> = { pro: 'Pro', free: 'Gratis' };
const NIVEL_LABEL: Record<string, string> = { principiante: 'Principiante', intermedio: 'Intermedio' };
const META_LABEL: Record<string, string> = { musculo: 'Ganar músculo', grasa: 'Perder grasa' };

export default async function FichaUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await obtenerFichaUsuario(id);

  if (!usuario) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/usuarios" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <ArrowLeft size={15} /> Volver a usuarios
        </Link>
        <p className="text-sm text-[var(--text-tertiary)]">No se encontró ese usuario.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/usuarios" className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
        <ArrowLeft size={15} /> Volver a usuarios
      </Link>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-[var(--text-primary)]">{usuario.nombre || usuario.email || 'Sin nombre'}</p>
            <p className="truncate text-sm text-[var(--text-tertiary)]">{usuario.email}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              usuario.plan === 'pro' ? 'bg-[var(--chip-bg)] text-[var(--accent)]' : 'bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] text-[var(--text-tertiary)]'
            }`}
          >
            {PLAN_LABEL[usuario.plan] ?? usuario.plan}
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-[var(--text-tertiary)]">Se registró</dt>
          <dd className="text-[var(--text-primary)]">{formatearFecha(usuario.createdAt)}</dd>
          <dt className="text-[var(--text-tertiary)]">Estado de membresía</dt>
          <dd className="text-[var(--text-primary)]">{usuario.membershipStatus ?? '—'}</dd>
          <dt className="text-[var(--text-tertiary)]">Acceso vence</dt>
          <dd className="text-[var(--text-primary)]">{formatearFecha(usuario.accessUntil)}</dd>
          <dt className="text-[var(--text-tertiary)]">Prueba gratis vence</dt>
          <dd className="text-[var(--text-primary)]">{formatearFecha(usuario.trialEndsAt)}</dd>
          <dt className="text-[var(--text-tertiary)]">Rutina</dt>
          <dd className="text-[var(--text-primary)]">
            {usuario.nivel ? (NIVEL_LABEL[usuario.nivel] ?? usuario.nivel) : '—'} · {usuario.meta ? (META_LABEL[usuario.meta] ?? usuario.meta) : '—'}
          </dd>
          <dt className="text-[var(--text-tertiary)]">Racha actual</dt>
          <dd className="text-[var(--text-primary)]">{usuario.racha ?? 0} día(s)</dd>
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormularioAcceso emailFijo={usuario.email} id={usuario.id} />
        <FormularioRevocar email={usuario.email} id={usuario.id} tienePro={usuario.plan === 'pro'} />
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Historial de compras</p>
        {usuario.compras.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-tertiary)]">Nunca ha comprado (o el correo del perfil no coincide con ninguna compra).</p>
        ) : (
          <div className="flex flex-col gap-2">
            {usuario.compras.map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--bg)] px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {c.status} {c.agregadoManualmente && <span className="font-normal text-[var(--text-tertiary)]">(agregado a mano)</span>}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">Actualizado {formatearFecha(c.updatedAt)}</p>
                </div>
                <p className="shrink-0 text-xs text-[var(--text-secondary)]">Vence {formatearFecha(c.accessUntil)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Últimos entrenamientos registrados</p>
        {usuario.ultimosRegistros.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--text-tertiary)]">Todavía no registra ninguna serie.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {usuario.ultimosRegistros.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-sm">
                <p className="text-[var(--text-primary)]">{l.ejercicioId}</p>
                <p className="shrink-0 text-[var(--text-secondary)]">
                  {formatearFecha(l.fecha)} · {l.peso}kg × {l.reps} (serie {l.series})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
