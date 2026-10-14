// @vitest-environment node
import { expect, it, vi } from "vitest";
import type { Database } from "./database.server";
import { migrateProductionDeployment } from "./deployment.server";

it("does not mutate production data during preview or local builds", async () => {
  const connect = vi.fn();
  const migrate = vi.fn();
  expect(
    await migrateProductionDeployment({ VERCEL: "1", VERCEL_ENV: "preview" }, connect, migrate),
  ).toBe(false);
  expect(await migrateProductionDeployment({}, connect, migrate)).toBe(false);
  expect(connect).not.toHaveBeenCalled();
  expect(migrate).not.toHaveBeenCalled();
});
it("migrates production before building and closes its separate connection", async () => {
  const close = vi.fn();
  const db = { close } as unknown as Database;
  const connect = vi.fn().mockResolvedValue(db);
  const migrate = vi.fn();
  expect(
    await migrateProductionDeployment({ VERCEL: "1", VERCEL_ENV: "production" }, connect, migrate),
  ).toBe(true);
  expect(migrate).toHaveBeenCalledWith(db);
  expect(close).toHaveBeenCalledOnce();
});
it("stops a failed deployment and releases migration credentials", async () => {
  const close = vi.fn();
  const db = { close } as unknown as Database;
  await expect(
    migrateProductionDeployment(
      { VERCEL: "1", VERCEL_ENV: "production" },
      async () => db,
      async () => {
        throw new Error("Migration failed");
      },
    ),
  ).rejects.toThrow("Migration failed");
  expect(close).toHaveBeenCalledOnce();
});
