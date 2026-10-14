import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Article, AdminArticle } from "@/data/article-types";
import type { Database } from "./database.server";
import { HttpError } from "./security.server";
import { audit } from "./properties.server";
import { uploadImagePattern } from "@/data/website-images";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }, "Zadejte platné datum.");
const text = z.string().trim().min(1).max(10000);
const articleSchema = z
  .object({
    slug: z
      .string()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().trim().min(2).max(250),
    category: z.string().trim().min(1).max(100),
    excerpt: z.string().trim().min(1).max(2000),
    readingMinutes: z.number().int().min(1).max(120),
    updatedAt: date,
    sections: z
      .array(
        z
          .object({
            heading: z.string().trim().max(250).optional(),
            paragraphs: z.array(text).max(100).optional(),
            bullets: z.array(text).max(100).optional(),
          })
          .strict()
          .refine(
            (section) => !!(section.paragraphs?.length || section.bullets?.length),
            "Doplňte obsah sekce.",
          ),
      )
      .min(1)
      .max(50),
    image: z
      .object({ src: z.string().regex(uploadImagePattern), alt: z.string().trim().min(1).max(500) })
      .strict()
      .optional(),
    publication: z.enum(["draft", "published", "archived"]),
    version: z.number().int().positive().optional(),
  })
  .strict();

export async function publicArticles(db: Database): Promise<Article[]> {
  const rows = await db.query<{ data: Article }>(
    "SELECT data FROM articles WHERE publication='published' ORDER BY data->>'updatedAt' DESC, created_at DESC",
  );
  return rows.map((row) => row.data);
}
export type ArticleRow = {
  data: Article;
  id: string;
  publication: AdminArticle["publication"];
  version: number;
};
export function adminArticle(row: ArticleRow): AdminArticle {
  return { ...row.data, id: row.id, publication: row.publication, version: row.version };
}
export async function saveArticle(db: Database, adminId: string, input: unknown, id?: string) {
  const parsed = articleSchema.safeParse(input);
  if (!parsed.success)
    throw new HttpError(
      422,
      "Zkontrolujte název, URL, datum a obsah článku. Každá sekce musí mít alespoň jeden odstavec nebo bod.",
    );
  const { publication, version, ...data } = parsed.data;
  if (id && !version) throw new HttpError(422, "Chybí verze článku.");
  if (JSON.stringify(data).length > 120000) throw new HttpError(422, "Článek je příliš dlouhý.");
  return db.transaction(async (tx) => {
    if (data.image) {
      const [media] = await tx.query("SELECT id FROM media WHERE filename=$1 FOR UPDATE", [
        data.image.src.slice("/uploads/".length),
      ]);
      if (!media)
        throw new HttpError(
          422,
          "Fotografie už není v knihovně. Vyberte jinou nebo ji nahrajte znovu.",
        );
    }
    const articleId = id ?? randomUUID();
    const [row] = id
      ? await tx.query<ArticleRow>(
          "UPDATE articles SET slug=$1,publication=$2,data=$3::jsonb,version=version+1,updated_at=now() WHERE id=$4 AND version=$5 RETURNING *",
          [data.slug, publication, JSON.stringify(data), id, version],
        )
      : await tx.query<ArticleRow>(
          "INSERT INTO articles(id,slug,publication,data) VALUES ($1,$2,$3,$4::jsonb) RETURNING *",
          [articleId, data.slug, publication, JSON.stringify(data)],
        );
    if (!row)
      throw new HttpError(
        409,
        "Článek mezitím upravil jiný správce. Změny zůstaly v editoru; načtěte aktuální článek před dalším uložením.",
      );
    await audit(tx, adminId, id ? "article.update" : "article.create", articleId);
    return adminArticle(row);
  });
}
