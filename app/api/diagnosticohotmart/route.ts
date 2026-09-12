// Ruta temporal de diagnóstico — confirma que las credenciales de Hotmart
// (HOTMART_CLIENT_ID/SECRET/BASIC_TOKEN) están configuradas y son válidas,
// SIN cancelar ninguna suscripción real. Se borra en cuanto se confirme.
// Nunca devuelve el token ni ningún valor de las credenciales, solo si la
// autenticación con Hotmart funcionó.
import { NextResponse } from 'next/server';
import { obtenerTokenHotmart } from '@/lib/hotmart-api';

export async function GET() {
  try {
    await obtenerTokenHotmart();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, motivo: e instanceof Error ? e.message : 'error desconocido' }, { status: 502 });
  }
}
