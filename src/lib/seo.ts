import { site, resolveSiteConfig } from "@/config/site";
import { resolveCopy } from "./site-copy";

// A public, absolute JPEG URL lets crawlers use our own card before running JavaScript.
export function socialImageMeta(values: Record<string, string> = {}) {
  const current = resolveSiteConfig(values);
  const image = new URL("/social-preview-v1.jpg", site.url || `https://${site.domain}`).href;
  const alt = `${current.agentName} reality – ${current.claim}`;
  return [
    { property: "og:image", content: image },
    { property: "og:image:type", content: "image/jpeg" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: alt },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: alt },
  ];
}

export function websiteValues(
  matches: readonly { id: string; loaderData?: unknown }[],
): Record<string, string> {
  const data = matches.find((match) => match.id === "__root__")?.loaderData;
  if (!data || typeof data !== "object" || !("values" in data)) return {};
  return data.values as Record<string, string>;
}

export function pageHead(
  opts: { title: string; description: string; path: string; type?: string },
  values: Record<string, string> = {},
) {
  const current = resolveSiteConfig(values);
  const name = current.name;
  const sourceTitle = resolveCopy(values, opts.title)
    .replace(site.name, name)
    .replace(site.claim, current.claim);
  const title = sourceTitle.includes(name) ? sourceTitle : `${sourceTitle} | ${name}`;
  const description = resolveCopy(values, opts.description);
  const url = site.url ? new URL(opts.path, site.url).href : opts.path;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: opts.type ?? "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function agentJsonLd(values: Record<string, string> = {}) {
  const site = resolveSiteConfig(values);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: site.name,
    slogan: site.claim,
    areaServed: site.region,
    founder: { "@type": "Person", name: site.agentName },
    ...(site.url ? { url: site.url } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(site.contact.email ? { email: site.contact.email } : {}),
  };
}
