// Envío de notificaciones push del navegador (Web Push API + VAPID) — usado
// solo en el servidor (el cron de recordatorio de inactividad). Las claves
// VAPID son propias (generadas una vez con `web-push generate-vapid-keys`),
// no dependen de ninguna cuenta externa.
import webpush from 'web-push';

let configurado = false;

function asegurarConfigurado() {
  if (configurado) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error('FALTAN las variables VAPID (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT)');
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configurado = true;
}

export interface SuscripcionPush {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** true si se envió; false si la suscripción ya no es válida (navegador
 * desinstalado, permiso revocado, etc. — el llamador debe borrarla). */
export async function enviarPush(
  sub: SuscripcionPush,
  payload: { titulo: string; cuerpo: string; url?: string }
): Promise<boolean> {
  asegurarConfigurado();
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: unknown) {
    // 404/410 = la suscripción expiró o el usuario la revocó — no es un
    // error real del sistema, es esperado con el tiempo.
    const statusCode = (err as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) return false;
    throw err;
  }
}
