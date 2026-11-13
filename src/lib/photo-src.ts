/** Uploaded photos can be served smaller; other images are used as they are. */
export function photoAt(src: string, width: 480 | 960 | 1600): string {
  return src.startsWith("/uploads/") ? `${src}?w=${width}` : src;
}

export function photoSrcSet(src: string, widths: (480 | 960 | 1600)[]): string | undefined {
  if (!src.startsWith("/uploads/")) return undefined;
  return widths.map((width) => `${src}?w=${width} ${width}w`).join(", ");
}
