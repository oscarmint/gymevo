// Service worker de notificaciones push. El handler de "fetch" de abajo es
// un simple paso-directo (no cachea nada, no cambia ninguna respuesta) — pero
// SU SOLA PRESENCIA es lo que Chrome/Android exige para ofrecer "Instalar
// aplicación" de verdad (sin él, solo ofrece "Crear acceso directo", que
// abre la app dentro de una pestaña normal con la barra del navegador visible
// — hallazgo real del usuario: la franja negra que veía era la barra de
// Chrome, no algo de GymEvo).
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let datos;
  try {
    datos = event.data.json();
  } catch {
    datos = { titulo: 'GymEvo', cuerpo: event.data.text() };
  }
  event.waitUntil(
    self.registration.showNotification(datos.titulo ?? 'GymEvo', {
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
