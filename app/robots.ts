import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app/", "/admin/", "/api/", "/login", "/paywall", "/onboarding"] }],
    sitemap: "https://www.gymevoapp.com/sitemap.xml",
  };
}
