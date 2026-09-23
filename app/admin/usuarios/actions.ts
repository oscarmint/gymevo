'use server';

// Server Action del panel: agregar acceso manual por correo (fallback si el
// webhook de Hotmart falla en darle acceso a alguien que sí pagó). Corre en
// el servidor con la sesión del propio admin — el RLS de la migración 0011
// exige profiles.role='admin' para poder insertar/actualizar
// hotmart_purchases; un usuario normal que llamara esto no lograría nada.

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { registrarAuditoria } from '@/lib/admin';
import { MESES_POR_PLAN, calcularVencimiento, type PlanId } from '@/lib/planes';

export interface ResultadoAgregarUsuario {
  ok: boolean;
  mensaje: string;
}

export async function agregarAccesoManual(formData: FormData): Promise<ResultadoAgregarUsuario> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const nombre = String(formData.get('nombre') ?? '').trim();
  const planElegido = String(formData.get('plan') ?? 'mensual');

  if (!email || !email.includes('@')) {
    return { ok: false, mensaje: 'Escribe un correo válido.' };
  }
  const sinVencimiento = planElegido === 'sin_vencimiento';
  if (!sinVencimiento && !(planElegido in MESES_POR_PLAN)) {
    return { ok: false, mensaje: 'Elige un plan válido.' };
  }

  const supabase = await crearClienteSupabaseServidor();

  // Los meses del plan se SUMAN al acceso que todavía le quede (igual que
  // hace el webhook con una compra real — lib/planes.ts).
  let accessUntil: string | null = null;
  if (!sinVencimiento) {
    const { data: existente } = await supabase.from('hotmart_purchases').select('access_until').eq('email', email).maybeSingle();
    const actual = existente?.access_until ? new Date(existente.access_until) : null;
    accessUntil = calcularVencimiento(MESES_POR_PLAN[planElegido as PlanId], actual).toISOString();
  }

  const { error } = await supabase
    .from('hotmart_purchases')
    .upsert(
      {
        email,
        plan: 'pro',
        status: 'active',
        access_until: accessUntil,
        nombre_manual: nombre || null,
        agregado_manualmente: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  const etiquetaPlan = sinVencimiento ? 'sin vencimiento' : planElegido;
  await registrarAuditoria('USUARIO_ACCESO_DADO', `Plan ${etiquetaPlan} dado a mano a ${email}${accessUntil ? ` (vence ${accessUntil.slice(0, 10)})` : ''}`);
  revalidatePath('/admin/usuarios');
  const id = String(formData.get('id') ?? '').trim();
  if (id) revalidatePath(`/admin/usuarios/${id}`);
  return {
    ok: true,
    mensaje: sinVencimiento
      ? `Listo — ${email} va a tener acceso completo sin fecha de vencimiento cuando entre con su correo.`
      : `Listo — ${email} va a tener el plan ${planElegido} cuando entre con su correo (vence ${accessUntil!.slice(0, 10)}).`,
  };
}

export interface ResultadoRevocarAcceso {
  ok: boolean;
  mensaje: string;
}

/** Quita el acceso Pro que se le haya dado (comprado o a mano). No borra la
 * fila de `hotmart_purchases` (perder el historial sería el error real) —
 * solo la marca como cancelada y sin vencimiento futuro, para que
 * `plan_segun_estado` (migración 0018) le calcule 'free' en su próximo
 * inicio de sesión (`reconciliar_membresia`, corre client-side al entrar). */
export async function revocarAccesoManual(formData: FormData): Promise<ResultadoRevocarAcceso> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const motivo = String(formData.get('motivo') ?? '').trim();

  if (!email || !email.includes('@')) {
    return { ok: false, mensaje: 'Correo inválido.' };
  }
  if (!motivo) {
    return { ok: false, mensaje: 'Escribe el motivo — queda en la auditoría.' };
  }

  const supabase = await crearClienteSupabaseServidor();
  const { error } = await supabase
    .from('hotmart_purchases')
    .upsert(
      { email, status: 'cancelled', access_until: null, updated_at: new Date().toISOString() },
      { onConflict: 'email' },
    );

  if (error) {
    return { ok: false, mensaje: `No se pudo quitar el acceso: ${error.message}` };
  }

  await registrarAuditoria('USUARIO_ACCESO_REVOCADO', `Acceso Pro revocado a ${email}`, motivo);
  revalidatePath('/admin/usuarios');
  const id = String(formData.get('id') ?? '').trim();
  if (id) revalidatePath(`/admin/usuarios/${id}`);
  return { ok: true, mensaje: `Listo — ${email} pasa a plan Gratis en su próximo ingreso.` };
}
