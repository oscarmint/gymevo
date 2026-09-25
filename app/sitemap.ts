import type { MetadataRoute } from "next";

const BASE = "https://www.gymevoapp.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return ["", "/privacidad", "/terminos", "/reembolsos"].map((ruta) => ({
    url: `${BASE}${ruta}`,
    lastModified: ahora,
    changeFrequency: ruta === "" ? "weekly" : "yearly",
    priority: ruta === "" ? 1 : 0.3,
  }));
}
