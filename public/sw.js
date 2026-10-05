// Service worker de GymEvoApp: notificaciones push + caché de las imágenes.
//
// 1) CACHÉ DE IMÁGENES (pedido del dueño, 05/10/2026: "que queden en el caché
//    y no dependa del internet" — en muchos gimnasios no hay señal). Solo se
//    cachean las imágenes de ejercicios/ilustraciones (mismo origen, GET)
//    A MEDIDA QUE LA PERSONA LAS ABRE — nunca se descargan por adelantado,
//    ni siquiera las del plan (decisión del dueño: no gastar datos del
//    teléfono en imágenes que quizá nunca se vean). Usa "stale-while-
//    revalidate": se sirve al instante lo que ya está guardado y, si hay
//    internet, se refresca en segundo plano — así una
//    imagen corregida (mismo nombre de archivo) llega sola en la siguiente
//    visita, sin que haya que cambiar nada aquí. Nada más se cachea: ni
//    páginas, ni datos, ni la API (podrían quedar viejos o de otra sesión).
// 2) El resto de las peticiones pasa directo a la red, como antes. SU SOLA
//    PRESENCIA es además lo que Chrome/Android exige para ofrecer "Instalar
//    aplicación" de verdad (sin él, solo ofrece "Crear acceso directo", que
//    abre la app dentro de una pestaña normal con la barra del navegador).

const CACHE_IMAGENES = 'gymevo-imagenes-v1';
const RUTAS_IMAGENES = /^\/(explicaciones|ilustraciones|animaciones)\//;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Borra cachés de versiones anteriores de este mismo service worker.
      const nombres = await caches.keys();
      await Promise.all(nombres.filter((n) => n.startsWith('gymevo-imagenes-') && n !== CACHE_IMAGENES).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

async function imagenConCache(request) {
  const cache = await caches.open(CACHE_IMAGENES);
  const guardada = await cache.match(request);
  const red = fetch(request)
    .then((respuesta) => {
      if (respuesta && respuesta.ok) cache.put(request, respuesta.clone());
      return respuesta;
    })
    .catch(() => null);

  if (guardada) {
    // Se refresca en segundo plano; la persona ve la guardada de inmediato.
    red.catch(() => {});
    return guardada;
  }
  const respuesta = await red;
  return respuesta ?? Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method === 'GET' && url.origin === self.location.origin && RUTAS_IMAGENES.test(url.pathname)) {
    event.respondWith(imagenConCache(request));
    return;
  }
  event.respondWith(fetch(request));
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let datos;
  try {
    datos = event.data.json();
  } catch {
    datos = { titulo: 'GymEvoApp', cuerpo: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(datos.titulo ?? 'GymEvoApp', {
      body: datos.cuerpo,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: { url: datos.url ?? '/app' },
    })
  );
});

// Tocar la notificación lleva a "Plan de hoy" (o enfoca la pestaña si ya está abierta).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/app';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
