'use client';

import { useRef, useState, useTransition } from 'react';
import { UserMinus } from 'lucide-react';
import { revocarAccesoManual } from '../actions';

export function FormularioRevocar({ email, id, tienePro }: { email: string | null; id: string; tienePro: boolean }) {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function enviar(formData: FormData) {
    if (!window.confirm(`¿Quitar el acceso Pro de ${email}? Pasa a plan Gratis en su próximo ingreso.`)) return;
    startTransition(async () => {
      const r = await revocarAccesoManual(formData);
      setResultado(r);
      if (r.ok) formRef.current?.reset();
    });
  }

  if (!email) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--status-error)_30%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">Quitar acceso</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        {tienePro ? 'Para reembolsos o cuentas problemáticas — pasa a plan Gratis de inmediato.' : 'Este usuario ya está en plan Gratis.'}
      </p>
      {tienePro && (
        <form ref={formRef} action={enviar} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="id" value={id} />
          <div className="flex flex-col gap-1">
            <label htmlFor="motivo-revocar" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
              Motivo (obligatorio, queda en la auditoría)
            </label>
            <input
              id="motivo-revocar"
              name="motivo"
              type="text"
              required
              placeholder="Ej. reembolso solicitado por el cliente"
              className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--status-error)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--status-error)] text-sm font-semibold text-[var(--status-error)] disabled:opacity-60"
          >
            <UserMinus size={16} /> {pending ? 'Quitando…' : 'Quitar acceso Pro'}
          </button>
        </form>
      )}
      {resultado && <p className={`mt-3 text-sm ${resultado.ok ? 'text-[var(--accent)]' : 'text-[var(--status-error)]'}`}>{resultado.mensaje}</p>}
    </div>
  );
}
