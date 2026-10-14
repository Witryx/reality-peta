import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { getDatabase, hasDatabase, type Database } from "./database.server";
import {
  HttpError,
  checkOrigin,
  cookie,
  fakePasswordCheck,
  hashPassword,
  hashToken,
  rateLimit,
  requireAdmin,
  sessionToken,
  verifyPassword,
} from "./security.server";
import { adminProperty, audit, saveProperty } from "./properties.server";
import { leadSchema } from "./validation";
import { loadWebsiteContent, saveWebsiteContent } from "./website.server";
import { adminArticle, saveArticle, hasArticleTable, type ArticleRow } from "./articles.server";

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...headers },
  });
const uploads = () => path.resolve(process.env["UPLOAD_DIR"] || "uploads");
async function bodyBytes(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") || 0) > limit)
    throw new HttpError(413, "Soubor nebo požadavek je příliš velký.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Chybí obsah požadavku.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new HttpError(413, "Soubor nebo požadavek je příliš velký.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
async function body(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Očekávám JSON.");
  try {
    return JSON.parse((await bodyBytes(request, 256 * 1024)).toString("utf8"));
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, "Neplatný JSON.");
  }
}
const uuid = (value: string | undefined) => {
  if (!value || !z.string().uuid().safeParse(value).success)
    throw new HttpError(400, "Neplatné ID.");
  return value;
};
const ip = (request: Request) =>
  process.env["TRUST_PROXY"] === "1"
    ? request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown"
    : "local";

export async function handleApi(request: Request, suppliedDb?: Database): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/") && !url.pathname.startsWith("/uploads/")) return null;
  try {
    if (request.method !== "GET" && request.method !== "HEAD") checkOrigin(request);
    if (!suppliedDb && !hasDatabase())
      throw new HttpError(503, "Databáze není připravena. Postup je v README.md.");
    const db = suppliedDb ?? (await getDatabase());
    if (url.pathname === "/api/health" && request.method === "GET") {
      await db.query("SELECT 1 FROM schema_migrations WHERE version='selfhost-v1'");
      return json({ ok: true, articlesReady: await hasArticleTable(db) });
    }
    if (url.pathname.startsWith("/uploads/") && ["GET", "HEAD"].includes(request.method)) {
      const filename = url.pathname.slice("/uploads/".length);
      if (!/^[a-f0-9-]{36}\.webp$/.test(filename))
        throw new HttpError(404, "Fotografie nenalezena.");
      const [media] = await db.query("SELECT filename FROM media WHERE filename=$1", [filename]);
      if (!media) throw new HttpError(404, "Fotografie nenalezena.");
      const articleReferences = await hasArticleTable(db);
      const [published] = await db.query(
        `SELECT id FROM properties WHERE publication='published'
        AND (data->>'publishedAt')::date <= (now() AT TIME ZONE 'Europe/Prague')::date AND EXISTS
        (SELECT 1 FROM jsonb_array_elements(data->'images') image WHERE image->>'src'=$1)
        ${articleReferences ? "UNION ALL SELECT id FROM articles WHERE publication='published' AND data->'image'->>'src'=$1" : ""}
        UNION ALL SELECT NULL::uuid FROM website_content WHERE EXISTS
        (SELECT 1 FROM jsonb_each_text(data) entry WHERE entry.key LIKE 'image.%' AND entry.key NOT LIKE '%.alt' AND entry.value=$1)
        LIMIT 1`,
        [url.pathname],
      );
      if (!published) await requireAdmin(db, request);
      try {
        const bytes = await readFile(path.join(uploads(), filename));
        return new Response(request.method === "HEAD" ? null : bytes, {
          headers: {
            "Content-Type": "image/webp",
            "Cache-Control": "private, max-age=300",
            "X-Content-Type-Options": "nosniff",
          },
        });
      } catch {
        throw new HttpError(404, "Fotografie nenalezena.");
      }
    }
    if (url.pathname === "/api/leads" && request.method === "POST") {
      await rateLimit(db, `lead:${ip(request)}`, 10, 600);
      const parsed = leadSchema.safeParse(await body(request));
      if (!parsed.success) throw new HttpError(422, "Zkontrolujte vyplněné údaje a souhlas.");
      const d = parsed.data;
      if (d.website) throw new HttpError(422, "Formulář se nepodařilo odeslat.");
      if (d.kind === "property_inquiry") {
        const [p] = await db.query(
          "SELECT id FROM properties WHERE slug=$1 AND publication='published' AND (data->>'publishedAt')::date<=(now() AT TIME ZONE 'Europe/Prague')::date",
          [d.property_slug],
        );
        if (!p) throw new HttpError(422, "Tato nabídka už není dostupná.");
      }
      await db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_anon");
        await tx.query(
          `INSERT INTO leads(id,kind,name,email,phone,message,property_slug,property_type,property_location,property_size,consent)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true)`,
          [
            randomUUID(),
            d.kind,
            d.name,
            d.email,
            d.phone || null,
            d.message || null,
            d.property_slug || null,
            d.property_type || null,
            d.property_location || null,
            d.property_size || null,
          ],
        );
      });
      return json({ ok: true }, 201);
    }
    if (url.pathname === "/api/admin/login" && request.method === "POST") {
      await rateLimit(db, `login-ip:${ip(request)}`, 20, 900);
      const parsed = z
        .object({ email: z.string().trim().email().max(255), password: z.string().min(1).max(200) })
        .safeParse(await body(request));
      if (!parsed.success) throw new HttpError(422, "Vyplňte e-mail a heslo.");
      const email = parsed.data.email.toLowerCase();
      await rateLimit(db, `login-email:${email}`, 10, 900);
      const [admin] = await db.query("SELECT * FROM admins WHERE email=$1", [email]);
      const valid = admin
        ? await verifyPassword(parsed.data.password, admin["password_hash"])
        : (await fakePasswordCheck(parsed.data.password), false);
      if (!valid || !admin) throw new HttpError(401, "Nesprávný e-mail nebo heslo.");
      const token = randomBytes(32).toString("hex");
      await db.transaction(async (tx) => {
        await tx.query("DELETE FROM admin_sessions WHERE expires_at<=now()");
        await tx.query("DELETE FROM rate_limits WHERE reset_at<=now()");
        await tx.query(
          "INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES ($1,$2,now()+interval '8 hours')",
          [hashToken(token), admin["id"]],
        );
        await audit(tx, admin["id"], "admin.login", admin["id"]);
      });
      return json({ admin: { id: admin["id"], name: admin["name"], email } }, 200, {
        "Set-Cookie": cookie(token),
      });
    }
    if (!url.pathname.startsWith("/api/admin/")) throw new HttpError(404, "Endpoint nenalezen.");
    const admin = await requireAdmin(db, request);
    const route = url.pathname.slice("/api/admin/".length).split("/");
    if (route[0] === "website" && !route[1]) {
      if (request.method === "GET") return json(await loadWebsiteContent(db));
      if (request.method === "PUT")
        return json(await saveWebsiteContent(db, admin.id, await body(request)));
    }
    if (route[0] === "session" && request.method === "GET") return json({ admin });
    if (route[0] === "articles") {
      if (!(await hasArticleTable(db)))
        throw new HttpError(
          503,
          "Správa článků čeká na aktualizaci databáze při nasazení. Stávající články zůstávají na webu dostupné.",
        );
      if (request.method === "GET" && !route[1])
        return json({
          items: (
            await db.query<ArticleRow>("SELECT * FROM articles ORDER BY updated_at DESC")
          ).map(adminArticle),
        });
      if (request.method === "POST" && !route[1])
        return json(await saveArticle(db, admin.id, await body(request)), 201);
      if (request.method === "PUT" && route[1])
        return json(await saveArticle(db, admin.id, await body(request), uuid(route[1])));
      if (request.method === "DELETE" && route[1]) {
        const id = uuid(route[1]);
        await db.transaction(async (tx) => {
          const [row] = await tx.query(
            "DELETE FROM articles WHERE id=$1 AND version=$2 RETURNING id",
            [id, Number(url.searchParams.get("version"))],
          );
          if (!row) throw new HttpError(409, "Článek se změnil. Obnovte seznam a zkuste to znovu.");
          await audit(tx, admin.id, "article.delete", id);
        });
        return json({ ok: true });
      }
    }
    if (route[0] === "logout" && request.method === "POST") {
      await db.query("DELETE FROM admin_sessions WHERE token_hash=$1", [
        hashToken(sessionToken(request)),
      ]);
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (route[0] === "password" && request.method === "POST") {
      await rateLimit(db, `password:${admin.id}`, 5, 900);
      const parsed = z
        .object({ current: z.string().min(1).max(200), next: z.string().min(12).max(200) })
        .safeParse(await body(request));
      if (!parsed.success) throw new HttpError(422, "Nové heslo musí mít alespoň 12 znaků.");
      const [account] = await db.query("SELECT password_hash FROM admins WHERE id=$1", [admin.id]);
      if (!account || !(await verifyPassword(parsed.data.current, account["password_hash"])))
        throw new HttpError(422, "Současné heslo není správné.");
      const passwordHash = await hashPassword(parsed.data.next);
      await db.transaction(async (tx) => {
        await tx.query("UPDATE admins SET password_hash=$1 WHERE id=$2", [passwordHash, admin.id]);
        await tx.query("DELETE FROM admin_sessions WHERE admin_id=$1", [admin.id]);
        await audit(tx, admin.id, "admin.password", admin.id);
      });
      return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (route[0] === "properties") {
      if (request.method === "GET")
        return json({
          items: (await db.query("SELECT * FROM properties ORDER BY updated_at DESC")).map(
            adminProperty,
          ),
        });
      if (request.method === "POST" && !route[1])
        return json(await saveProperty(db, admin.id, await body(request)), 201);
      if (request.method === "PUT" && route[1])
        return json(await saveProperty(db, admin.id, await body(request), uuid(route[1])));
      if (request.method === "DELETE" && route[1]) {
        const id = uuid(route[1]);
        await db.transaction(async (tx) => {
          const [deleted] = await tx.query(
            "DELETE FROM properties WHERE id=$1 AND version=$2 RETURNING id",
            [id, Number(url.searchParams.get("version"))],
          );
          if (!deleted)
            throw new HttpError(409, "Nabídka se změnila. Obnovte seznam a zkuste to znovu.");
          await audit(tx, admin.id, "property.delete", id);
        });
        return json({ ok: true });
      }
    }
    if (route[0] === "leads") {
      if (request.method === "GET")
        return json({ items: await db.query("SELECT * FROM leads ORDER BY created_at DESC") });
      const id = uuid(route[1]);
      if (request.method === "PUT") {
        const parsed = z
          .object({
            status: z.enum(["new", "contacted", "in_progress", "closed"]),
            notes: z.string().max(10000),
            updated_at: z.string().datetime(),
          })
          .safeParse(await body(request));
        if (!parsed.success) throw new HttpError(422, "Neplatný stav nebo poznámka.");
        const d = parsed.data;
        const row = await db.transaction(async (tx) => {
          const [lead] = await tx.query(
            "UPDATE leads SET status=$1,notes=$2,updated_at=now() WHERE id=$3 AND date_trunc('milliseconds',updated_at)=$4::timestamptz RETURNING *",
            [d.status, d.notes, id, d.updated_at],
          );
          if (!lead)
            throw new HttpError(409, "Poptávku mezitím změnil jiný správce. Obnovte seznam.");
          await audit(tx, admin.id, "lead.update", id);
          return lead;
        });
        return json(row);
      }
      if (request.method === "DELETE") {
        await db.transaction(async (tx) => {
          await tx.query("DELETE FROM leads WHERE id=$1", [id]);
          await audit(tx, admin.id, "lead.delete", id);
        });
        return json({ ok: true });
      }
    }
    if (route[0] === "media") {
      if (request.method === "GET")
        return json({ items: await db.query("SELECT * FROM media ORDER BY created_at DESC") });
      if (request.method === "POST") {
        await rateLimit(db, `upload:${admin.id}`, 100, 600);
        const bytes = await bodyBytes(request, 12 * 1024 * 1024);
        let image: Buffer;
        let width: number;
        let height: number;
        try {
          const processor = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
          const metadata = await processor.metadata();
          if (!metadata.format || !["jpeg", "png", "webp", "avif"].includes(metadata.format))
            throw new Error("format");
          const result = await processor
            .rotate()
            .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer({ resolveWithObject: true });
          image = result.data;
          width = result.info.width;
          height = result.info.height;
        } catch {
          throw new HttpError(
            422,
            "Nahrajte platnou JPG, PNG, WebP nebo AVIF fotografii (max. 12 MB a 40 megapixelů).",
          );
        }
        const id = randomUUID();
        const filename = `${id}.webp`;
        const originalName = (url.searchParams.get("name") || "Fotografie").slice(0, 200);
        await mkdir(uploads(), { recursive: true });
        await writeFile(path.join(uploads(), filename), image);
        try {
          const [record] = await db.query(
            "INSERT INTO media(id,filename,original_name,width,height,bytes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [id, filename, originalName, width, height, image.length],
          );
          return json({ ...record, src: `/uploads/${filename}` }, 201);
        } catch (e) {
          await unlink(path.join(uploads(), filename));
          throw e;
        }
      }
      if (request.method === "DELETE" && route[1]) {
        const id = uuid(route[1]);
        const media = await db.transaction(async (tx) => {
          const [record] = await tx.query("SELECT * FROM media WHERE id=$1 FOR UPDATE", [id]);
          if (!record) throw new HttpError(404, "Fotografie nenalezena.");
          const articleReferences = await hasArticleTable(tx);
          const [used] = await tx.query(
            `SELECT id FROM properties WHERE EXISTS (SELECT 1 FROM jsonb_array_elements(data->'images') image WHERE image->>'src'=$1)
            ${articleReferences ? "UNION ALL SELECT id FROM articles WHERE data->'image'->>'src'=$1" : ""}
            UNION ALL SELECT NULL::uuid FROM website_content WHERE EXISTS
            (SELECT 1 FROM jsonb_each_text(data) entry WHERE entry.key LIKE 'image.%' AND entry.key NOT LIKE '%.alt' AND entry.value=$1) LIMIT 1`,
            [`/uploads/${record["filename"]}`],
          );
          if (used)
            throw new HttpError(
              409,
              "Fotografie je použitá v nabídce, článku nebo na webu. Nejprve ji tam odeberte nebo nahraďte.",
            );
          await tx.query("DELETE FROM media WHERE id=$1", [id]);
          await audit(tx, admin.id, "media.delete", id);
          return record;
        });
        await unlink(path.join(uploads(), media["filename"])).catch(() => {});
        return json({ ok: true });
      }
    }
    if (route[0] === "export" && request.method === "GET")
      return json(
        {
          exportedAt: new Date().toISOString(),
          properties: (await db.query("SELECT * FROM properties")).map(adminProperty),
          articles: (await hasArticleTable(db))
            ? (await db.query<ArticleRow>("SELECT * FROM articles")).map(adminArticle)
            : [],
          leads: await db.query("SELECT * FROM leads"),
          media: await db.query("SELECT * FROM media"),
          websiteContent: await loadWebsiteContent(db),
        },
        200,
        { "Content-Disposition": 'attachment; filename="reality-export.json"' },
      );
    if (route[0] === "audit" && request.method === "GET")
      return json({
        items: await db.query(
          "SELECT l.*,a.name AS admin_name FROM audit_log l LEFT JOIN admins a ON a.id=l.admin_id ORDER BY l.created_at DESC LIMIT 100",
        ),
      });
    throw new HttpError(404, "Endpoint nenalezen.");
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error && typeof error === "object" && "code" in error && error.code === "23505")
      return json({ error: "Tato URL už existuje. Vyberte jinou." }, 409);
    console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
    return json(
      { error: "Operaci se nepodařilo dokončit. Zkontrolujte databázi nebo to zkuste znovu." },
      500,
    );
  }
}
