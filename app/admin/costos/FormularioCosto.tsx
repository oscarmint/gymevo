'use client';

import { useRef, useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { agregarCostoServicio } from './actions';

export function FormularioCosto() {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function enviar(formData: FormData) {
    startTransition(async () => {
      const r = await agregarCostoServicio(formData);
      setResultado(r);
      if (r.ok) formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">Agregar un servicio</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Todo lo que le cuesta mantener GymEvo funcionando cada mes: hosting, base de datos, correo, dominio, etc.
      </p>
      <form ref={formRef} action={enviar} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <div className="flex flex-1 min-w-40 flex-col gap-1">
          <label htmlFor="servicio" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
            Servicio
          </label>
          <input
            id="servicio"
            name="servicio"
            type="text"
            required
            placeholder="Ej. Supabase, Vercel, Resend…"
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex w-28 flex-col gap-1">
          <label htmlFor="monto" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
            Monto/mes
          </label>
          <input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex w-24 flex-col gap-1">
          <label htmlFor="moneda" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
            Moneda
          </label>
          <select
            id="moneda"
            name="moneda"
            defaultValue="USD"
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          >
            <option value="USD">USD</option>
            <option value="COP">COP</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="boton-3d flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--bg)] disabled:opacity-60"
        >
          <Plus size={16} /> {pending ? 'Guardando…' : 'Agregar'}
        </button>
      </form>
      {resultado && (
        <p className={`mt-3 text-sm ${resultado.ok ? 'text-[var(--accent)]' : 'text-[var(--status-error)]'}`}>{resultado.mensaje}</p>
      )}
    </div>
  );
}
