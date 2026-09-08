import type { MetadataRoute } from 'next';

// Ícono + fondo que el celular usa al abrir GymEvo desde el acceso directo de
// la pantalla de inicio (Android) — antes no existía, así que Android caía al
// solo el trazo de la pesa (favicon), sin fondo ni el nombre debajo. iOS usa
// app/apple-icon.png para lo mismo (convención de archivo de Next.js, sin
// necesidad de declararlo aquí).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GymEvo',
    short_name: 'GymEvo',
    description: 'El entrenador que tu gimnasio te cobra pero nunca te da.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EEDA',
    theme_color: '#F5EEDA',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
