// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { embeddedAdapter, migrate, provisionAppRole, type Database } from "./database.server";
import { handleApi } from "./api.server";
import { hashPassword } from "./security.server";
import { publicProperties } from "./properties.server";
import { loadWebsiteContent } from "./website.server";
import { copyKey } from "@/lib/site-copy";

describe("Self-hosted admin and public API", () => {
  let db: Database;
  let token: string;
  let propertyId: string;
  let uploadDir: string;
  const origin = "http://localhost:3000";
  const password = "test-password-only-1234";
  const draft = {
    title: "Testovací byt 3+kk",
    slug: "testovaci-byt",
    publication: "draft",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    market: "cz",
    disposition: "3+kk",
    location: { city: "Praha", district: "Vinohrady" },
    price: 7200000,
    area: 80,
    ownership: "Osobní",
    condition: "Dobrý",
    energyClass: "C",
    perex: "Světlý byt s balkonem.",
    description: ["Podrobný popis testovací nemovitosti."],
    features: ["Balkon"],
    images: [{ src: "https://example.com/photo.jpg", alt: "Interiér", position: 0 }],
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-01-01",
    isDemo: false,
    nearbyPlaces: [
      {
        category: "school",
        name: "Testovací základní škola",
        address: "Školní 1",
        distanceMeters: 350,
        distanceType: "walking",
      },
    ],
  };
  async function request(
    endpoint: string,
    method = "GET",
    data?: unknown,
    authenticated = false,
    customOrigin = origin,
  ) {
    const headers: Record<string, string> = { origin: customOrigin };
    if (authenticated) headers["cookie"] = token;
    if (data !== undefined) headers["content-type"] = "application/json";
    return (await handleApi(
      new Request(origin + endpoint, {
        method,
        headers,
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      }),
      db,
    ))!;
  }
  beforeAll(async () => {
    process.env["APP_URL"] = origin;
    db = embeddedAdapter(new PGlite());
    await migrate(db);
    await migrate(db);
    uploadDir = await mkdtemp(path.join(os.tmpdir(), "realty-api-"));
    process.env["UPLOAD_DIR"] = uploadDir;
    await db.query("INSERT INTO admins(id,email,name,password_hash) VALUES ($1,$2,$3,$4)", [
      randomUUID(),
      "admin@example.cz",
      "Test Správce",
      await hashPassword(password),
    ]);
  }, 30_000);
  afterAll(async () => {
    await db?.close();
    if (uploadDir) await rm(uploadDir, { recursive: true, force: true });
    delete process.env["UPLOAD_DIR"];
    delete process.env["APP_URL"];
  });

  it("rejects anonymous admin access and forged cross-site writes", async () => {
    expect((await request("/api/admin/properties")).status).toBe(401);
    expect((await request("/api/admin/website")).status).toBe(401);
    expect((await request("/api/admin/website", "PUT", { values: {}, version: 1 })).status).toBe(
      401,
    );
    expect(
      (
        await request(
          "/api/admin/login",
          "POST",
          { email: "admin@example.cz", password },
          false,
          "https://evil.example",
        )
      ).status,
    ).toBe(403);
  });
  it("logs in with an HttpOnly session; rejects incorrect passwords", async () => {
    expect(
      (await request("/api/admin/login", "POST", { email: "admin@example.cz", password: "wrong" }))
        .status,
    ).toBe(401);
    const response = await request("/api/admin/login", "POST", {
      email: "admin@example.cz",
      password,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=Strict");
    token = response.headers.get("set-cookie")!.split(";")[0]!;
  });
  it("persists drafts without exposing them; validates publication", async () => {
    const response = await request("/api/admin/properties", "POST", draft, true);
    expect(response.status).toBe(201);
    const p = await response.json();
    propertyId = p.id;
    expect(await publicProperties(db)).toEqual([]);
    expect(
      (
        await request(
          `/api/admin/properties/${propertyId}`,
          "PUT",
          { ...draft, version: 1, publication: "published", images: [] },
          true,
        )
      ).status,
    ).toBe(422);
  });
  it("persists public website text, checks Origin, prevents stale saves and restores defaults", async () => {
    const key = copyKey("Co bude váš");
    const input = { values: { [key]: "Váš nový domov" }, version: 1 };
    expect(
      (await request("/api/admin/website", "PUT", input, true, "https://evil.example")).status,
    ).toBe(403);
    const response = await request("/api/admin/website", "PUT", input, true);
    expect(response.status).toBe(200);
    expect(await loadWebsiteContent(db)).toEqual({ values: input.values, version: 2 });
    expect((await request("/api/admin/website", "PUT", input, true)).status).toBe(409);
    expect((await loadWebsiteContent(db)).values).toEqual(input.values);
    expect(
      (
        await request(
          "/api/admin/website",
          "PUT",
          { values: { "site.social.facebook": "javascript:alert(1)" }, version: 2 },
          true,
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await request(
          "/api/admin/website",
          "PUT",
          { values: { unknown: "Text" }, version: 2 },
          true,
        )
      ).status,
    ).toBe(422);
    expect(
      (
        await request(
          "/api/admin/website",
          "PUT",
          { values: { [key]: "x".repeat(10001) }, version: 2 },
          true,
        )
      ).status,
    ).toBe(422);
    expect(
      (await request("/api/admin/website", "PUT", { values: {}, version: 2 }, true)).status,
    ).toBe(200);
    expect(await loadWebsiteContent(db)).toEqual({ values: {}, version: 3 });
  });
  it("publishes persisted data and detects a stale concurrent edit", async () => {
    const response = await request(
      `/api/admin/properties/${propertyId}`,
      "PUT",
      { ...draft, version: 1, publication: "published" },
      true,
    );
    expect(response.status).toBe(200);
    expect((await response.json()).version).toBe(2);
    expect((await publicProperties(db))[0]?.id).toBe(propertyId);
    expect((await publicProperties(db))[0]?.nearbyPlaces).toEqual(draft.nearbyPlaces);
    expect(
      (await request(`/api/admin/properties/${propertyId}`, "PUT", { ...draft, version: 1 }, true))
        .status,
    ).toBe(409);
  });
  it("keeps future and Egypt offers out of the current Czech public list", async () => {
    expect(
      (
        await request(
          "/api/admin/properties",
          "POST",
          { ...draft, slug: "budouci-byt", publication: "published", publishedAt: "2099-01-01" },
          true,
        )
      ).status,
    ).toBe(201);
    expect((await publicProperties(db)).some((p) => p.slug === "budouci-byt")).toBe(false);
    await request(
      "/api/admin/properties",
      "POST",
      { ...draft, slug: "egypt-byt", publication: "published", market: "egypt" },
      true,
    );
    expect((await publicProperties(db)).filter((p) => p.market === "egypt")).toHaveLength(1);
  });
  it("rejects invalid nearby distances without changing saved property data", async () => {
    for (const distanceMeters of [-5, 1.5, null, 100001]) {
      const response = await request(
        "/api/admin/properties",
        "POST",
        {
          ...draft,
          slug: "neplatne-okoli",
          nearbyPlaces: [{ ...draft.nearbyPlaces[0], distanceMeters }],
        },
        true,
      );
      expect(response.status).toBe(422);
    }
    expect((await publicProperties(db)).find((p) => p.id === propertyId)?.nearbyPlaces).toEqual(
      draft.nearbyPlaces,
    );
  });
  it("saves actual leads and enforces insert-only public RLS", async () => {
    const response = await request("/api/leads", "POST", {
      kind: "contact",
      name: "Jan Novák",
      email: "jan@example.cz",
      message: "Mám zájem o spolupráci.",
      consent: true,
    });
    expect(response.status).toBe(201);
    expect(await db.query("SELECT * FROM leads")).toHaveLength(1);
    await expect(
      db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_anon");
        await tx.query("SELECT * FROM leads");
      }),
    ).rejects.toThrow();
    await expect(
      db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_anon");
        await tx.query("UPDATE leads SET name='x'");
      }),
    ).rejects.toThrow();
    expect(
      (
        await request("/api/leads", "POST", {
          kind: "contact",
          name: "Jan",
          email: "jan@example.cz",
          message: "Zpráva",
          consent: false,
        })
      ).status,
    ).toBe(422);
  });
  it("rejects spam and inquiries for unpublished or missing offers", async () => {
    expect(
      (
        await request("/api/leads", "POST", {
          kind: "contact",
          name: "Jan",
          email: "jan@example.cz",
          message: "Zpráva",
          consent: true,
          website: "spam",
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request("/api/leads", "POST", {
          kind: "property_inquiry",
          property_slug: "missing",
          name: "Jan",
          email: "jan@example.cz",
          consent: true,
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request("/api/leads", "POST", {
          kind: "property_inquiry",
          property_slug: "testovaci-byt",
          name: "Jan",
          email: "jan@example.cz",
          consent: true,
        })
      ).status,
    ).toBe(201);
  });
  it("updates lead workflow and prevents overwriting concurrent notes", async () => {
    const result = await (await request("/api/admin/leads", "GET", undefined, true)).json();
    const lead = result.items[0];
    const input = {
      status: "in_progress",
      notes: "Domluvena prohlídka.",
      updated_at: new Date(lead.updated_at).toISOString(),
    };
    expect((await request(`/api/admin/leads/${lead.id}`, "PUT", input, true)).status).toBe(200);
    expect((await request(`/api/admin/leads/${lead.id}`, "PUT", input, true)).status).toBe(409);
  });
  it("decodes real photos, stores WebP, protects draft media and rejects fake images", async () => {
    const photo = await sharp({
      create: { width: 40, height: 30, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    const response = (await handleApi(
      new Request(origin + "/api/admin/media?name=photo.png", {
        method: "POST",
        headers: { origin, cookie: token },
        body: new Uint8Array(photo),
      }),
      db,
    ))!;
    expect(response.status).toBe(201);
    const media = await response.json();
    expect(media.src).toMatch(/\.webp$/);
    expect((await request(media.src)).status).toBe(401);
    expect((await request(media.src, "GET", undefined, true)).headers.get("content-type")).toBe(
      "image/webp",
    );
    expect(
      (
        await handleApi(
          new Request(origin + "/api/admin/media", {
            method: "POST",
            headers: { origin, cookie: token },
            body: "<svg></svg>",
          }),
          db,
        )
      )?.status,
    ).toBe(422);
    await request(
      `/api/admin/properties/${propertyId}`,
      "PUT",
      {
        ...draft,
        version: 2,
        publication: "published",
        images: [{ src: media.src, alt: "Foto", position: 0 }],
      },
      true,
    );
    expect((await request(media.src)).status).toBe(200);
    expect((await request(`/api/admin/media/${media.id}`, "DELETE", {}, true)).status).toBe(409);
  });
  it("archives an offer immediately and revokes logout sessions", async () => {
    expect(
      (
        await request(
          `/api/admin/properties/${propertyId}`,
          "PUT",
          { ...draft, publication: "archived", version: 3 },
          true,
        )
      ).status,
    ).toBe(200);
    expect((await publicProperties(db)).some((p) => p.id === propertyId)).toBe(false);
    expect((await request("/api/admin/logout", "POST", {}, true)).status).toBe(200);
    expect((await request("/api/admin/session", "GET", undefined, true)).status).toBe(401);
  });
  it("provisions a non-superuser production role with the required grants and public RLS", async () => {
    await provisionAppRole(db, "a".repeat(64));
    const [role] = await db.query(
      "SELECT rolsuper,rolcreaterole,rolcreatedb FROM pg_roles WHERE rolname='realty_app'",
    );
    expect(role).toMatchObject({ rolsuper: false, rolcreaterole: false, rolcreatedb: false });
    await db.transaction(async (tx) => {
      await tx.query("SET LOCAL ROLE realty_app");
      expect((await tx.query("SELECT id FROM leads")).length).toBe(2);
      expect(await tx.query("SELECT id FROM website_content")).toHaveLength(1);
    });
    await expect(
      db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_app");
        await tx.query("CREATE TABLE prohibited(id int)");
      }),
    ).rejects.toThrow();
    await expect(
      db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_anon");
        await tx.query("DELETE FROM leads");
      }),
    ).rejects.toThrow();
    await expect(
      db.transaction(async (tx) => {
        await tx.query("SET LOCAL ROLE realty_anon");
        await tx.query("UPDATE website_content SET data='{}'::jsonb");
      }),
    ).rejects.toThrow();
  });
});
