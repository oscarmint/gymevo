'use client';

// Activar/desactivar los avisos push EN ESTE DISPOSITIVO — usado desde
// Perfil. Nunca pide permiso de notificaciones sin que el usuario toque un
// botón primero (pedirlo "en frío" al cargar la app es el patrón que más
// hace que los navegadores lo bloqueen para siempre).

function base64UrlAUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/** null = el navegador no soporta push (ej. Safari de iPhone sin "Agregar a
 * inicio", o un navegador viejo) — el llamador debe ocultar el control. */
export function pushSoportado(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function estaSuscrito(): Promise<boolean> {
  if (!pushSoportado()) return false;
  const registro = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await registro?.pushManager.getSubscription();
  return !!sub;
}

export async function activarAvisos(): Promise<{ ok: boolean; motivo?: string }> {
  if (!pushSoportado()) return { ok: false, motivo: 'no-soportado' };

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return { ok: false, motivo: 'permiso-denegado' };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return { ok: false, motivo: 'falta-configuracion' };

  const registro = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  const sub = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlAUint8Array(publicKey),
  });

  const json = sub.toJSON();
  const resp = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
  });
  if (!resp.ok) return { ok: false, motivo: 'error-guardando' };

  return { ok: true };
}

export async function desactivarAvisos(): Promise<void> {
  if (!pushSoportado()) return;
  const registro = await navigator.serviceWorker.getRegistration('/sw.js');
  const sub = await registro?.pushManager.getSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe();
  await fetch('/api/push/subscribe', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
}
