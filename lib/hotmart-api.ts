// Cliente de la API de Hotmart (server-only) — usado para cancelar una
// suscripción DE VERDAD desde la propia app (Perfil → "Desactivar"). Antes
// ese botón solo enlazaba a una URL de Hotmart rota (purchases.hotmart.com,
// DNS_PROBE_FINISHED_NXDOMAIN — hallazgo real del usuario); la URL correcta
// de autoservicio es consumer.hotmart.com, pero el usuario pidió explícito
// que la cancelación no saque al comprador de la app.
//
// Flujo (documentado por Hotmart Developers, verificado 12/09/2026):
// 1. POST https://api-sec-vlc.hotmart.com/security/oauth/token
//    (grant_type=client_credentials + client_id + client_secret) → access_token.
// 2. POST https://developers.hotmart.com/payments/api/v1/subscriptions/{subscriber_code}/cancel
//    con Authorization: Bearer <access_token>.
//
// Nunca falla en silencio: sin credenciales configuradas, revienta AL LLAMARSE
// (no al importar el módulo — mismo patrón fail-secure que hotmart-verify.ts),
// y cualquier error de Hotmart se propaga tal cual al endpoint que llama esto.

const OAUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const CANCEL_URL = 'https://developers.hotmart.com/payments/api/v1/subscriptions';

function credencialesHotmart(): { clientId: string; clientSecret: string; basicToken: string } {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basicToken = process.env.HOTMART_BASIC_TOKEN;
  if (!clientId || !clientSecret || !basicToken) {
    throw new Error(
      'FALTA HOTMART_CLIENT_ID / HOTMART_CLIENT_SECRET / HOTMART_BASIC_TOKEN — no se puede cancelar la suscripción sin las 3 credenciales de la API de Hotmart',
    );
  }
  return { clientId, clientSecret, basicToken };
}

/** Exportado además de usarse internamente: lo usa la ruta de diagnóstico
 * temporal para confirmar que las 3 credenciales funcionan sin cancelar
 * ninguna suscripción real. */
export async function obtenerTokenHotmart(): Promise<string> {
  // Hotmart exige las 3 credenciales a la vez para el OAuth: client_id y
  // client_secret como query params, MÁS el token "Basic" (el 3er valor que
  // Hotmart muestra junto a los otros dos al crear la credencial) como header
  // Authorization — con solo los 2 primeros, Hotmart responde 401 (verificado
  // en producción, 12/09/2026).
  const { clientId, clientSecret, basicToken } = credencialesHotmart();
  const url = `${OAUTH_URL}?grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${basicToken}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Hotmart OAuth falló (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Hotmart OAuth no devolvió access_token');
  return data.access_token;
}

/** Cancela de verdad la suscripción en Hotmart (deja de cobrar en el
 * siguiente ciclo; el acceso ya pagado sigue vivo hasta esa fecha — mismo
 * criterio que ya usa `ESTADO_MEMBRESIA_LABEL['cancelled']` en Perfil). */
export async function cancelarSuscripcionHotmart(subscriberCode: string): Promise<void> {
  const token = await obtenerTokenHotmart();
  const res = await fetch(`${CANCEL_URL}/${encodeURIComponent(subscriberCode)}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ send_mail: true }),
  });
  if (!res.ok) {
    throw new Error(`Hotmart no pudo cancelar la suscripción (${res.status}): ${await res.text()}`);
  }
}
