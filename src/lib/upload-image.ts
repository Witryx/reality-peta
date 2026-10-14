import { api } from "./api";
import type { Media } from "@/data/admin";

export const uploadBodyLimit = 3_500_000;
const sourceLimit = 12 * 1024 * 1024;

export async function prepareImageUpload(file: File): Promise<Blob> {
  if (file.size > sourceLimit) throw new Error(`${file.name}: maximální velikost je 12 MB.`);
  if (file.size <= uploadBodyLimit) return file;
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new Error(
        `${file.name}: fotografii se nepodařilo načíst. Použijte JPG, PNG, WebP nebo AVIF.`,
      );
    }
    if (image.naturalWidth * image.naturalHeight > 40_000_000)
      throw new Error(`${file.name}: fotografie může mít maximálně 40 megapixelů.`);
    const scale = Math.min(1, 2400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Prohlížeč nemůže připravit fotografii. Zkuste ji zmenšit před nahráním.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.72, 0.6]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
      if (blob && blob.size <= uploadBodyLimit) return blob;
    }
    throw new Error(
      `${file.name}: fotografii se nepodařilo dostatečně zmenšit. Nahrajte menší obrázek.`,
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function uploadImage(file: File): Promise<Media & { src: string }> {
  const body = await prepareImageUpload(file);
  return api(`/api/admin/media?name=${encodeURIComponent(file.name)}`, {
    method: "POST",
    body,
    headers: { "Content-Type": body.type || "application/octet-stream" },
  });
}
