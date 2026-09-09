'use client';

import { useEffect } from 'react';

/** Antes el service worker solo se registraba cuando alguien tocaba
 * "Activar" en Recordatorio de racha (Perfil) — la mayoría de usuarios
 * nunca llega ahí, así que Chrome/Android nunca veía un service worker
 * activo y por eso solo ofrecía "Crear acceso directo" (abre en una pestaña
 * normal con la barra del navegador) en vez de "Instalar aplicación" de
 * verdad (hallazgo real del usuario). Registrar acá, sin condición, en el
 * layout raíz, hace que esté presente desde la primera visita — el mismo
 * archivo /sw.js sigue sirviendo para las notificaciones push cuando el
 * usuario las active más tarde. */
export function RegistrarServiceWorker() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sin service worker la app sigue funcionando normal — solo se pierde
      // la opción de "Instalar aplicación" completa (queda como acceso
      // directo). No es un fallo que deba interrumpir nada más.
    });
  }, []);

  return null;
}
