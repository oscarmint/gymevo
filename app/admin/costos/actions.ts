'use server';

// Server Actions del panel: agregar/quitar un servicio de la lista de costos
// operativos. Corre con la sesión del propio admin — el RLS de
// costos_servicios (is_admin()) es quien de verdad impide que alguien más
// toque esto, esto solo evita el viaje redondo si alguien intenta sin serlo.

import { revalidatePath } from 'next/cache';
import { crearClienteSupabaseServidor } from '@/lib/supabase/server';

export interface ResultadoCosto {
  ok: boolean;
  mensaje: string;
}

export async function agregarCostoServicio(formData: FormData): Promise<ResultadoCosto> {
  const servicio = String(formData.get('servicio') ?? '').trim();
  const monto = Number(formData.get('monto'));
  const moneda = String(formData.get('moneda') ?? 'USD').trim().toUpperCase() || 'USD';
  const notas = String(formData.get('notas') ?? '').trim();

  if (!servicio) return { ok: false, mensaje: 'Escribe el nombre del servicio.' };
  if (!Number.isFinite(monto) || monto < 0) return { ok: false, mensaje: 'El monto mensual debe ser un número válido.' };

  const supabase = await crearClienteSupabaseServidor();
  const { error } = await supabase.from('costos_servicios').insert({
    servicio,
    monto_mensual: monto,
    moneda,
    notas: notas || null,
  });

  if (error) return { ok: false, mensaje: `No se pudo guardar: ${error.message}` };

  revalidatePath('/admin/costos');
  revalidatePath('/admin');
  return { ok: true, mensaje: `Agregado: ${servicio}.` };
}

export async function eliminarCostoServicio(id: string): Promise<void> {
  const supabase = await crearClienteSupabaseServidor();
  await supabase.from('costos_servicios').delete().eq('id', id);
  revalidatePath('/admin/costos');
  revalidatePath('/admin');
}
