'use client';

import { useRef, useState, useTransition } from 'react';
import { UserPlus } from 'lucide-react';
import { agregarAccesoManual } from './actions';

export function FormularioAcceso() {
  const [pending, startTransition] = useTransition();
  const [resultado, setResultado] = useState<{ ok: boolean; mensaje: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function enviar(formData: FormData) {
    startTransition(async () => {
      const r = await agregarAccesoManual(formData);
      setResultado(r);
      if (r.ok) formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
      <p className="text-sm font-semibold text-[var(--text-primary)]">Agregar acceso a mano</p>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Para cuando alguien pagó pero el aviso automático de Hotmart no le dio acceso. En cuanto entre con este correo, va a tener el plan completo.
      </p>
      <form ref={formRef} action={enviar} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="email-acceso" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
            Correo
          </label>
          <input
            id="email-acceso"
            name="email"
            type="email"
            required
            placeholder="persona@correo.com"
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="nombre-acceso" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
            Nombre (opcional)
          </label>
          <input
            id="nombre-acceso"
            name="nombre"
            type="text"
            placeholder="Para tu propia referencia"
            className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="boton-3d flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--bg)] disabled:opacity-60"
        >
          <UserPlus size={16} /> {pending ? 'Guardando…' : 'Dar acceso'}
        </button>
      </form>
      {resultado && (
        <p className={`mt-3 text-sm ${resultado.ok ? 'text-[var(--accent)]' : 'text-[var(--status-error)]'}`}>{resultado.mensaje}</p>
      )}
    </div>
  );
}
