'use client';

// PERFIL — nivel, meta, plan y salida. Sesión 6 conecta "Cerrar sesión" a
// Supabase Auth real; por ahora limpia el estado local y vuelve a la landing.

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff, Camera, Check, ExternalLink, Flame, Loader2, LogOut, Pencil } from 'lucide-react';
import { HORARIO_LABEL, META_LABEL, NIVEL_LABEL, leerRespuestas, type RespuestasOnboarding } from '@/lib/onboarding';
import { calcularMacros } from '@/lib/macros';
import { cambiarRuta, ejerciciosDeHoy, guardarProgreso, leerProgreso, obtenerEjercicio, registrarMedidasIniciales, tituloRuta, type Progreso } from '@/lib/routine';
import type { Meta, Nivel } from '@/lib/onboarding';
import { leerAvatarLocal, guardarAvatarLocal, leerNombreLocal, guardarNombreLocal } from '@/lib/perfil';
import { crearClienteSupabase } from '@/lib/supabase/client';
import { activarAvisos, desactivarAvisos, estaSuscrito, pushSoportado } from '@/lib/push-client';
import { guardarNombreRemoto, guardarProgresoRemoto, leerAvatarRemoto, leerMembresiaRemota, leerNombreRemoto, subirAvatar } from '@/lib/supabase/sync';

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
  const [cinturaBorrador, setCinturaBorrador] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [subiendoAvatar, setSubiendoAvatar] = useState(false);
  const [errorAvatar, setErrorAvatar] = useState(false);
  const inputAvatarRef = useRef<HTMLInputElement>(null);
  // Confirmación antes de cambiar nivel/meta (a pedido explícito del
  // usuario): es un cambio real de plan, no un ajuste de un campo cualquiera
  // — nunca se aplica con un solo tap.
  const [pidiendoConfirmacion, setPidiendoConfirmacion] = useState<{ nivel: Nivel; meta: Meta } | null>(null);

  // Avisos push (recordatorio de "2 días sin entrenar") — `null` mientras se
  // revisa si este navegador ya está suscrito; `false` también cubre el caso
  // de un navegador que no soporta push (el botón se oculta, ver JSX).
  const [avisosActivos, setAvisosActivos] = useState<boolean | null>(null);
  const [avisosSoportados, setAvisosSoportados] = useState(true);
  const [cargandoAvisos, setCargandoAvisos] = useState(false);
  const [errorAvisos, setErrorAvisos] = useState<string | null>(null);

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
    setCinturaBorrador(p.cinturaCm ? String(p.cinturaCm) : '');
    setNombre(leerNombreLocal());
    leerNombreRemoto().then((remoto) => {
      if (remoto) {
        setNombre(remoto);
        guardarNombreLocal(remoto);
      }
    });
    setAvatarUrl(leerAvatarLocal());
    leerAvatarRemoto().then((remoto) => {
      if (remoto) {
        setAvatarUrl(remoto);
        guardarAvatarLocal(remoto);
      }
    });
    leerMembresiaRemota().then(setMembresia);
    if (pushSoportado()) {
      estaSuscrito().then(setAvisosActivos);
    } else {
      setAvisosSoportados(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!progreso) return null;

  const nivel = progreso.nivel;
  const meta = progreso.meta;

  // Misma llama de racha que Plan de hoy: se llena según el progreso real de
  // hoy (ejercicios ya marcados hechos / total de hoy), no es decorativa.
  const idsHoy = ejerciciosDeHoy(progreso.diaActual, nivel).map((e) => obtenerEjercicio(progreso.reemplazosHoy[e.id] ?? e.id));
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
    // Cintura es opcional (solo importa de verdad para Ruta B) — si el
    // usuario la deja vacía, no se pierde ni se fuerza a poner algo.
    const cinturaCm = cinturaBorrador ? Number(cinturaBorrador) : null;
    const conMedidas = registrarMedidasIniciales(progreso, kg, cinturaCm && cinturaCm > 0 ? cinturaCm : progreso.cinturaCm);
    const next = { ...conMedidas, estaturaCm: cm, edad: anios };
    setProgreso(next);
    guardarProgreso(next);
    guardarProgresoRemoto(next);
  }

  async function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ''; // permite elegir el mismo archivo dos veces seguidas
    if (!archivo) return;
    setSubiendoAvatar(true);
    setErrorAvatar(false);
    const url = await subirAvatar(archivo);
    setSubiendoAvatar(false);
    if (!url) {
      setErrorAvatar(true);
      return;
    }
    setAvatarUrl(url);
    guardarAvatarLocal(url);
  }

  function confirmarCambioRuta() {
    if (!progreso || !pidiendoConfirmacion) return;
    const next = cambiarRuta(progreso, pidiendoConfirmacion.nivel, pidiendoConfirmacion.meta);
    setProgreso(next);
    guardarProgreso(next);
    guardarProgresoRemoto(next);
    setPidiendoConfirmacion(null);
  }

  function cambiarUnidadPeso(unidad: 'kg' | 'lb') {
    if (!progreso) return;
    const next = { ...progreso, unidadPeso: unidad };
    setProgreso(next);
    guardarProgreso(next);
    guardarProgresoRemoto(next);
  }

  async function alternarAvisos() {
    setErrorAvisos(null);
    setCargandoAvisos(true);
    try {
      if (avisosActivos) {
        await desactivarAvisos();
        setAvisosActivos(false);
      } else {
        const resultado = await activarAvisos();
        if (resultado.ok) {
          setAvisosActivos(true);
        } else if (resultado.motivo === 'permiso-denegado') {
          setErrorAvisos('Bloqueaste las notificaciones para GymEvo — actívalas desde los ajustes de tu navegador para este sitio.');
        } else {
          setErrorAvisos('No pudimos activar los avisos en este dispositivo. Intenta de nuevo.');
        }
      }
    } finally {
      setCargandoAvisos(false);
    }
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
      {/* Foto de perfil: círculo tocable con inicial de respaldo (nunca un
          espacio vacío) — el input de archivo SIN restringir `capture` deja
          que el propio sistema ofrezca "Cámara" o "Galería" (a pedido
          explícito del usuario: quiere las dos opciones, no solo selfie). */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Cambiar foto de perfil"
          onClick={() => inputAvatarRef.current?.click()}
          disabled={subiendoAvatar}
          className="superficie-3d relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--surface)] bg-[var(--chip-bg)] shadow-[var(--shadow-1)] disabled:opacity-70"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Tu foto de perfil" className="size-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-[var(--accent)] [font-family:var(--font-display)]">
              {(nombre ?? '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          {subiendoAvatar ? (
            <span className="absolute inset-0 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_55%,transparent)]">
              <Loader2 size={18} color="var(--bg)" className="animate-spin motion-reduce:animate-none" />
            </span>
          ) : (
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_55%,transparent)] py-1">
              <Camera size={13} color="var(--bg)" />
            </span>
          )}
        </button>
        <input
          ref={inputAvatarRef}
          type="file"
          accept="image/*"
          onChange={elegirFoto}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
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
      </div>
      {errorAvatar && (
        <p className="mt-2 text-xs font-medium text-[var(--status-error)]">No pudimos subir la foto. Intenta de nuevo.</p>
      )}

      <div className="mt-6 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] p-5">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{tituloRuta(nivel, meta)}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Entrenas {respuestas ? HORARIO_LABEL[respuestas.horario] : 'en la tarde'} · {respuestas?.diasSemana ?? 4} días/semana
        </p>

        {/* Nivel y meta se pueden cambiar cuando el usuario quiera — no
            siempre va a querer lo mismo, o cambia de parecer (pedido
            explícito). Cada cambio pide confirmación porque reordena TODO
            el plan (ejercicios, macros, cardio), no es un ajuste menor. */}
        <div className="mt-4 flex flex-col gap-3 border-t border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] pt-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">Nivel</p>
            <div className="mt-1.5 flex gap-2">
              {(['principiante', 'intermedio'] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => n !== nivel && setPidiendoConfirmacion({ nivel: n, meta })}
                  aria-pressed={nivel === n}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                    nivel === n
                      ? 'boton-3d-borde border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--accent)]'
                      : 'superficie-3d border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                  }`}
                >
                  {NIVEL_LABEL[n]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">Meta</p>
            <div className="mt-1.5 flex gap-2">
              {(['musculo', 'grasa'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => m !== meta && setPidiendoConfirmacion({ nivel, meta: m })}
                  aria-pressed={meta === m}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold capitalize ${
                    meta === m
                      ? 'boton-3d-borde border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--accent)]'
                      : 'superficie-3d border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-[var(--text-secondary)]'
                  }`}
                >
                  {META_LABEL[m]}
                </button>
              ))}
            </div>
          </div>
        </div>

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
        <div className={`mt-3 grid gap-2 ${meta === 'grasa' ? 'grid-cols-2' : 'grid-cols-3'}`}>
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
          {/* Solo Ruta B: en bajar grasa el objetivo es MANTENER las cargas,
              así que el progreso real se ve en centímetros, no en peso
              levantado (ver Historial → "Tu progreso"). */}
          {meta === 'grasa' && (
            <div className="flex flex-col gap-1">
              <label htmlFor="cintura-macros" className="text-xs font-semibold uppercase tracking-[0.04em] text-[var(--text-tertiary)]">
                Cintura (cm)
              </label>
              <input
                id="cintura-macros"
                type="number"
                inputMode="decimal"
                placeholder="80"
                value={cinturaBorrador}
                onChange={(e) => setCinturaBorrador(e.target.value)}
                className="h-11 w-full rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--bg)] px-2 text-base text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
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

      {/* Recordatorio push (2 días sin entrenar) — activo/inactivo POR
          DISPOSITIVO, nunca se pide el permiso solo, siempre con un botón
          de por medio (los navegadores bloquean el permiso "para siempre"
          si se pide en frío al cargar la pantalla). Se oculta del todo si
          este navegador no soporta push (ej. Safari de iPhone sin instalar
          la app a la pantalla de inicio). */}
      {avisosSoportados ? (
        <div className="superficie-3d mt-6 flex items-center justify-between gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              {avisosActivos ? <Bell size={18} color="var(--accent)" /> : <BellOff size={18} color="var(--text-secondary)" />}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Recordatorio de racha</p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {avisosActivos ? 'Activo en este dispositivo' : 'Un aviso si llevas 2 días sin entrenar'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alternarAvisos}
            disabled={cargandoAvisos || avisosActivos === null}
            className={`flex h-9 shrink-0 items-center justify-center rounded-full px-4 text-xs font-semibold transition-colors disabled:opacity-60 ${
              avisosActivos
                ? 'border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
                : 'bg-[var(--accent)] text-[var(--bg)]'
            }`}
          >
            {cargandoAvisos ? <Loader2 size={14} className="animate-spin motion-reduce:animate-none" /> : avisosActivos ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ) : null}
      {errorAvisos && <p className="mt-2 text-xs text-[var(--status-warning)]">{errorAvisos}</p>}

      <button
        type="button"
        onClick={cerrarSesion}
        className="superficie-3d mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] text-sm font-semibold text-[var(--text-secondary)]"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
      </div>

      {pidiendoConfirmacion && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-confirmar-ruta"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_oklab,var(--text-primary)_35%,transparent)] px-6"
          onClick={() => setPidiendoConfirmacion(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-2xl border border-[color-mix(in_oklab,var(--text-tertiary)_20%,transparent)] bg-[var(--surface)] p-5"
          >
            <p id="titulo-confirmar-ruta" className="text-base font-semibold text-[var(--text-primary)]">
              ¿Estás seguro?
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Vas a cambiar tu plan a <strong>{tituloRuta(pidiendoConfirmacion.nivel, pidiendoConfirmacion.meta)}</strong>. Tus
              ejercicios, macros y cardio de hoy en adelante se van a ajustar a esta nueva ruta.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setPidiendoConfirmacion(null)}
                className="superficie-3d flex h-12 flex-1 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] text-sm font-semibold text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarCambioRuta}
                className="boton-3d flex h-12 flex-1 items-center justify-center rounded-xl bg-[var(--accent)] text-sm font-semibold text-[var(--bg)]"
              >
                Sí, cambiar
              </button>
            </div>
          </div>
        </div>
      )}
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
