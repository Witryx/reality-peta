import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { Property } from "../data/types";
import type { AdminProperty } from "../data/admin";
import { getDatabase, type Database } from "./database.server";
import { propertySchema } from "./validation";
import { HttpError } from "./security.server";

export async function publicProperties(db?: Database): Promise<Property[]> {
  const rows = await (db ?? (await getDatabase())).query<{ data: Property }>(
    "SELECT data FROM properties WHERE publication='published' AND (data->>'publishedAt')::date <= (now() AT TIME ZONE 'Europe/Prague')::date ORDER BY (data->>'sortOrder')::int, created_at DESC",
  );
  return rows.map((r) => r.data);
}
export function adminProperty(row: Record<string, any>): AdminProperty {
  return {
    ...row["data"],
    publication: row["publication"],
    version: row["version"],
    createdAt: new Date(row["created_at"]).toISOString(),
    updatedAt: new Date(row["updated_at"]).toISOString(),
  };
}
export async function audit(db: Database, adminId: string, action: string, entityId: string) {
  await db.query("INSERT INTO audit_log(id,admin_id,action,entity_id) VALUES ($1,$2,$3,$4)", [
    randomUUID(),
    adminId,
    action,
    entityId,
  ]);
}
export async function saveProperty(db: Database, adminId: string, input: unknown, id?: string) {
  const parsed = propertySchema.safeParse(input);
  if (!parsed.success)
    throw new HttpError(422, parsed.error.issues.map((i) => i.message).join(" "));
  const { publication, version, autoSlug, ...fields } = parsed.data;
  const propertyId = id ?? randomUUID();
  const data = JSON.parse(
    JSON.stringify({
      ...fields,
      id: propertyId,
      ...(fields.shareKey || fields.status === "upcoming"
        ? { shareKey: fields.shareKey ?? randomBytes(18).toString("base64url") }
        : {}),
      features: fields.features.filter(Boolean),
      description: fields.description.filter(Boolean),
      images: fields.images.map((image, i) => ({ ...image, position: i })),
    }),
  ) as Property;
  if (id && !version) throw new HttpError(422, "Chybí verze nabídky.");
  // Retry a concurrent automatic URL allocation after the unique constraint wins.
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.transaction(async (tx) => {
        if (autoSlug) {
          const base = fields.slug.replace(/-+$/, "");
          const taken = await tx.query<{ slug: string }>(
            "SELECT slug FROM properties WHERE (slug=$1 OR slug LIKE $2) AND id<>$3",
            [base, `${base.slice(0, 190)}%`, propertyId],
          );
          const slugs = new Set(taken.map((row) => row.slug));
          let slug = base;
          for (let suffix = 2; slugs.has(slug); suffix++) {
            const ending = `-${suffix}`;
            slug = `${base.slice(0, 200 - ending.length).replace(/-+$/, "")}${ending}`;
          }
          data.slug = slug;
        }
        const filenames = [
          ...new Set(
            data.images
              .filter((im) => im.src.startsWith("/uploads/"))
              .map((im) => im.src.slice("/uploads/".length)),
          ),
        ];
        if (filenames.length) {
          const media = await tx.query(
            "SELECT id FROM media WHERE filename = ANY($1::text[]) FOR UPDATE",
            [filenames],
          );
          if (media.length !== filenames.length)
            throw new HttpError(
              422,
              "Jedna z fotografií už není v knihovně. Odeberte ji z galerie nebo ji znovu nahrajte.",
            );
        }
        // Remember when the listing became sold: the newest sale leads the sold list and
        // stays on the homepage for 30 days. Kept while it stays sold, cleared otherwise.
        const [previous] = id
          ? await tx.query<{ status: string | null; sold_at: string | null }>(
              "SELECT data->>'status' AS status, data->>'soldAt' AS sold_at FROM properties WHERE id=$1",
              [id],
            )
          : [];
        if (data.status === "sold")
          data.soldAt =
            previous?.status === "sold" && previous.sold_at
              ? previous.sold_at
              : new Date().toISOString();
        else delete data.soldAt;
        const [row] = id
          ? await tx.query(
              "UPDATE properties SET slug=$1,publication=$2,data=$3::jsonb,version=version+1,updated_at=now() WHERE id=$4 AND version=$5 RETURNING *",
              [data.slug, publication, JSON.stringify(data), id, version],
            )
          : await tx.query(
              "INSERT INTO properties(id,slug,publication,data) VALUES ($1,$2,$3,$4::jsonb) RETURNING *",
              [propertyId, data.slug, publication, JSON.stringify(data)],
            );
        if (!row)
          throw new HttpError(
            409,
            "Nabídku mezitím změnil jiný správce. Obnovte ji před dalším uložením.",
          );
        await audit(tx, adminId, id ? "property.update" : "property.create", propertyId);
        return adminProperty(row);
      });
    } catch (error) {
      if (
        autoSlug &&
        attempt < 4 &&
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      )
        continue;
      throw error;
    }
  }
}

/** Public copy: never exposes shareKey; „Připravuji“ listings become a teaser without price or text. */
export function publicView(p: Property): Property {
  const { shareKey: _secret, ...rest } = p;
  if (p.status !== "upcoming") return rest;
  const cover = [...p.images].sort((a, b) => a.position - b.position)[0];
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    status: p.status,
    offerType: p.offerType,
    propertyType: p.propertyType,
    disposition: p.disposition,
    location: { city: p.location.city, district: p.location.district },
    market: p.market ?? "cz",
    price: null,
    area: p.area,
    ...(p.landArea ? { landArea: p.landArea } : {}),
    ownership: "",
    condition: "",
    energyClass: "",
    perex: "",
    description: [],
    features: [],
    images: cover ? [{ ...cover, position: 0 }] : [],
    featured: p.featured,
    sortOrder: p.sortOrder,
    publishedAt: p.publishedAt,
    isDemo: p.isDemo,
  };
}

/** Full „Připravuji“ listing for someone holding its share link; null for a wrong key. */
export function sharedView(properties: Property[], slug: string, key: string): Property | null {
  const p = properties.find((x) => x.slug === slug && x.status === "upcoming");
  if (!p?.shareKey || !key) return null;
  const a = Buffer.from(p.shareKey);
  const b = Buffer.from(key);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const { shareKey: _secret, ...rest } = p;
  return rest;
}
