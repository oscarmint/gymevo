import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="es" className={`${instrumentSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
