import type { MetadataRoute } from "next";

const BASE = "https://www.gymevoapp.com";

// Fecha del último cambio REAL de cada página (no "ahora"): si lastmod cambia en
// cada visita sin que cambie el contenido, Google deja de fiarse de ese dato.
// Actualiza la fecha de una ruta solo cuando su contenido cambie de verdad.
const PAGINAS: { ruta: string; modificada: string }[] = [
  { ruta: "", modificada: "2026-10-07" },
  { ruta: "/privacidad", modificada: "2026-09-26" },
  { ruta: "/terminos", modificada: "2026-09-26" },
  { ruta: "/reembolsos", modificada: "2026-09-26" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS.map(({ ruta, modificada }) => ({
    url: `${BASE}${ruta}`,
    lastModified: new Date(modificada),
    changeFrequency: ruta === "" ? "weekly" : "yearly",
    priority: ruta === "" ? 1 : 0.3,
  }));
}
