'use server';

// Server Action del panel: agregar acceso manual por correo (fallback si el
// webhook de Hotmart falla en darle acceso a alguien que sí pagó). Corre en
// el servidor con la sesión del propio admin — el RLS de la migración 0011
// exige profiles.role='admin' para poder insertar/actualizar
// hotmart_purchases; un usuario normal que llamara esto no lograría nada.

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';
import { registrarAuditoria } from '@/lib/admin';

export interface ResultadoAgregarUsuario {
  ok: boolean;
  mensaje: string;
}

export async function agregarAccesoManual(formData: FormData): Promise<ResultadoAgregarUsuario> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const nombre = String(formData.get('nombre') ?? '').trim();

  if (!email || !email.includes('@')) {
    return { ok: false, mensaje: 'Escribe un correo válido.' };
  }

  const supabase = await crearClienteSupabaseServidor();
  const { error } = await supabase
    .from('hotmart_purchases')
    .upsert(
      {
        email,
        plan: 'pro',
        status: 'active',
        nombre_manual: nombre || null,
        agregado_manualmente: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    );

  if (error) {
    return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };
  }

  await registrarAuditoria('USUARIO_ACCESO_DADO', `Acceso Pro dado a mano a ${email}`);
  revalidatePath('/admin/usuarios');
  const id = String(formData.get('id') ?? '').trim();
  if (id) revalidatePath(`/admin/usuarios/${id}`);
  return {
    ok: true,
    mensaje: `Listo — cuando ${email} entre con su correo, va a tener acceso completo automáticamente.`,
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
