'use server';

// Server Action del panel: agregar acceso manual por correo (fallback si el
// webhook de Hotmart falla en darle acceso a alguien que sí pagó). Corre en
// el servidor con la sesión del propio admin — el RLS de la migración 0011
// exige profiles.role='admin' para poder insertar/actualizar
// hotmart_purchases; un usuario normal que llamara esto no lograría nada.

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';

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

  revalidatePath('/admin/usuarios');
  return {
    ok: true,
    mensaje: `Listo — cuando ${email} entre con su correo, va a tener acceso completo automáticamente.`,
  };
}
