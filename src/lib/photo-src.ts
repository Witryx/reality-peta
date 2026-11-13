/**
 * Uploaded photos are served watermarked from /uploads. Bump photoVersion whenever the
 * served look changes (watermark size, framing) so browsers fetch the new copies.
 * The server ignores the parameter; other images are used as they are.
 */
const photoVersion = 3;

export function photoUrl(src: string): string {
  if (!src.startsWith("/uploads/")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}v=${photoVersion}`;
}

export function photoAt(src: string, width: 480 | 960 | 1600): string {
  return src.startsWith("/uploads/") ? photoUrl(`${src}?w=${width}`) : src;
}

export function photoSrcSet(src: string, widths: (480 | 960 | 1600)[]): string | undefined {
  if (!src.startsWith("/uploads/")) return undefined;
  return widths.map((width) => `${photoAt(src, width)} ${width}w`).join(", ");
}
