import type { Database } from "./database.server";
import type { WebsiteContent } from "@/lib/site-copy";
import { websiteFields as catalog } from "@/data/website-fields";
import { validateSiteOverrides } from "@/config/site";
import { z } from "zod";
import { HttpError } from "./security.server";
import { audit } from "./properties.server";
import { websiteImages, uploadImagePattern } from "@/data/website-images";
const validKeys = new Set([
  ...catalog.map((entry) => entry.key),
  ...websiteImages.flatMap((entry) => [entry.key, `${entry.key}.alt`]),
]);

export async function loadWebsiteContent(db: Database): Promise<WebsiteContent> {
  const [row] = await db.query<{ data: Record<string, string>; version: number }>(
    "SELECT data,version FROM website_content WHERE id='main'",
  );
  return {
    values: Object.fromEntries(
      Object.entries(row?.data ?? {}).filter(([key]) => validKeys.has(key)),
    ),
    version: row?.version ?? 1,
  };
}
export async function saveWebsiteContent(db: Database, adminId: string, input: unknown) {
  const parsed = z
    .object({ values: z.record(z.string().max(10000)), version: z.number().int().positive() })
    .strict()
    .safeParse(input);
  if (!parsed.success)
    throw new HttpError(422, "Zkontrolujte texty (maximálně 10 000 znaků v jednom poli).");
  if (Object.keys(parsed.data.values).some((key) => !validKeys.has(key)))
    throw new HttpError(422, "Obsahuje neznámé pole.");
  for (const image of websiteImages) {
    const src = parsed.data.values[image.key];
    if (src !== undefined && !uploadImagePattern.test(src))
      throw new HttpError(422, "Fotografii vyberte z knihovny nebo nahrajte nový obrázek.");
    const alt = parsed.data.values[`${image.key}.alt`];
    if (alt !== undefined && (!alt.trim() || alt.length > 500))
      throw new HttpError(422, "Popis fotografie musí mít 1–500 znaků.");
  }
  const configurationError = validateSiteOverrides(parsed.data.values);
  if (configurationError) throw new HttpError(422, configurationError);
  if (JSON.stringify(parsed.data.values).length > 120000)
    throw new HttpError(422, "Celkový obsah je příliš dlouhý.");
  return db.transaction(async (tx) => {
    const filenames = [
      ...new Set(
        websiteImages.flatMap((image) => {
          const src = parsed.data.values[image.key];
          return src ? [src.slice("/uploads/".length)] : [];
        }),
      ),
    ];
    if (filenames.length) {
      const media = await tx.query(
        "SELECT id FROM media WHERE filename = ANY($1::text[]) FOR UPDATE",
        [filenames],
      );
      if (media.length !== filenames.length)
        throw new HttpError(422, "Jedna z fotografií už není v knihovně. Vyberte ji znovu.");
    }
    const [row] = await tx.query<{ data: Record<string, string>; version: number }>(
      "UPDATE website_content SET data=$1::jsonb,version=version+1,updated_at=now() WHERE id='main' AND version=$2 RETURNING data,version",
      [JSON.stringify(parsed.data.values), parsed.data.version],
    );
    if (!row)
      throw new HttpError(
        409,
        "Texty mezitím upravil jiný správce. Změny zůstaly v editoru; načtěte aktuální obsah před dalším uložením.",
      );
    await audit(tx, adminId, "website.update", "main");
    return { values: row.data, version: row.version };
  });
}
