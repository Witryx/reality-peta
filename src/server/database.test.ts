import { afterEach, describe, expect, it, vi } from "vitest";
import { hasDatabase, migrationDatabaseUrl } from "./database.server";

afterEach(() => vi.unstubAllEnvs());

describe("production database configuration", () => {
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
