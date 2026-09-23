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
  async redirects() {
    return [
      { source: '/app/calendario', destination: '/app/progreso', permanent: false },
      { source: '/app/calendario/:fecha', destination: '/app/progreso?fecha=:fecha', permanent: false },
      { source: '/app/historial', destination: '/app/progreso?vista=evolucion', permanent: false },
    ];
  },
};

export default nextConfig;
