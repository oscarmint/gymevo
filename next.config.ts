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
};

export default nextConfig;
