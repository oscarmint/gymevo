// Service worker de notificaciones push — SOLO recibe y muestra el aviso de
// "llevas 2 días sin entrenar"; no cachea nada ni intercepta fetch (evita
// cualquier efecto secundario sobre el resto de la app).

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
