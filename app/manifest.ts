import type { MetadataRoute } from 'next';

// Ícono + fondo que el celular usa al abrir GymEvo desde el acceso directo de
// la pantalla de inicio (Android) — antes no existía, así que Android caía al
// solo el trazo de la pesa (favicon), sin fondo ni el nombre debajo. iOS usa
// app/apple-icon.png para lo mismo (convención de archivo de Next.js, sin
// necesidad de declararlo aquí).
// background_color/theme_color en el oscuro real de la marca (#12161c) desde
// el rediseño del 03/09 — antes quedaban en el crema de la identidad vieja.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GymEvo',
    short_name: 'GymEvo',
    description: 'El entrenador que tu gimnasio te cobra pero nunca te da.',
    start_url: '/',
    display: 'standalone',
    background_color: '#12161c',
    theme_color: '#12161c',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
