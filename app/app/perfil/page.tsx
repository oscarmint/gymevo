'use client';

// PERFIL — nivel, meta, plan y salida. Sesión 6 conecta "Cerrar sesión" a
// Supabase Auth real; por ahora limpia el estado local y vuelve a la landing.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Flame, LogOut, Pencil } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, NIVEL_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { leerProgreso, tituloRuta, type Progreso } from '@/lib/routine';
import { leerNombreLocal, guardarNombreLocal } from '@/lib/perfil';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { guardarNombreRemoto, leerNombreRemoto } from '@/lib/supabase/sync';

export default function PerfilPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState('');

  // localStorage/sessionStorage no existen en el servidor: leerlos en el
  // initializer de useState causa mismatch de hydration. Este efecto es la
  // forma correcta (solo corre en el cliente, tras la hydration).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRespuestas(leerRespuestas());
    setProgreso(leerProgreso());
    setNombre(leerNombreLocal());
    leerNombreRemoto().then((remoto) => {
      if (remoto) {
        setNombre(remoto);
        guardarNombreLocal(remoto);
      }
    });
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!progreso) return null;

  const nivel = respuestas?.nivel ?? 'principiante';
  const meta = respuestas?.meta ?? 'musculo';

  function empezarEdicion() {
    setBorrador(nombre ?? '');
    setEditando(true);
  }

  function guardarNombre() {
    const limpio = borrador.trim();
    if (!limpio) return;
    setNombre(limpio);
    guardarNombreLocal(limpio);
    guardarNombreRemoto(limpio);
    setEditando(false);
  }

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    sessionStorage.clear();
    localStorage.removeItem('gymevo_progreso');
    router.push('/');
  }

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] overflow-hidden px-5 pt-6">
      {/* Video de fondo, sin capa de color encima — a pedido explícito del
          usuario: se ve moviéndose de verdad, sin nada que lo tape.
          z-index NO negativo + el contenido real en su propio z-10: un
          ancestro con fondo opaco (el shell de /app) puede pintar ENCIMA
          de un hijo `fixed`/`absolute` con z-index negativo (así se
          descubrió que no se veía en un iPhone real). */}
      <video
        aria-hidden="true"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 z-0 size-full object-cover motion-reduce:hidden"
      >
        <source src="/videos/hero-gimnasio.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10">
      {/* Chip propio opaco (no un scrim de toda la pantalla, a pedido del
          usuario: el video se ve completo) para que el saludo se lea sobre
          cualquier fotograma del video, sin depender de qué tan claro/oscuro
          salga. Sin glass/blur (regla anti-IA de FICHA-ARTE): superficie
          sólida, igual que el resto de las cards de esta misma pantalla. */}
      <div className="inline-block rounded-2xl bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-1)]">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu cuenta</p>
      {editando ? (
        <div className="mt-1 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={borrador}
            onChange={(e) => setBorrador(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
            placeholder="¿Cómo quieres que te llamemos?"
            maxLength={30}
            className="h-11 flex-1 rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-3 text-2xl font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent)] [font-family:var(--font-display)]"
          />
          <button
            type="button"
            aria-label="Guardar nombre"
            onClick={guardarNombre}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--bg)]"
          >
            <Check size={18} />
          </button>
        </div>
      ) : (
        <button type="button" onClick={empezarEdicion} className="mt-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">
            Hola, {nombre ?? 'ponte un nombre'}
          </h1>
          <Pencil size={15} color="var(--text-tertiary)" />
        </button>
      )}
      </div>

      <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{tituloRuta(nivel, meta)}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Entrenas {respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde'} · {respuestas?.diasSemana ?? 4} días/semana
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-4">
          <Flame size={18} color="var(--accent)" fill="var(--accent)" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Racha de {progreso.racha} {progreso.racha === 1 ? 'día' : 'días'} · Día {progreso.diaActual} de tu plan
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Detalles del onboarding</p>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <Fila label="Nivel" valor={NIVEL_LABEL[nivel]} />
          <Fila label="Meta" valor={META_LABEL[meta]} />
        </dl>
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-secondary)]"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
      </div>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-medium text-[var(--text-primary)]">{valor}</dd>
    </div>
  );
}
