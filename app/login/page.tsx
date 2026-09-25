'use client';

// LOGIN — Sesión 4 (50 §E + 26), conectado a Supabase Auth real en Sesión 6.
// Magic link sin contraseña, el ÚLTIMO paso del funnel (después del paywall).
// La sesión se abre desde el enlace del correo (app/auth/callback/route.ts),
// no desde este formulario — este solo pide el email y dispara el envío.

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Info, Lock, Mail } from 'lucide-react';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';

function LoginContenido() {
  const router = useRouter();
  const desdePlan = useSearchParams().get('desde') === 'plan';
  // Tras el onboarding la persona vuelve a ver su Día 1; en cualquier otro caso entra a la app.
  const destino = desdePlan ? '/onboarding/plan' : '/app';
  const [email, setEmail] = useState('');
  const [acepto, setAcepto] = useState(false);
  const [estado, setEstado] = useState<Estado>('idle');
  const [countdown, setCountdown] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [errorGoogle, setErrorGoogle] = useState(false);
  const [errorAcepto, setErrorAcepto] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@') || estado === 'enviando') return;
    if (!acepto) {
      setErrorAcepto(true);
      return;
    }
    setEstado('enviando');

    const supabase = crearClienteSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${destino}` },
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

  // Google (Bloque 2): el método principal — un toque, sin escribir correo ni
  // esperar un código. Requiere activar el proveedor Google en Supabase
  // (Authentication → Providers). Al volver, /auth/callback abre la sesión.
  async function continuarConGoogle() {
    if (cargandoGoogle) return;
    if (!acepto) {
      setErrorAcepto(true);
      return;
    }
    setCargandoGoogle(true);
    setErrorGoogle(false);
    const { error } = await crearClienteSupabase().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${destino}` },
    });
    if (error) {
      setErrorGoogle(true);
      setCargandoGoogle(false);
    }
  }

  async function reenviar() {
    if (countdown > 0) return;
    const supabase = crearClienteSupabase();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${destino}` },
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
    router.push(destino);
  }

  // Si ya tiene sesión, no se le vuelve a pedir el correo.
  useEffect(() => {
    if (!desdePlan) return;
    crearClienteSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace(destino);
      });
  }, [desdePlan, destino, router]);

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
              {desdePlan ? 'Tu plan está listo' : 'Entra a tu plan'}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {desdePlan
                ? 'Escribe tu correo para guardarlo y ver tu Día 1. Tus 7 días gratis empiezan aquí, sin tarjeta.'
                : 'Para guardarlo y verlo en cualquier dispositivo'}
            </p>

            <div className="mt-6">
            {/* Autorización previa expresa (Ley 1581 de Colombia): checkbox
                SIN premarcar, requerido para poder enviar el enlace — no se
                crea ninguna cuenta sin este consentimiento explícito. */}
            <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={acepto}
                onChange={(e) => {
                  setAcepto(e.target.checked);
                  if (e.target.checked) setErrorAcepto(false);
                }}
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
            {errorAcepto && (
              <p className="mt-2 text-sm text-[var(--status-error)]">Marca la casilla para continuar.</p>
            )}
            </div>

            {/* Método principal: Google. Debajo, el correo con código como alternativa. */}
            <button
              type="button"
              onClick={continuarConGoogle}
              disabled={cargandoGoogle}
              className="boton-3d mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-70"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.09A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l4-3.09z" />
                <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l4 3.09C6.23 6.86 8.88 4.75 12 4.75z" />
              </svg>
              {cargandoGoogle ? 'Abriendo Google…' : 'Continuar con Google'}
            </button>
            {errorGoogle && (
              <p className="mt-2 text-sm text-[var(--status-error)]">
                No pudimos abrir Google. Usa tu correo aquí abajo o intenta de nuevo.
              </p>
            )}

            <div className="mt-5 flex items-center gap-3 text-xs text-[var(--text-tertiary)]" aria-hidden="true">
              <span className="h-px flex-1 bg-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]" />
              o con tu correo
              <span className="h-px flex-1 bg-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]" />
            </div>

            <form onSubmit={enviar} className="mt-5 flex flex-col gap-3">
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
                className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_38%,transparent)] text-base font-semibold text-[var(--text-primary)] disabled:opacity-70"
              >
                {estado === 'enviando' ? 'Enviando…' : desdePlan ? 'Guardar mi plan y ver mi Día 1' : 'Enviarme mi enlace de acceso'}
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
            {/* Aviso honesto: un dominio de correo nuevo puede caer en spam las
                primeras veces mientras gana reputación (ver ESTADO.md) — mejor
                avisarlo aquí que dejar a la persona pensando que la app falló. */}
            <p className="mt-3 flex items-start gap-1.5 text-xs text-[var(--text-tertiary)]">
              <Info size={13} className="mt-0.5 shrink-0" />
              ¿No lo ves en unos minutos? Revisa tu carpeta de Spam o Correo no deseado.
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
                  autoComplete="one-time-code"
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

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContenido />
    </Suspense>
  );
}
