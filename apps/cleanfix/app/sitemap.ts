import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://kobipro-v2.vercel.app";
  const lastmod = new Date();

  const staticPaths = [
    "/",
    "/login",
    "/sign-up",
    "/dashboard",
    "/bookings",
    "/customers",
    "/staff",
    "/services",
    "/invoices",
    "/reports",
    "/settings",
    "/admin",
    "/customer-portal",
    "/employee",
  ];

  return staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: lastmod,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1.0 : 0.8,
  }));
}
