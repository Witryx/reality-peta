import { randomUUID } from "node:crypto";
import type { Database } from "./database.server";
import { hashPassword } from "./security.server";

// This is an offline recovery operation with database access, never a public endpoint.
export async function resetAdminPassword(db: Database, email: string, password: string) {
  const address = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || password.length < 12 || password.length > 200)
    throw new Error("Zadejte platný e-mail a heslo o délce 12–200 znaků.");
  const passwordHash = await hashPassword(password);
  return resetAdminPasswordHash(db, address, passwordHash);
}
async function resetAdminPasswordHash(db: Database, address: string, passwordHash: string) {
  return db.transaction(async (tx) => {
    const [admin] = await tx.query<{ id: string; email: string; name: string }>(
      "UPDATE admins SET password_hash=$1 WHERE email=$2 RETURNING id,email,name",
      [passwordHash, address],
    );
    if (!admin) throw new Error("Tento admin účet neexistuje. Reset žádný nový účet nevytvořil.");
    await tx.query("DELETE FROM admin_sessions WHERE admin_id=$1", [admin.id]);
    await tx.query(
      "INSERT INTO audit_log(id,admin_id,action,entity_id) VALUES ($1,$2,'admin.password.reset',$3)",
      [randomUUID(), admin.id, admin.id],
    );
    return admin;
  });
}

export const recoveryVariable = "REALTY_ADMIN_RECOVERY_REQUEST";
export class RecoveryAccountSelection extends Error {
  constructor(public emails: string[]) {
    super("Reset vyžaduje existující admin účet; při více účtech zadejte jeho e-mail.");
  }
}
export async function resetAdminFromDeployment(db: Database, env: NodeJS.ProcessEnv) {
  const raw = env[recoveryVariable];
  if (!raw) return;
  if (env["VERCEL"] !== "1" || env["VERCEL_ENV"] !== "production")
    throw new Error("Obnova přístupu je povolená pouze v produkčním nasazení.");
  let request: {
    id?: string;
    projectId?: string;
    passwordHash?: string;
    email?: string;
    expiresAt?: number;
  };
  try {
    request = JSON.parse(raw);
  } catch {
    throw new Error("Neplatný požadavek obnovy přístupu.");
  }
  if (
    !request ||
    !request.id ||
    !/^[a-f0-9-]{36}$/.test(request.id) ||
    !request.projectId ||
    request.projectId !== env["VERCEL_PROJECT_ID"] ||
    !request.passwordHash ||
    !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(request.passwordHash) ||
    (request.email !== undefined && typeof request.email !== "string") ||
    !Number.isFinite(request.expiresAt)
  )
    throw new Error("Požadavek obnovy nepatří tomuto projektu nebo nemá platný hash.");
  return db.transaction(async (tx) => {
    await tx.query("SELECT pg_advisory_xact_lock(762343)");
    const [used] = await tx.query(
      "SELECT id FROM audit_log WHERE action='admin.password.reset.request' AND entity_id=$1",
      [request.id],
    );
    if (used) return;
    if (request.expiresAt! < Date.now())
      throw new Error("Požadavek na reset vypršel. Spusťte obnovu znovu.");
    const accounts = await tx.query<{ id: string; email: string; name: string }>(
      "SELECT id,email,name FROM admins ORDER BY email FOR UPDATE",
    );
    const email = request.email?.trim().toLowerCase();
    const account = email
      ? accounts.find((value) => value.email === email)
      : accounts.length === 1
        ? accounts[0]
        : undefined;
    if (!account) throw new RecoveryAccountSelection(accounts.map((value) => value.email));
    await tx.query("UPDATE admins SET password_hash=$1 WHERE id=$2", [
      request.passwordHash,
      account.id,
    ]);
    await tx.query("DELETE FROM admin_sessions WHERE admin_id=$1", [account.id]);
    await tx.query(
      "INSERT INTO audit_log(id,admin_id,action,entity_id) VALUES ($1,$2,'admin.password.reset.request',$3)",
      [randomUUID(), account.id, request.id],
    );
    return account;
  });
}
