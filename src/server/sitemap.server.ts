import { site } from "@/config/site";

/** Public pages that always exist; listings and articles are added from the database. */
const staticPaths = [
  "/",
  "/nabidka",
  "/sluzby",
  "/egypt",
  "/o-mne",
  "/reference",
  "/clanky",
  "/nabidka-spoluprace",
  "/kontakt",
  "/odhad-ceny",
];

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Builds sitemap.xml so search engines find every listing and article without waiting. */
export async function renderSitemap(request: Request): Promise<Response> {
  const origin = site.url || new URL(request.url).origin;
  const entries: { path: string; lastmod?: string }[] = staticPaths.map((path) => ({ path }));
  try {
    const { getDatabase, hasDatabase } = await import("./database.server");
    if (hasDatabase()) {
      const db = await getDatabase();
      const [{ publicProperties }, { publicArticles }] = await Promise.all([
        import("./properties.server"),
        import("./articles.server"),
      ]);
      for (const property of await publicProperties(db))
        entries.push({ path: `/nabidka/${property.slug}`, lastmod: property.publishedAt });
      for (const article of await publicArticles(db))
        entries.push({ path: `/clanky/${article.slug}`, lastmod: article.updatedAt });
    }
  } catch (error) {
    // The fixed pages are still worth listing if the database is briefly unavailable.
    console.error(error);
  }
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(({ path, lastmod }) => {
      const date = lastmod && /^\d{4}-\d{2}-\d{2}/.test(lastmod) ? lastmod.slice(0, 10) : "";
      return `  <url><loc>${escapeXml(new URL(path, origin).href)}</loc>${date ? `<lastmod>${date}</lastmod>` : ""}</url>`;
    }),
    "</urlset>",
  ].join("\n");
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
