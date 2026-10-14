// @vitest-environment node
import { afterAll, beforeAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { embeddedAdapter, migrate, type Database } from "./database.server";
import { hashToken } from "./security.server";
import { publicArticles } from "./articles.server";
import { handleApi } from "./api.server";
import { defaultArticles } from "../data/articles.defaults";
import { copyKey } from "../lib/site-copy";

let db: Database;
let directory: string;
let photo: { id: string; src: string };
const origin = "http://localhost:3015";
const session = "a".repeat(64);
async function request(endpoint: string, method = "GET", body?: unknown, authenticated = false) {
  return (await handleApi(
    new Request(origin + endpoint, {
      method,
      headers: {
        origin,
        ...(authenticated ? { cookie: `realty_session=${session}` } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
    db,
  ))!;
}
beforeAll(async () => {
  db = embeddedAdapter(new PGlite());
  await migrate(db);
  await db.query("DROP TABLE articles");
  await db.query("DELETE FROM schema_migrations WHERE version='articles-seed-v1'");
  directory = await mkdtemp(path.join(os.tmpdir(), "realty-upgrade-"));
  process.env["UPLOAD_DIR"] = directory;
  process.env["APP_URL"] = origin;
  const adminId = randomUUID();
  await db.query(
    "INSERT INTO admins(id,email,name,password_hash) VALUES ($1,'upgrade@example.invalid','Upgrade','unused')",
    [adminId],
  );
  await db.query(
    "INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES ($1,$2,now()+interval '1 hour')",
    [hashToken(session), adminId],
  );
  await db.query("UPDATE website_content SET data=$1::jsonb", [
    JSON.stringify({ [copyKey(defaultArticles[0]!.title)]: "Dosavadní upravený článek" }),
  ]);
}, 30000);
afterAll(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
  delete process.env["UPLOAD_DIR"];
  delete process.env["APP_URL"];
});

it("keeps original public articles and text overrides available before the new schema exists", async () => {
  const articles = await publicArticles(db);
  expect(articles).toHaveLength(5);
  expect(articles[0]!.title).toBe("Dosavadní upravený článek");
  expect((await request("/api/admin/articles", "GET", undefined, true)).status).toBe(503);
  expect((await request("/api/admin/session", "GET", undefined, true)).status).toBe(200);
  expect((await request("/api/admin/export", "GET", undefined, true)).status).toBe(200);
});
it("continues uploading and serving existing property photos without the articles table", async () => {
  const bytes = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#f7a501" },
  })
    .png()
    .toBuffer();
  const response = (await handleApi(
    new Request(origin + "/api/admin/media?name=existing.png", {
      method: "POST",
      headers: { origin, cookie: `realty_session=${session}`, "content-type": "image/png" },
      body: new Uint8Array(bytes),
    }),
    db,
  ))!;
  expect(response.status).toBe(201);
  photo = await response.json();
  expect((await request(photo.src)).status).toBe(401);
  expect((await request(photo.src, "GET", undefined, true)).status).toBe(200);
  const propertyId = randomUUID();
  await db.query(
    "INSERT INTO properties(id,slug,publication,data) VALUES ($1,'existing-property','published',$2::jsonb)",
    [propertyId, JSON.stringify({ publishedAt: "2020-01-01", images: [{ src: photo.src }] })],
  );
  expect((await request(photo.src)).status).toBe(200);
  expect((await request(`/api/admin/media/${photo.id}`, "DELETE", {}, true)).status).toBe(409);
  await db.query("DELETE FROM properties WHERE id=$1", [propertyId]);
});
it("supports website photo overrides and protects their references on the existing schema", async () => {
  const [website] = await db.query<{ data: Record<string, string> }>(
    "SELECT data FROM website_content WHERE id='main'",
  );
  await db.query("UPDATE website_content SET data=$1::jsonb", [
    JSON.stringify({ ...website!.data, "image.home": photo.src }),
  ]);
  expect((await request(photo.src)).status).toBe(200);
  expect((await request(`/api/admin/media/${photo.id}`, "DELETE", {}, true)).status).toBe(409);
  await db.query("UPDATE website_content SET data=data-'image.home'");
  expect((await request(photo.src)).status).toBe(401);
  expect((await request(`/api/admin/media/${photo.id}`, "DELETE", {}, true)).status).toBe(200);
});
it("moves original articles and overrides into the new table when the upgrade runs", async () => {
  await migrate(db);
  expect(
    (await publicArticles(db)).find((article) => article.slug === defaultArticles[0]!.slug)?.title,
  ).toBe("Dosavadní upravený článek");
  expect((await request("/api/admin/articles", "GET", undefined, true)).status).toBe(200);
});
