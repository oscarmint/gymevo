'use client';

// PERFIL — nivel, meta, plan y salida. Sesión 6 conecta "Cerrar sesión" a
// Supabase Auth real; por ahora limpia el estado local y vuelve a la landing.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ExternalLink, Flame, LogOut, Pencil } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, NIVEL_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { calcularMacros } from '@/lib/macros';
import { ejerciciosDeHoy, guardarProgreso, leerProgreso, obtenerEjercicio, tituloRuta, type Progreso } from '@/lib/routine';
import { leerNombreLocal, guardarNombreLocal } from '@/lib/perfil';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { guardarNombreRemoto, guardarProgresoRemoto, leerMembresiaRemota, leerNombreRemoto } from '@/lib/supabase/sync';

const ESTADO_MEMBRESIA_LABEL: Record<string, string> = {
  trialing: 'En prueba gratis',
  active: 'Activa',
  past_due: 'Pago pendiente',
  cancelled: 'Cancelada (activa hasta el fin del período)',
};

export default function PerfilPage() {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<RespuestasOnboarding | null>(null);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [nombre, setNombre] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState('');
  const [membresia, setMembresia] = useState<{ plan: string; estado: string | null } | null>(null);
  const [pesoBorrador, setPesoBorrador] = useState('');
  const [estaturaBorrador, setEstaturaBorrador] = useState('');
  const [edadBorrador, setEdadBorrador] = useState('');

  // localStorage/sessionStorage no existen en el servidor: leerlos en el
  // initializer de useState causa mismatch de hydration. Este efecto es la
  // forma correcta (solo corre en el cliente, tras la hydration).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRespuestas(leerRespuestas());
    const p = leerProgreso();
    setProgreso(p);
    setPesoBorrador(p.pesoKg ? String(p.pesoKg) : '');
    setEstaturaBorrador(p.estaturaCm ? String(p.estaturaCm) : '');
    setEdadBorrador(p.edad ? String(p.edad) : '');
    setNombre(leerNombreLocal());
    leerNombreRemoto().then((remoto) => {
      if (remoto) {
        setNombre(remoto);
        guardarNombreLocal(remoto);
      }
    });
    leerMembresiaRemota().then(setMembresia);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!progreso) return null;

  const nivel = respuestas?.nivel ?? 'principiante';
  const meta = respuestas?.meta ?? 'musculo';

  // Misma llama de racha que Plan de hoy: se llena según el progreso real de
  // hoy (ejercicios ya marcados hechos / total de hoy), no es decorativa.
  const idsHoy = ejerciciosDeHoy(progreso.diaActual).map((e) => obtenerEjercicio(progreso.reemplazosHoy[e.id] ?? e.id));
  const progresoLlamaPct = idsHoy.length
    ? Math.round((idsHoy.filter((e) => progreso.hechosHoy.includes(e.id)).length / idsHoy.length) * 100)
    : 0;

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

  // Un solo guardado para los 3 datos: la ecuación de gasto calórico
  // (Mifflin-St Jeor) los necesita juntos — no tiene sentido calcular con
  // solo uno o dos.
  function guardarDatosMacros() {
    const kg = Number(pesoBorrador);
    const cm = Number(estaturaBorrador);
    const anios = Number(edadBorrador);
    if (!progreso || !kg || kg <= 0 || !cm || cm <= 0 || !anios || anios <= 0) return;
    const next = { ...progreso, pesoKg: kg, estaturaCm: cm, edad: anios };
    setProgreso(next);
    guardarProgreso(next);
    guardarProgresoRemoto(next);
  }

  function cambiarUnidadPeso(unidad: 'kg' | 'lb') {
    if (!progreso) return;
    const next = { ...progreso, unidadPeso: unidad };
    setProgreso(next);
    guardarProgreso(next);
    guardarProgresoRemoto(next);
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
            className="boton-3d flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--bg)]"
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
          <div className="relative" style={{ width: 18, height: 18 }}>
            <Flame size={18} color="var(--accent)" fill="none" className="absolute inset-0" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(${100 - progresoLlamaPct}% 0 0 0)`, transition: 'clip-path 500ms cubic-bezier(0.16,1,0.3,1)' }}
            >
              <Flame size={18} color="var(--accent)" fill="var(--accent)" />
            </div>
          </div>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Racha de {progreso.racha} {progreso.racha === 1 ? 'día' : 'días'} · Día {progreso.diaActual} de tu plan
          </span>
        </div>
      </div>

      {membresia?.plan === 'pro' && (
        <div className="mt-4 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Tu plan</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {membresia.estado ? (ESTADO_MEMBRESIA_LABEL[membresia.estado] ?? membresia.estado) : 'Activo'}
          </p>
          <a
            href="https://purchases.hotmart.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)]"
          >
            Gestionar o cancelar mi suscripción <ExternalLink size={13} />
          </a>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Tu perfil de entrenamiento</p>
        <dl className="mt-3 flex flex-col gap-2 text-sm">
          <Fila label="Nivel" valor={NIVEL_LABEL[nivel]} />
          <Fila label="Meta" valor={META_LABEL[meta]} />
        </dl>
        <div className="mt-4 flex items-center justify-between border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-4">
          <span className="text-sm text-[var(--text-secondary)]">Registrar peso de cada serie en:</span>
          <div className="flex gap-1.5">
            {(['lb', 'kg'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => cambiarUnidadPeso(u)}
                aria-pressed={progreso.unidadPeso === u}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold uppercase ${
                  progreso.unidadPeso === u
                    ? 'boton-3d border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]'
                    : 'superficie-3d border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tus macros — método completo de nutrición deportiva (Mifflin-St
          Jeor + ISSN, ver lib/macros.ts), no un promedio por g/kg. Ruta A
          (ganar músculo) / Ruta B (bajar grasa) del ebook cap. 3 — ambas
          rutas comparten el mismo entrenamiento; lo que cambia es esto. */}
      <div className="mt-4 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          Tus macros · {meta === 'musculo' ? 'Ruta A, ganar músculo' : 'Ruta B, bajar grasa'}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="peso-macros" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
              Peso (kg)
            </label>
            <input
              id="peso-macros"
              type="number"
              inputMode="decimal"
              placeholder="70"
              value={pesoBorrador}
              onChange={(e) => setPesoBorrador(e.target.value)}
              className="h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="estatura-macros" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
              Estatura (cm)
            </label>
            <input
              id="estatura-macros"
              type="number"
              inputMode="numeric"
              placeholder="170"
              value={estaturaBorrador}
              onChange={(e) => setEstaturaBorrador(e.target.value)}
              className="h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="edad-macros" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
              Edad
            </label>
            <input
              id="edad-macros"
              type="number"
              inputMode="numeric"
              placeholder="26"
              value={edadBorrador}
              onChange={(e) => setEdadBorrador(e.target.value)}
              className="h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={guardarDatosMacros}
          className="boton-3d mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--bg)]"
        >
          Calcular mis macros
        </button>

        {progreso.pesoKg && progreso.estaturaCm && progreso.edad ? (
          (() => {
            const macros = calcularMacros({
              pesoKg: progreso.pesoKg!,
              estaturaCm: progreso.estaturaCm!,
              edad: progreso.edad!,
              sexo: respuestas?.sexo ?? 'hombre',
              diasSemana: respuestas?.diasSemana ?? 4,
              meta,
            });
            return (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="col-span-2 rounded-xl bg-[var(--chip-bg)] px-4 py-3">
                  <p className="text-2xl font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                    {macros.kcal} <span className="text-sm font-semibold text-[var(--text-secondary)]">kcal/día</span>
                  </p>
                </div>
                <MacroDato label="Proteína" gramos={macros.proteinaG} />
                <MacroDato label="Carbohidratos" gramos={macros.carbohidratosG} />
                <MacroDato label="Grasas" gramos={macros.grasasG} />
              </div>
            );
          })()
        ) : (
          <p className="mt-3 text-xs text-[var(--text-secondary)]">
            Pon tu peso, estatura y edad para calcular tu gasto calórico real y cuánta proteína, carbohidratos y grasa te conviene comer cada día según tu ruta.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={cerrarSesion}
        className="superficie-3d mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-secondary)]"
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

function MacroDato({ label, gramos }: { label: string; gramos: number }) {
  return (
    <div className="rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] px-3 py-2.5">
      <p className="text-lg font-bold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">{gramos}g</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  );
}
