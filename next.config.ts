import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // AGENTS.md es la copia intencional de CLAUDE.md que usa Codex — Next.js le
  // apendiza su propio bloque en cada `next dev` si esto no está apagado.
  agentRules: false,
  // El indicador de modo desarrollo (círculo "N") tapaba contenido real en
  // varios screenshots de revisión (nav inferior, bullets) — nunca aparece en
  // producción, pero mejor apagarlo para que las capturas de review sean fieles.
  devIndicators: false,
  // Calendario e Historial se fusionaron en Progreso (23/09/2026): los links
  // viejos (guardados, capturas, marcadores) siguen funcionando.
  // Cabeceras de seguridad básicas (auditoría 25/09/2026): la app con sesión y el panel no se pueden meter
  // en un iframe ajeno, el navegador no adivina tipos de archivo y no se filtra la
  // URL completa a otros sitios.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // Solo la app con sesión y el panel de administrador no se pueden meter en
      // un iframe ajeno. Landing, onboarding, login y paywall sí se pueden
      // mostrar dentro de herramientas de prueba con marco de celular.
      {
        source: "/:zona(app|admin|api)/:path*",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/favicon-48.png', permanent: false },
      { source: '/app/calendario', destination: '/app/progreso', permanent: false },
      { source: '/app/calendario/:fecha', destination: '/app/progreso?fecha=:fecha', permanent: false },
      { source: '/app/historial', destination: '/app/progreso?vista=evolucion', permanent: false },
    ];
  },
};

export default nextConfig;
