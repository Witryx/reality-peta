// @vitest-environment node
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { embeddedAdapter, migrate, provisionAppRole, type Database } from "./database.server";
import { handleApi } from "./api.server";
import { hashToken } from "./security.server";
import { imageStorage } from "./media-storage.server";
import { verifyHostedMedia } from "../../scripts/verify-media";

let db: Database;
let directory: string;
let bytes: Uint8Array;
const origin = "https://media.example.invalid";
const token = "f".repeat(64);
beforeAll(async () => {
  db = embeddedAdapter(new PGlite());
  await migrate(db);
  await provisionAppRole(db, "a".repeat(64));
  const adminId = randomUUID();
  await db.query(
    "INSERT INTO admins(id,email,name,password_hash) VALUES ($1,'media@example.invalid','Media','unused')",
    [adminId],
  );
  await db.query(
    "INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES ($1,$2,now()+interval '1 hour')",
    [hashToken(token), adminId],
  );
  directory = await mkdtemp(path.join(os.tmpdir(), "realty-media-"));
  await writeFile(path.join(directory, "not-a-directory"), "blocked");
  bytes = new Uint8Array(
    await sharp({ create: { width: 80, height: 60, channels: 3, background: "#dd1111" } })
      .png()
      .toBuffer(),
  );
}, 30000);
afterEach(async () => {
  await db.query("RESET ROLE");
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
afterAll(async () => {
  await db.close();
  await rm(directory, { recursive: true, force: true });
});
function hosted() {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("APP_URL", origin);
  vi.stubEnv("UPLOAD_DIR", path.join(directory, "not-a-directory", "uploads"));
  vi.stubEnv("MEDIA_STORAGE", "disk"); // Vercel must always avoid its instance filesystem.
}
async function request(
  endpoint: string,
  method = "GET",
  data?: Uint8Array | string,
  authenticated = true,
) {
  return (await handleApi(
    new Request(origin + endpoint, {
      method,
      headers: {
        origin,
        ...(authenticated ? { cookie: `realty_session=${token}` } : {}),
        ...(typeof data === "string" ? { "content-type": "application/json" } : {}),
      },
      ...(data ? { body: data as BodyInit } : {}),
    }),
    db,
  ))!;
}
it("chooses durable hosted storage and preserves self-hosted disk defaults", () => {
  expect(imageStorage({})).toBe("disk");
  expect(imageStorage({ MEDIA_STORAGE: "database" })).toBe("database");
  expect(imageStorage({ VERCEL: "1", MEDIA_STORAGE: "disk" })).toBe("database");
});
it("verifies the deployment round trip as the runtime role without leaving test media", async () => {
  hosted();
  await db.query("SET ROLE realty_app");
  const before = await db.query("SELECT id FROM media");
  await verifyHostedMedia(db);
  expect(await db.query("SELECT id FROM media")).toEqual(before);
});
it("uploads as the restricted app role without writable disk, retains bytes and protects drafts", async () => {
  hosted();
  await db.query("SET ROLE realty_app");
  const response = await request("/api/admin/media?name=byt.png", "POST", bytes);
  expect(response.status).toBe(201);
  const media = await response.json();
  const stored = await db.query("SELECT content FROM media_files WHERE media_id=$1", [media.id]);
  expect(stored[0]!["content"].length).toBe(media.bytes);
  expect((await request(media.src, "GET", undefined, false)).status).toBe(401);
  const image = await request(media.src);
  expect(image.status).toBe(200);
  expect(image.headers.get("content-type")).toBe("image/webp");
  const imageBytes = new Uint8Array(await image.arrayBuffer());
  expect(await sharp(imageBytes).metadata()).toMatchObject({
    format: "webp",
    width: 80,
    height: 60,
  });
  expect(Array.from(imageBytes)).toEqual(Array.from(stored[0]!["content"]));
  expect((await request(media.src, "HEAD")).status).toBe(200);
  expect((await request(media.src, "HEAD")).body).toBeNull();
  await request(`/api/admin/media/${media.id}`, "DELETE", "{}");
  expect(
    await db.query("SELECT media_id FROM media_files WHERE media_id=$1", [media.id]),
  ).toHaveLength(0);
});
it("makes referenced images public and cascades deletion only after references are removed", async () => {
  hosted();
  const response = await request("/api/admin/media?name=web.png", "POST", bytes);
  const media = await response.json();
  await db.query("UPDATE website_content SET data=jsonb_build_object('image.home',$1::text)", [
    media.src,
  ]);
  expect((await request(media.src, "GET", undefined, false)).status).toBe(200);
  expect((await request(`/api/admin/media/${media.id}`, "DELETE", "{}")).status).toBe(409);
  await db.query("UPDATE website_content SET data='{}'::jsonb");
  expect((await request(`/api/admin/media/${media.id}`, "DELETE", "{}")).status).toBe(200);
  expect((await request(media.src, "GET", undefined, false)).status).toBe(404);
  expect(
    await db.query("SELECT media_id FROM media_files WHERE media_id=$1", [media.id]),
  ).toHaveLength(0);
});
it("rolls back metadata when writing the actual image fails", async () => {
  hosted();
  vi.spyOn(console, "error").mockImplementation(() => {});
  const before = await db.query("SELECT id FROM media");
  await db.query("ALTER TABLE media_files ADD CONSTRAINT fail_probe CHECK (false) NOT VALID");
  try {
    expect((await request("/api/admin/media?name=failure.png", "POST", bytes)).status).toBe(500);
    expect(await db.query("SELECT id FROM media")).toEqual(before);
  } finally {
    await db.query("ALTER TABLE media_files DROP CONSTRAINT fail_probe");
  }
});
