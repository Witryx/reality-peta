import type { Database } from "./database.server";
import type { WebsiteContent } from "@/lib/site-copy";
import { websiteFields as catalog } from "@/data/website-fields";
import { validateSiteOverrides } from "@/config/site";
import { z } from "zod";
import { HttpError } from "./security.server";
import { audit } from "./properties.server";
const validKeys = new Set(catalog.map((entry) => entry.key));

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
  const configurationError = validateSiteOverrides(parsed.data.values);
  if (configurationError) throw new HttpError(422, configurationError);
  if (JSON.stringify(parsed.data.values).length > 120000)
    throw new HttpError(422, "Celkový obsah je příliš dlouhý.");
  return db.transaction(async (tx) => {
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
