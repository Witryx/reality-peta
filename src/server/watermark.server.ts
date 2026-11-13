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
  if (width < 360 || height < 240) return bytes;
  const markWidth = Math.round(Math.min(width * (width < 800 ? 0.12 : 0.1), 300));
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
 * Brings a listing photo to the same 4:3 frame the property cards use, so every
 * photo looks alike and the mark is never cropped away. Landscape photos are
 * trimmed from the centre; upright photos are kept whole on a softly blurred
 * fill of themselves, so no part of the room is lost.
 */
export async function toListingFrame(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array<ArrayBuffer>> {
  const { width = 0, height = 0 } = await sharp(bytes, {
    limitInputPixels: 40_000_000,
    animated: false,
  }).metadata();
  if (!width || !height) return bytes;
  const ratio = width / height;
  const target = 4 / 3;
  if (Math.abs(ratio - target) < 0.02) return bytes;
  if (ratio >= 1) {
    const frameWidth = ratio > target ? Math.round(height * target) : width;
    const frameHeight = ratio > target ? height : Math.round(width / target);
    const framed = await sharp(bytes, { limitInputPixels: 40_000_000, animated: false })
      .resize({ width: frameWidth, height: frameHeight, fit: "cover", position: "centre" })
      .webp({ quality: 90 })
      .toBuffer();
    return new Uint8Array(framed);
  }
  const frameHeight = height;
  const frameWidth = Math.round(height * target);
  const fill = await sharp(bytes, { limitInputPixels: 40_000_000, animated: false })
    .resize({ width: frameWidth, height: frameHeight, fit: "cover" })
    .blur(40)
    .modulate({ brightness: 0.85 })
    .toBuffer();
  const framed = await sharp(fill)
    .composite([{ input: Buffer.from(bytes), gravity: "centre" }])
    .webp({ quality: 90 })
    .toBuffer();
  return new Uint8Array(framed);
}

/**
 * Listing, article and site photographs get the mark; portraits do not.
 * The home photo is cropped from the right, so its mark sits bottom-left.
 */
export function watermarkSide(
  references: { kind: unknown; key: unknown }[],
): "left" | "right" | null {
  const marked = references.filter(
    (reference) =>
      reference.kind === "listing" ||
      reference.kind === "article" ||
      (reference.kind === "website" && !/portrait/i.test(String(reference.key ?? ""))),
  );
  if (!marked.length) return null;
  return marked.some((reference) => reference.key === "image.home") ? "left" : "right";
}

export function isListingPhoto(references: { kind: unknown }[]) {
  return references.some((reference) => reference.kind === "listing");
}

/** Widths the site may ask for; anything else falls back to the full photo. */
export const photoWidths = [480, 960, 1600] as const;

export function requestedWidth(value: string | null): number | null {
  const width = Number(value);
  return (photoWidths as readonly number[]).includes(width) ? width : null;
}

/** Bump when the mark or framing changes so stored copies are made afresh. */
export const variantVersion = "v3";

/** Frames (listings), shrinks (when asked) and marks one public photo. */
export async function preparePublicPhoto(
  bytes: Uint8Array<ArrayBuffer>,
  options: { listing: boolean; side: "left" | "right" | null; width: number | null },
): Promise<Uint8Array<ArrayBuffer>> {
  let photo = bytes;
  if (options.listing) photo = await toListingFrame(photo);
  if (options.width) {
    const shrunk = await sharp(photo, { limitInputPixels: 40_000_000, animated: false })
      .resize({ width: options.width, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    photo = new Uint8Array(shrunk);
  }
  if (options.side) photo = await applyWatermark(photo, options.side);
  return photo;
}
