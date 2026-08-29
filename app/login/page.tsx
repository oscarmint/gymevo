'use client';

// LOGIN — Sesión 4 (50 §E + 26). Magic link sin contraseña, el ÚLTIMO paso del
// funnel (después del paywall). Sesión 6 conecta esto a Supabase Auth real —
// por ahora los tres estados (enviando/enviado/error) son UI honesta sin backend.

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [countdown, setCountdown] = useState(0);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || estado === 'enviando') return;
    setEstado('enviando');
    // Mock: Sesión 6 llama a supabase.auth.signInWithOtp({ email }) aquí.
    setTimeout(() => {
      setEstado('enviado');
      setCountdown(60);
      const tick = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(tick);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, 900);
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-6 [font-family:var(--font-body)]">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <span aria-hidden="true" className="size-6 rounded-lg bg-[var(--accent)]" />
          GymEvo
        </Link>

        {estado !== 'enviado' ? (
          <>
            <h1 className="text-2xl font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)]">
              Entra a tu plan
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Para guardarlo y verlo en cualquier dispositivo</p>

            <form onSubmit={enviar} className="mt-6 flex flex-col gap-3">
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-tertiary)]"
                />
                <input
                  type="email"
                  required
                  autoFocus
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] pl-11 pr-4 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-70"
              >
                {estado === 'enviando' ? 'Enviando…' : 'Enviarme mi enlace de acceso'}
              </button>
            </form>

            {estado === 'error' && (
              <p className="mt-3 text-sm text-[var(--status-error)]">
                No pudimos enviar el enlace. Revisa el correo e intenta de nuevo.
              </p>
            )}

            <p className="mt-4 text-center text-xs text-[var(--text-tertiary)]">
              <Lock size={12} className="mr-1 inline-block" />
              Sin contraseñas: te llegará un enlace de un solo uso
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold leading-[1.2] text-[var(--text-primary)] [font-family:var(--font-display)]">
              Revisa tu correo
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Te enviamos el enlace de acceso a <span className="font-semibold text-[var(--text-primary)]">{email}</span>
            </p>
            <button
              type="button"
              disabled={countdown > 0}
              onClick={() => setCountdown(60)}
              className="mt-6 text-sm font-medium text-[var(--accent)] disabled:text-[var(--text-tertiary)]"
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar enlace'}
            </button>

            {/* Mock de Sesión 4: sin backend todavía, este botón simula el tap en
                el enlace del correo. Sesión 6 lo reemplaza por la verificación real
                del magic link de Supabase (la sesión se abre desde ese enlace, no
                desde un botón aquí). */}
            <a
              href="/app"
              className="mt-8 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
            >
              (Demo) Abrir como si hubiera tocado el enlace
            </a>
          </>
        )}
      </div>
    </div>
  );
}
