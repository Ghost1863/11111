import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/medusa/plugins"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  let pluginSlugs: string[] = [];
  try {
    const { getAllPluginSlugs } = await import("@/lib/plugins");
    pluginSlugs = await getAllPluginSlugs();
  } catch (error) {
    console.error("Error fetching plugin slugs for sitemap:", error);
  }

  staticRoutes.forEach((route) => {
    sitemapEntries.push({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://gorgojs.com"}${route}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: route === "/" ? 1 : 0.8,
    });
  });

  pluginSlugs.forEach((slug) => {
    sitemapEntries.push({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://gorgojs.com"}/medusa/plugins/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return sitemapEntries;
}
