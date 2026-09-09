import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { RegistrarServiceWorker } from "@/components/RegistrarServiceWorker";
import "./globals.css";

// Tipografía redefinida 03/09/2026: dirección de arte nueva derivada del
// ebook del usuario (TRANSFORMACIÓN EN 90 DÍAS — ver FICHA-ARTE.md). Poppins
// es la familia real de los títulos/headings del ebook (geométrica, bold,
// terminales redondeadas) — se usa como única familia (patrón 1 de 29:
// UNA sola sans en varios pesos), igual que antes con Instrument Sans.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GymEvo — El entrenador que tu gimnasio te cobra pero nunca te da",
  description:
    "Plan fijo de gimnasio para principiantes e intermedios, con un Botón de Rescate para cuando la máquina está ocupada. Sin IA que te cambia la rutina, sin cobros ocultos.",
};

// viewportFit "cover" deja que la app dibuje detrás de la barra de gestos de
// Android (si no, esa franja queda reservada por el sistema en negro puro,
// sin que ningún color/padding de la app la alcance — franja negra reportada
// por el usuario bajo el menú inferior incluso ya instalada como app). Con
// esto, env(safe-area-inset-bottom) (ya usado en app/app/layout.tsx) empieza
// a devolver el alto real y el fondo del menú se extiende hasta el borde.
// themeColor es un string plano (genera <meta name="theme-color">, no CSS) —
// no puede tomar var(--bg): el hex mirrors --bg en tokens.css, igual que ya
// hace background_color/theme_color en app/manifest.ts para el mismo campo.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#12161c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
