import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.starworkforcesolutions.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/services",
          "/pricing",
          "/jobs",
          "/tools/ats-optimizer",
          "/tools/cover-letter",
          "/contact",
          "/faq",
          "/legal/terms",
          "/legal/privacy",
          "/legal/disclaimer",
        ],
        disallow: ["/dashboard/*", "/employer/dashboard/*", "/admin/*", "/api/*", "/auth/*", "/_next/*", "/static/*"],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/services",
          "/pricing",
          "/jobs",
          "/tools/ats-optimizer",
          "/tools/cover-letter",
          "/contact",
          "/faq",
          "/legal/terms",
          "/legal/privacy",
          "/legal/disclaimer",
        ],
        disallow: ["/dashboard/*", "/employer/dashboard/*", "/admin/*", "/api/*", "/auth/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
