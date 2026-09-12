// Ruta temporal de diagnóstico — confirma que HOTMART_CLIENT_ID/SECRET están
// configuradas y son válidas para Hotmart, SIN cancelar ninguna suscripción
// real. Se borra en cuanto se confirma. Nunca devuelve el token ni ningún
// valor de las credenciales, solo si la autenticación con Hotmart funcionó.
import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ ok: false, motivo: 'faltan HOTMART_CLIENT_ID/HOTMART_CLIENT_SECRET' }, { status: 500 });
  }
  try {
    const url = `https://api-sec-vlc.hotmart.com/security/oauth/token?grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      return NextResponse.json({ ok: false, motivo: 'hotmart_rechazo_credenciales', status: res.status }, { status: 502 });
    }
    const data = (await res.json()) as { access_token?: string };
    return NextResponse.json({ ok: Boolean(data.access_token) });
  } catch {
    return NextResponse.json({ ok: false, motivo: 'error_de_red' }, { status: 500 });
  }
}
