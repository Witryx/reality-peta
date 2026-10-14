import type { Property } from "@/data/types";

/** Convert pasted sharing links to a privacy-enhanced player URL. */
export function normalizeVideoUrl(value: string): string | null {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname;
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(host)
    ) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)\/?$/)?.[1] ?? null;
    } else if (host === "player.vimeo.com" && /^\/video\/\d+\/?$/.test(url.pathname)) {
      return url.href;
    }
    if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}

export function propertyMap(p: Pick<Property, "location" | "market">) {
  const { lat, lng, street, district, city } = p.location;
  const address = [street, district, city].filter(Boolean).join(", ");
  const precise =
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng);
  const query = precise
    ? `${lat},${lng}`
    : [address, p.market === "egypt" ? "Egypt" : "Česko"].join(", ");
  return {
    address,
    precise,
    available: precise || Boolean(address),
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${precise || street ? 16 : 13}&output=embed`,
    externalUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
  };
}
