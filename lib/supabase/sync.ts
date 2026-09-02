// Puente entre el progreso local (localStorage, funciona offline) y Supabase
// (persistencia real: sobrevive a cambiar de celular o borrar datos). Sesión 6.
// El patrón es offline-first (ver ESTADO.md → Decisiones técnicas): local manda
// para que la app nunca se sienta lenta ni rota sin señal; Supabase se actualiza
// en segundo plano, sin bloquear la interacción del usuario.

import { crearClienteSupabase } from './client';
import type { RespuestasOnboarding } from '../onboarding';
import type { Progreso, RegistroLog } from '../routine';

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
    await supabase
      .from('profiles')
      .update({
        nivel: respuestas.nivel,
        meta: respuestas.meta,
        horario: respuestas.horario,
        dias_semana: respuestas.diasSemana,
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
    .select('dia_actual, racha, ultimo_dia_completado, descanso_automatico, descanso_duracion_seg, sonido_descanso, peso_kg, unidad_peso')
    .eq('id', user.id)
    .maybeSingle();
  if (!perfil) return null;

  const { data: logsRemotos } = await supabase
    .from('workout_logs')
    .select('fecha, ejercicio_id, peso, reps, series')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const logs: RegistroLog[] = (logsRemotos ?? []).map((l) => ({
    fecha: l.fecha,
    ejercicioId: l.ejercicio_id,
    peso: Number(l.peso),
    reps: l.reps,
    series: l.series,
  }));

  return {
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
        dia_actual: p.diaActual,
        racha: p.racha,
        ultimo_dia_completado: p.ultimaFecha,
        descanso_automatico: p.descansoAutomatico,
        descanso_duracion_seg: p.descansoDuracionSeg,
        sonido_descanso: p.sonidoDescanso,
        peso_kg: p.pesoKg,
        unidad_peso: p.unidadPeso,
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

export function guardarLogRemoto(log: RegistroLog, onError?: () => void) {
  const supabase = crearClienteSupabase();
  supabase.auth.getUser().then(({ data }) => {
    const user = data.user;
    if (!user) return;
    supabase
      .from('workout_logs')
      .insert({
        user_id: user.id,
        ejercicio_id: log.ejercicioId,
        fecha: log.fecha,
        series: log.series,
        reps: log.reps,
        peso: log.peso,
      })
      .then(({ error }) => {
        if (error) onError?.();
      });
  });
}
