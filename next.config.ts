import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // AGENTS.md es la copia intencional de CLAUDE.md que usa Codex — Next.js le
  // apendiza su propio bloque en cada `next dev` si esto no está apagado.
  agentRules: false,
};

export default nextConfig;
