import { afterEach, describe, expect, it, vi } from "vitest";
import { hasDatabase, migrationDatabaseUrl, postgresParameters } from "./database.server";

afterEach(() => vi.unstubAllEnvs());

describe("production database configuration", () => {
  it("passes JSON objects to Postgres.js so serialized documents are not encoded twice", () => {
    const doc = {
      title: 'Článek s citací "text"',
      updatedAt: "2026-10-14",
      sections: [{ paragraphs: ["Obsah"] }],
    };
    const connection = { json: (value: unknown) => ({ json: value }) };
    const parameters = postgresParameters(
      connection,
      "INSERT INTO articles(id,slug,data) VALUES ($1,$2,$3::jsonb)",
      ["article-id", "slug", JSON.stringify(doc)],
    );
    expect(parameters).toEqual(["article-id", "slug", { json: doc }]);
    expect(
      postgresParameters(connection, "UPDATE website_content SET data=$1::jsonb WHERE version=$2", [
        JSON.stringify({ "site.name": "Web" }),
        4,
      ]),
    ).toEqual([{ json: { "site.name": "Web" } }, 4]);
    expect(
      postgresParameters(connection, "SELECT filename FROM media WHERE filename=$1", [
        "photo.webp",
      ]),
    ).toEqual(["photo.webp"]);
  });
  it("uses separate migration credentials even when app credentials are configured", () => {
    expect(
      migrationDatabaseUrl({
        VERCEL: "1",
        NODE_ENV: "production",
        DATABASE_URL: "postgres://owner@example.invalid/db",
        APP_DATABASE_URL: "postgres://realty_app@example.invalid/db",
      }),
    ).toBe("postgres://owner@example.invalid/db");
  });
  it("does not migrate with app credentials or an embedded production database", () => {
    expect(() =>
      migrationDatabaseUrl({
        NODE_ENV: "production",
        APP_DATABASE_URL: "postgres://realty_app@example.invalid/db",
        LOCAL_DATABASE: "1",
      }),
    ).toThrow("DATABASE_URL");
    expect(migrationDatabaseUrl({ NODE_ENV: "development", LOCAL_DATABASE: "1" })).toBeUndefined();
  });
  it("does not use integration owner credentials for Vercel runtime", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("APP_DATABASE_URL", undefined);
    vi.stubEnv("DATABASE_URL", "postgres://owner@example.invalid/realty");
    vi.stubEnv("LOCAL_DATABASE", "1");
    expect(hasDatabase()).toBe(false);
  });

  it("accepts separate app credentials on Vercel", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("APP_DATABASE_URL", "postgres://realty_app@example.invalid/realty");
    vi.stubEnv("DATABASE_URL", undefined);
    expect(hasDatabase()).toBe(true);
  });

  it("keeps DATABASE_URL available for self-hosted production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL", undefined);
    vi.stubEnv("APP_DATABASE_URL", undefined);
    vi.stubEnv("DATABASE_URL", "postgres://realty_app@example.invalid/realty");
    expect(hasDatabase()).toBe(true);
  });
});
