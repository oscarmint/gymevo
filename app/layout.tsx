import type { Metadata } from "next";
import { Poppins } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
