'use client';

// LOGIN — Sesión 4 (50 §E + 26), conectado a Supabase Auth real en Sesión 6.
// Magic link sin contraseña, el ÚLTIMO paso del funnel (después del paywall).
// La sesión se abre desde el enlace del correo (app/auth/callback/route.ts),
// no desde este formulario — este solo pide el email y dispara el envío.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState<Estado>('idle');
  const [countdown, setCountdown] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState(false);
  const [verificando, setVerificando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || !acepto || estado === 'enviando') return;
    setEstado('enviando');

    const supabase = crearClienteSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/app` },
    });

    if (error) {
      setEstado('error');
      return;
    }

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
  }

  async function reenviar() {
    if (countdown > 0) return;
    const supabase = crearClienteSupabase();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/app` },
    });
    setCountdown(60);
  }

  // Respaldo del enlace: algunos correos (Gmail, Outlook) "abren" el enlace
  // solos para escanearlo por seguridad, y como es de un solo uso, lo gastan
  // antes de que la persona lo toque — el código no se puede gastar así
  // (26-AUTH-MODERNO: "el combo" enlace + código, siempre juntos).
  // El largo del código lo decide la config de Supabase del proyecto (probado
  // en vivo: este proyecto manda 8 dígitos, no 6) — nunca asumir un número
  // fijo aquí; que decida el servidor si el código es válido.
  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.length < 6 || verificando) return;
    setVerificando(true);
    setErrorCodigo(false);

    const supabase = crearClienteSupabase();
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });

    if (error) {
      setErrorCodigo(true);
      setVerificando(false);
      return;
    }
    router.push('/app');
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-6 [font-family:var(--font-body)]">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center gap-2 text-base font-semibold text-[var(--text-primary)]">
          <Logo className="size-9 text-[var(--accent)]" />
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
              {/* Autorización previa expresa (Ley 1581 de Colombia): checkbox
                  SIN premarcar, requerido para poder enviar el enlace — no se
                  crea ninguna cuenta sin este consentimiento explícito. */}
              <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={acepto}
                  onChange={(e) => setAcepto(e.target.checked)}
                  required
                  className="mt-0.5 size-4 shrink-0 accent-[var(--accent)]"
                />
                <span>
                  Autorizo el tratamiento de mis datos y acepto los{' '}
                  <Link href="/terminos" className="underline underline-offset-4">
                    Términos
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacidad" className="underline underline-offset-4">
                    Política de Privacidad
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="boton-3d flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-70"
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
              onClick={reenviar}
              className="mt-6 text-sm font-medium text-[var(--accent)] disabled:text-[var(--text-tertiary)]"
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar enlace'}
            </button>

            {/* Respaldo: si el enlace "ya expiró" sin que lo hayas tocado (tu
                correo lo escaneó solo), el mismo correo trae este código. */}
            <div className="mt-8 border-t border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] pt-6">
              <p className="text-xs text-[var(--text-secondary)]">
                ¿El enlace te dice &quot;expirado&quot; sin que lo hayas tocado? Usa el código del mismo correo.
              </p>
              <form onSubmit={confirmarCodigo} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="00000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  className="h-12 w-32 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-3 text-center text-lg tracking-[0.2em] tabular-nums text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  type="submit"
                  disabled={codigo.length < 6 || verificando}
                  className="boton-3d flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)] disabled:opacity-40"
                >
                  {verificando ? 'Confirmando…' : 'Confirmar código'}
                </button>
              </form>
              {errorCodigo && (
                <p className="mt-2 text-xs text-[var(--status-error)]">Ese código no es válido o ya venció. Pide uno nuevo.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
