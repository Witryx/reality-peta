import sharp from "sharp";
import { watermarkPng } from "./watermark-image.server";

const markRatio = 187 / 651;

/**
 * Stamps the "Petr Pavlát reality" lockup into a bottom corner of a
 * public photograph. Stored originals stay untouched; only the served copy
 * carries the mark. Small images (thumbnails, icons) are returned unchanged.
 */
export async function applyWatermark(
  bytes: Uint8Array<ArrayBuffer>,
  side: "left" | "right" = "right",
): Promise<Uint8Array<ArrayBuffer>> {
  const image = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
  const { width = 0, height = 0 } = await image.metadata();
  if (width < 480 || height < 320) return bytes;
  const markWidth = Math.round(Math.min(width * 0.22, 640));
  const markHeight = Math.round(markWidth * markRatio);
  const margin = Math.round(width * 0.025);
  const mark = await sharp(watermarkPng).resize({ width: markWidth }).toBuffer();
  const stamped = await image
    .composite([
      {
        input: mark,
        left: side === "left" ? margin : width - markWidth - margin,
        top: height - markHeight - margin,
      },
    ])
    .webp({ quality: 85 })
    .toBuffer();
  return new Uint8Array(stamped);
}

/**
 * Listing and article photos and site photographs get the mark; portraits do not.
 * The home photo is cropped from the right, so its mark sits bottom-left.
 */
export function watermarkSide(
  references: { kind: unknown; key: unknown }[],
): "left" | "right" | null {
  const marked = references.filter(
    (reference) =>
      reference.kind === "listing" ||
      (reference.kind === "website" && !/portrait/i.test(String(reference.key ?? ""))),
  );
  if (!marked.length) return null;
  return marked.some((reference) => reference.key === "image.home") ? "left" : "right";
}
