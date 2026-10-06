// Puente entre el progreso local (localStorage, funciona offline) y Supabase
// (persistencia real: sobrevive a cambiar de celular o borrar datos). Sesión 6.
// El patrón es offline-first (ver ESTADO.md → Decisiones técnicas): local manda
// para que la app nunca se sienta lenta ni rota sin señal; Supabase se actualiza
// en segundo plano, sin bloquear la interacción del usuario.

import { crearClienteSupabase } from './client';
import { escribirLocal, leerLocal } from '../almacen';
import type { RespuestasOnboarding } from '../onboarding';
import { diasDePlan, type Progreso, type RegistroLog } from '../routine';
import { leerUTM } from '../utm';

export async function usuarioActual() {
  const supabase = crearClienteSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** Se llama al entrar a /app tras iniciar sesión. Dos cosas, en este orden:
 * (1) `reconciliar_membresia` — SIEMPRE, crea la fila en `profiles` si no
 *     existe y fija su plan real según lo que haya pagado en Hotmart (si el
 *     webhook llegó antes de que la cuenta existiera). Idempotente, segura
 *     de llamar en cada login. Ver supabase/migrations/0007_*.
 * (2) Si HAY respuestas de onboarding frescas (recién completado, todavía en
 *     sessionStorage), las guarda — pero solo entonces: si `respuestas` es
 *     null (usuario que vuelve y ya cerró el tab del onboarding), NUNCA
 *     pisa su nivel/meta ya guardados con los valores por defecto. */
export async function sincronizarPerfilInicial(respuestas: RespuestasOnboarding | null) {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  await supabase.rpc('reconciliar_membresia');

  if (respuestas) {
    const utm = leerUTM();
    await supabase
      .from('profiles')
      .update({
        nivel: respuestas.nivel,
        meta: respuestas.meta,
        ...(respuestas.sexo ? { sexo: respuestas.sexo } : {}),
        horario: respuestas.horario,
        dias_semana: respuestas.diasSemana,
        ...(utm
          ? { utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign }
          : {}),
      })
      .eq('id', user.id);
  }
}

/** Trae el progreso remoto (perfil + historial de series). Si el usuario no
 * está logueado o hay un problema de red, regresa null y quien llama sigue
 * usando el localStorage — nunca rompe la app por falta de conexión. */
export async function leerProgresoRemoto(): Promise<Progreso | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase
    .from('profiles')
    .select('nivel, meta, sexo, dias_semana, dia_actual, racha, ultimo_dia_completado, descanso_automatico, descanso_duracion_seg, sonido_descanso, peso_kg, unidad_peso, estatura_cm, edad, peso_inicial_kg, cintura_cm, cintura_inicial_cm, fecha_inicio_medidas, rutinas_hechas, rutina_elegida, fecha_inicio_ruta')
    .eq('id', user.id)
    .maybeSingle();
  if (!perfil) return null;

  // La API devuelve como máximo 1.000 filas por consulta: se pide por páginas
  // para que quien lleva meses entrenando no pierda su historial.
  const logsRemotos: { fecha: string; ejercicio_id: string; peso: unknown; reps: number; series: number; rir: number | null }[] = [];
  for (let desde = 0; ; desde += 1000) {
    const { data: pagina, error } = await supabase
      .from('workout_logs')
      .select('fecha, ejercicio_id, peso, reps, series, rir')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(desde, desde + 999);
    // Si falla la lectura NO se devuelve un historial incompleto: el local manda.
    if (error || !pagina) return null;
    logsRemotos.push(...pagina);
    if (pagina.length < 1000) break;
  }

  const logs: RegistroLog[] = logsRemotos.map((l) => ({
    fecha: l.fecha,
    ejercicioId: l.ejercicio_id,
    peso: Number(l.peso),
    reps: l.reps,
    series: l.series,
    ...(l.rir === null || l.rir === undefined ? {} : { rir: l.rir }),
  }));

  return {
    nivel: perfil.nivel === 'intermedio' ? 'intermedio' : 'principiante',
    meta: perfil.meta === 'grasa' ? 'grasa' : 'musculo',
    sexo: perfil.sexo === 'mujer' ? 'mujer' : perfil.sexo === 'hombre' ? 'hombre' : null,
    diasSemana: diasDePlan(perfil.dias_semana),
    diaActual: perfil.dia_actual,
    racha: perfil.racha,
    ultimaFecha: perfil.ultimo_dia_completado,
    hechosHoy: [],
    reemplazosHoy: {},
    logs,
    descansoAutomatico: perfil.descanso_automatico,
    descansoDuracionSeg: perfil.descanso_duracion_seg,
    sonidoDescanso: perfil.sonido_descanso,
    pesoKg: perfil.peso_kg === null ? null : Number(perfil.peso_kg),
    unidadPeso: perfil.unidad_peso === 'kg' ? 'kg' : 'lb',
    estaturaCm: perfil.estatura_cm === null ? null : Number(perfil.estatura_cm),
    edad: perfil.edad === null ? null : Number(perfil.edad),
    pesoInicialKg: perfil.peso_inicial_kg === null ? null : Number(perfil.peso_inicial_kg),
    cinturaCm: perfil.cintura_cm === null ? null : Number(perfil.cintura_cm),
    cinturaInicialCm: perfil.cintura_inicial_cm === null ? null : Number(perfil.cintura_inicial_cm),
    fechaInicioMedidas: perfil.fecha_inicio_medidas,
    fechaInicioRuta: perfil.fecha_inicio_ruta ?? null,
    rutinasHechas: (perfil.rutinas_hechas as Progreso['rutinasHechas']) ?? null,
    rutinaElegida: (perfil.rutina_elegida as Progreso['rutinaElegida']) ?? null,
  };
}

const claveLog = (l: RegistroLog) => `${l.fecha}|${l.ejercicioId}|${l.peso}|${l.reps}|${l.series}`;

/** Une el progreso de la cuenta con el del teléfono SIN pisar lo que todavía no
 * subió: el perfil y los registros viejos vienen de la cuenta, pero se
 * conservan los registros que solo existen en este teléfono (series hechas sin
 * señal) y lo que ya se hizo hoy. */
export function fusionarProgreso(local: Progreso, remoto: Progreso): Progreso {
  // Se cuenta por repetición: cuatro series iguales (10×60) son cuatro registros,
  // y si la cuenta tiene dos, las otras dos siguen siendo "solo del teléfono".
  const enNube = new Map<string, number>();
  for (const l of remoto.logs) enNube.set(claveLog(l), (enNube.get(claveLog(l)) ?? 0) + 1);
  const soloLocales = local.logs.filter((l) => {
    const k = claveLog(l);
    const restantes = enNube.get(k) ?? 0;
    if (restantes > 0) {
      enNube.set(k, restantes - 1);
      return false;
    }
    return true;
  });
  return {
    ...remoto,
    logs: [...remoto.logs, ...soloLocales],
    hechosHoy: local.hechosHoy,
    reemplazosHoy: local.reemplazosHoy,
  };
}

/** Guarda en segundo plano (fire-and-forget): la UI ya actualizó localStorage
 * y no debe esperar la red para sentirse rápida. `onError` avisa a quien llama
 * si la sincronización falla (heurística 9: nunca fallar en silencio). */
export function guardarProgresoRemoto(p: Progreso, onError?: () => void) {
  const supabase = crearClienteSupabase();
  supabase.auth.getUser().then(({ data }) => {
    const user = data.user;
    if (!user) return;
    supabase
      .from('profiles')
      .update({
        nivel: p.nivel,
        meta: p.meta,
        ...(p.sexo ? { sexo: p.sexo } : {}),
        dias_semana: p.diasSemana,
        dia_actual: p.diaActual,
        racha: p.racha,
        ultimo_dia_completado: p.ultimaFecha,
        descanso_automatico: p.descansoAutomatico,
        descanso_duracion_seg: p.descansoDuracionSeg,
        sonido_descanso: p.sonidoDescanso,
        peso_kg: p.pesoKg,
        unidad_peso: p.unidadPeso,
        estatura_cm: p.estaturaCm,
        edad: p.edad,
        peso_inicial_kg: p.pesoInicialKg,
        cintura_cm: p.cinturaCm,
        cintura_inicial_cm: p.cinturaInicialCm,
        fecha_inicio_medidas: p.fechaInicioMedidas,
        fecha_inicio_ruta: p.fechaInicioRuta ?? null,
        rutinas_hechas: p.rutinasHechas ?? null,
        rutina_elegida: p.rutinaElegida ?? null,
      })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) onError?.();
      });
  });
}

/** Estado real de la membresía — Perfil lo usa para mostrar "Tu plan" y el
 * enlace de gestionar/cancelar (hallazgo de la auditoría: el paywall promete
 * "cancela cuando quieras" pero la app no mostraba dónde hacerlo). */
export async function leerMembresiaRemota(): Promise<{ plan: string; estado: string | null } | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase.from('profiles').select('plan, membership_status').eq('id', user.id).maybeSingle();
  if (!perfil) return null;
  return { plan: perfil.plan, estado: perfil.membership_status };
}

/** Fecha hasta la que tiene acceso pagado (pago único). Perfil y el aviso de
 * renovación de "Plan de hoy" la usan. null si no hay sesión o no hay vencimiento
 * (cuentas antiguas de suscripción, sin fecha propia). */
export async function leerVencimientoRemoto(): Promise<Date | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase.from('profiles').select('access_until').eq('id', user.id).maybeSingle();
  if (!perfil?.access_until) return null;
  const fin = new Date(perfil.access_until);
  return Number.isNaN(fin.getTime()) ? null : fin;
}

/** Estado de acceso para el aviso de "Plan de hoy": si tiene un plan pago
 * (con su vencimiento) o si sigue en la prueba gratis sin tarjeta. */
export async function leerEstadoAccesoRemoto(): Promise<{ plan: string; accessUntil: Date | null; trialEndsAt: Date | null } | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase.from('profiles').select('plan, access_until, trial_ends_at').eq('id', user.id).maybeSingle();
  if (!perfil) return null;
  const fecha = (v: string | null) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  return { plan: perfil.plan, accessUntil: fecha(perfil.access_until), trialEndsAt: fecha(perfil.trial_ends_at) };
}

/** Nombre que el usuario eligió para que le llamemos (Perfil). Separado de
 * `Progreso`: no es progreso de entrenamiento, es identidad. */
export async function leerNombreRemoto(): Promise<string | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase.from('profiles').select('nombre').eq('id', user.id).maybeSingle();
  return perfil?.nombre ?? null;
}

export async function leerCorreoRemoto(): Promise<string | null> {
  const supabase = crearClienteSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

/** Solo para mostrar u ocultar el botón "Panel de administrador" en Perfil —
 * la puerta real es proxy.ts, que vuelve a comprobar `role` en el servidor
 * antes de dejar entrar a /admin (nunca confiar en esto para bloquear acceso). */
export async function esAdmin(): Promise<boolean> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return false;

  const { data: perfil } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  return perfil?.role === 'admin';
}

export function guardarNombreRemoto(nombre: string, onError?: () => void) {
  const supabase = crearClienteSupabase();
  supabase.auth.getUser().then(({ data }) => {
    const user = data.user;
    if (!user) return;
    supabase
      .from('profiles')
      .update({ nombre })
      .eq('id', user.id)
      .then(({ error }) => {
        if (error) onError?.();
      });
  });
}

/** Foto de perfil (Perfil): el usuario elige entre cámara/galería en el
 * selector nativo del sistema — el `<input type="file">` sin restringir
 * `capture` es justo lo que abre esa elección en el navegador. Sube al
 * bucket `avatars` bajo `<user_id>/avatar.jpg` (upsert: siempre pisa la
 * foto anterior, nunca acumula archivos viejos) y guarda la URL pública en
 * `profiles.avatar_url`. Devuelve `null` si algo falla — quien llama decide
 * si avisa al usuario (nunca fallar en silencio, heurística 9). */
export async function subirAvatar(archivo: File): Promise<string | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const ruta = `${user.id}/avatar.${extension}`;

  const { error: errorSubida } = await supabase.storage.from('avatars').upload(ruta, archivo, {
    upsert: true,
    contentType: archivo.type || 'image/jpeg',
  });
  if (errorSubida) return null;

  const { data: publica } = supabase.storage.from('avatars').getPublicUrl(ruta);
  // Cache-bust: el navegador no debe reusar la imagen vieja si el usuario
  // cambia de foto pero la ruta (mismo nombre de archivo) queda igual.
  const url = `${publica.publicUrl}?t=${Date.now()}`;

  const { error: errorGuardado } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
  if (errorGuardado) return null;

  return url;
}

export async function leerAvatarRemoto(): Promise<string | null> {
  const supabase = crearClienteSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const { data: perfil } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle();
  return perfil?.avatar_url ?? null;
}

const KEY_COLA_LOGS = 'gymevo_cola_logs';

interface LogEnCola extends RegistroLog {
  /** Id generado en el teléfono: si el envío se repite (se cayó la señal justo
   * al responder), la base lo ignora en vez de duplicar la serie. */
  id: string;
}

function leerCola(): LogEnCola[] {
  try {
    const crudo = leerLocal(KEY_COLA_LOGS);
    const lista = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

let vaciando = false;

/** Sube las series que quedaron pendientes (sin señal o con error). Quita de la
 * cola solo las que la nube confirmó. Devuelve true si no queda nada pendiente. */
export async function vaciarColaLogs(): Promise<boolean> {
  if (vaciando) return false;
  vaciando = true;
  try {
    const pendientes = leerCola();
    if (pendientes.length === 0) return true;
    const supabase = crearClienteSupabase();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return false;
    const { error } = await supabase.from('workout_logs').upsert(
      pendientes.map((l) => ({
        id: l.id,
        user_id: user.id,
        ejercicio_id: l.ejercicioId,
        fecha: l.fecha,
        series: l.series,
        reps: l.reps,
        peso: l.peso,
        rir: l.rir ?? null,
      })),
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (error) return false;
    // Se re-lee la cola: pudo llegar otra serie mientras se enviaba.
    const enviados = new Set(pendientes.map((l) => l.id));
    escribirLocal(KEY_COLA_LOGS, JSON.stringify(leerCola().filter((l) => !enviados.has(l.id))));
    return true;
  } catch {
    return false;
  } finally {
    vaciando = false;
  }
}

/** La serie se anota primero en la cola del teléfono y luego se intenta subir:
 * así una serie hecha sin señal (o con la app cerrada a medias) nunca se pierde
 * y se sube sola al volver la conexión. `onError` avisa si quedó pendiente. */
export function guardarLogRemoto(log: RegistroLog, onError?: () => void) {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const cola = leerCola();
  cola.push({ ...log, id });
  escribirLocal(KEY_COLA_LOGS, JSON.stringify(cola));
  vaciarColaLogs().then((ok) => {
    if (!ok) onError?.();
  });
}
