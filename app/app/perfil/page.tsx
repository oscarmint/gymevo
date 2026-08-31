'use client';

// PERFIL — nivel, meta, plan y salida. Sesión 6 conecta "Cerrar sesión" a
// Supabase Auth real; por ahora limpia el estado local y vuelve a la landing.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, LogOut } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, NIVEL_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { leerProgreso, tituloRuta, type Progreso } from '@/lib/routine';
import { crearClienteSupabase } from '@/lib/supabase/client';

export default function PerfilPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [progreso, setProgreso] = useState<Progreso | null>(null);

  // localStorage/sessionStorage no existen en el servidor: leerlos en el
  // initializer de useState causa mismatch de hydration. Este efecto es la
  // forma correcta (solo corre en el cliente, tras la hydration).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRespuestas(leerRespuestas());
    setProgreso(leerProgreso());
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!progreso) return null;

  const nivel = respuestas?.nivel ?? 'principiante';
  const meta = respuestas?.meta ?? 'musculo';

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    sessionStorage.clear();
    localStorage.removeItem('gymevo_progreso');
    router.push('/');
  }

  return (
    <div className="px-5 pt-6">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[var(--accent)]">Tu cuenta</p>
      <h1 className="mt-1 text-2xl font-bold text-[var(--text-primary)] [font-family:var(--font-display)]">Perfil</h1>

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
        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-sm font-semibold text-[var(--text-secondary)]"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
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
