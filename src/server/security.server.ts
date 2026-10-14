import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import type { Database } from "./database.server";

const scrypt = promisify(scryptCallback);
export const COOKIE = "realty_session";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, stored: string) {
  const [, salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
const fallbackHash = hashPassword(randomBytes(32).toString("hex"));
export async function fakePasswordCheck(password: string) {
  await verifyPassword(password, await fallbackHash);
}
export function sessionToken(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${COOKIE}=`))
      ?.slice(COOKIE.length + 1) ?? ""
  );
}
export async function requireAdmin(db: Database, request: Request) {
  const token = sessionToken(request);
  if (!/^[a-f0-9]{64}$/.test(token)) throw new HttpError(401, "Přihlaste se do administrace.");
  const [admin] = await db.query<{ id: string; email: string; name: string }>(
    "SELECT a.id, a.email, a.name FROM admins a JOIN admin_sessions s ON s.admin_id = a.id WHERE s.token_hash = $1 AND s.expires_at > now()",
    [hashToken(token)],
  );
  if (!admin) throw new HttpError(401, "Přihlášení vypršelo. Přihlaste se znovu.");
  return admin;
}
export function cookie(value: string, maxAge = 28800) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env["NODE_ENV"] === "production" ? "; Secure" : ""}`;
}
export function checkOrigin(request: Request) {
  const configured = process.env["APP_URL"];
  if (process.env["NODE_ENV"] === "production" && !configured)
    throw new HttpError(503, "Chybí produkční APP_URL.");
  const allowed = new URL(configured || request.url).origin;
  if (request.headers.get("origin") !== allowed)
    throw new HttpError(403, "Požadavek musí pocházet z tohoto webu.");
}
export async function rateLimit(db: Database, key: string, limit: number, seconds: number) {
  const [row] = await db.query<{ count: number }>(
    `INSERT INTO rate_limits(key, count, reset_at) VALUES ($1, 1, now() + $2 * interval '1 second')
     ON CONFLICT(key) DO UPDATE SET count = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
     reset_at = CASE WHEN rate_limits.reset_at <= now() THEN now() + $2 * interval '1 second' ELSE rate_limits.reset_at END RETURNING count`,
    [hashToken(key), seconds],
  );
  if ((row?.count ?? 0) > limit)
    throw new HttpError(429, "Příliš mnoho pokusů. Zkuste to později.");
}
