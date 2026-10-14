// @vitest-environment node
import { afterAll, beforeAll, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { embeddedAdapter, migrate, type Database } from "./database.server";
import {
  resetAdminPassword,
  resetAdminFromDeployment,
  recoveryVariable,
} from "./admin-recovery.server";
import { hashPassword, verifyPassword } from "./security.server";

let db: Database;
const targetId = randomUUID();
const otherId = randomUUID();
beforeAll(async () => {
  db = embeddedAdapter(new PGlite());
  await migrate(db);
  for (const [id, email, name] of [
    [targetId, "owner@example.invalid", "Původní jméno"],
    [otherId, "other@example.invalid", "Další správce"],
  ]) {
    await db.query("INSERT INTO admins(id,email,name,password_hash) VALUES ($1,$2,$3,$4)", [
      id,
      email,
      name,
      await hashPassword("old-test-password-123"),
    ]);
    await db.query(
      "INSERT INTO admin_sessions(token_hash,admin_id,expires_at) VALUES ($1,$2,now()+interval '1 hour')",
      [id, id],
    );
  }
}, 30000);
afterAll(async () => {
  await db.close();
});
it("resets only the selected existing account, retains identity and revokes its sessions", async () => {
  await resetAdminPassword(db, " OWNER@example.invalid ", "new-test-password-456");
  const [owner] = await db.query("SELECT * FROM admins WHERE id=$1", [targetId]);
  expect(owner).toMatchObject({
    id: targetId,
    email: "owner@example.invalid",
    name: "Původní jméno",
  });
  expect(await verifyPassword("new-test-password-456", owner!["password_hash"])).toBe(true);
  expect(await verifyPassword("old-test-password-123", owner!["password_hash"])).toBe(false);
  expect(await db.query("SELECT admin_id FROM admin_sessions")).toEqual([{ admin_id: otherId }]);
  const [other] = await db.query("SELECT * FROM admins WHERE id=$1", [otherId]);
  expect(await verifyPassword("old-test-password-123", other!["password_hash"])).toBe(true);
  expect(
    await db.query("SELECT action,entity_id FROM audit_log WHERE action='admin.password.reset'"),
  ).toEqual([{ action: "admin.password.reset", entity_id: targetId }]);
});
it("does not create an account or change identities when the email is wrong", async () => {
  await expect(
    resetAdminPassword(db, "missing@example.invalid", "new-test-password-789"),
  ).rejects.toThrow("neexistuje");
  expect(await db.query("SELECT id FROM admins")).toHaveLength(2);
  await expect(resetAdminPassword(db, "owner@example.invalid", "short")).rejects.toThrow("12–200");
});
it("consumes a deployment reset once and cannot repeat it on later deployments", async () => {
  const request = {
    id: randomUUID(),
    projectId: "recovery-project",
    email: "owner@example.invalid",
    passwordHash: await hashPassword("deployment-password-123"),
    expiresAt: Date.now() + 60000,
  };
  const env = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_PROJECT_ID: request.projectId,
    [recoveryVariable]: JSON.stringify(request),
  };
  expect(await resetAdminFromDeployment(db, env)).toMatchObject({
    id: targetId,
    email: request.email,
  });
  const [stored] = await db.query("SELECT password_hash FROM admins WHERE id=$1", [targetId]);
  expect(await verifyPassword("deployment-password-123", stored!["password_hash"])).toBe(true);
  await resetAdminPassword(db, request.email, "changed-after-recovery-456");
  expect(await resetAdminFromDeployment(db, env)).toBeUndefined();
  const [latest] = await db.query("SELECT password_hash FROM admins WHERE id=$1", [targetId]);
  expect(await verifyPassword("changed-after-recovery-456", latest!["password_hash"])).toBe(true);
  expect(
    await db.query(
      "SELECT id FROM audit_log WHERE action='admin.password.reset.request' AND entity_id=$1",
      [request.id],
    ),
  ).toHaveLength(1);
});
it("rejects wrong projects, previews, expired requests and ambiguous accounts without changing passwords", async () => {
  const request = {
    id: randomUUID(),
    projectId: "recovery-project",
    passwordHash: await hashPassword("rejected-recovery-123"),
    expiresAt: Date.now() + 60000,
  };
  const env = {
    VERCEL: "1",
    VERCEL_ENV: "production",
    VERCEL_PROJECT_ID: request.projectId,
    [recoveryVariable]: JSON.stringify(request),
  };
  await expect(
    resetAdminFromDeployment(db, { ...env, VERCEL_PROJECT_ID: "wrong" }),
  ).rejects.toThrow("tomuto projektu");
  await expect(resetAdminFromDeployment(db, { ...env, VERCEL_ENV: "preview" })).rejects.toThrow(
    "produkčním",
  );
  await expect(resetAdminFromDeployment(db, env)).rejects.toThrow("při více účtech");
  await expect(
    resetAdminFromDeployment(db, {
      ...env,
      [recoveryVariable]: JSON.stringify({ ...request, expiresAt: Date.now() - 1 }),
    }),
  ).rejects.toThrow("vypršel");
  expect(
    await db.query(
      "SELECT id FROM audit_log WHERE action='admin.password.reset.request' AND entity_id=$1",
      [request.id],
    ),
  ).toHaveLength(0);
});
