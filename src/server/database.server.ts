import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";
import type { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { defaultArticles } from "../data/articles.defaults";
import { resolveCopy } from "../lib/site-copy";

type Row = Record<string, any>;
export interface Database {
  query<T extends Row = Row>(sql: string, values?: unknown[]): Promise<T[]>;
  transaction<T>(work: (db: Database) => Promise<T>): Promise<T>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}
export function embeddedAdapter(pg: PGlite): Database {
  const adapter = (conn: Pick<PGlite, "query" | "exec">): Database => ({
    query: async <T extends Row>(sql: string, values: unknown[] = []) =>
      (await conn.query<T>(sql, values)).rows,
    transaction: (work) => pg.transaction((tx) => work(adapter(tx as unknown as PGlite))),
    exec: async (sql) => {
      await conn.exec(sql);
    },
    close: () => pg.close(),
  });
  return adapter(pg);
}
// Keep one embedded connection across Vite hot reloads, which otherwise reopen the same files.
const runtime = globalThis as typeof globalThis & { __realtyDatabase?: Promise<Database> };
function configuredDatabaseUrl() {
  if (process.env["APP_DATABASE_URL"]) return process.env["APP_DATABASE_URL"];
  // Vercel integrations provide owner credentials; hosted runtime must use the app role.
  if (process.env["VERCEL"] === "1" && process.env["NODE_ENV"] === "production") return;
  return process.env["DATABASE_URL"];
}
export function hasDatabase() {
  return Boolean(
    configuredDatabaseUrl() ||
    (process.env["LOCAL_DATABASE"] === "1" && process.env["NODE_ENV"] !== "production"),
  );
}
export function getDatabase(): Promise<Database> {
  if (!runtime.__realtyDatabase)
    runtime.__realtyDatabase = connect().catch((error) => {
      delete runtime.__realtyDatabase;
      throw error;
    });
  return runtime.__realtyDatabase;
}
async function connect(): Promise<Database> {
  const url = configuredDatabaseUrl();
  if (!url) {
    if (process.env["LOCAL_DATABASE"] !== "1" || process.env["NODE_ENV"] === "production") {
      throw new Error(
        "Databáze není nastavená. Na Vercelu nastavte APP_DATABASE_URL, na vlastním serveru DATABASE_URL nebo lokálně LOCAL_DATABASE=1.",
      );
    }
    const { PGlite } = await import("@electric-sql/pglite");
    await mkdir(path.resolve(".local"), { recursive: true });
    return embeddedAdapter(new PGlite(path.resolve(".local/postgres")));
  }
  const sql = postgres(url, { max: 8, idle_timeout: 20, connect_timeout: 10, onnotice: () => {} });
  const adapt = (conn: any): Database => ({
    query: async <T extends Row>(text: string, values: unknown[] = []) =>
      (await conn.unsafe(text, values)) as T[],
    transaction: (work) => sql.begin((tx) => work(adapt(tx))) as unknown as Promise<any>,
    exec: async (text) => {
      await conn.unsafe(text);
    },
    close: () => sql.end(),
  });
  return adapt(sql);
}
export async function migrate(db: Database) {
  await db.transaction(async (tx) => {
    await tx.query("SELECT pg_advisory_xact_lock(762342)");
    await tx.exec(await readFile(path.resolve("database/schema.sql"), "utf8"));
    const [seeded] = await tx.query(
      "SELECT version FROM schema_migrations WHERE version='articles-seed-v1'",
    );
    if (!seeded) {
      const [website] = await tx.query<{ data: Record<string, string> }>(
        "SELECT data FROM website_content WHERE id='main'",
      );
      const copy = (text: string) => resolveCopy(website?.data ?? {}, text);
      for (const article of defaultArticles) {
        const data = {
          ...article,
          title: copy(article.title),
          category: copy(article.category),
          excerpt: copy(article.excerpt),
          sections: article.sections.map((section) => ({
            ...section,
            ...(section.heading ? { heading: copy(section.heading) } : {}),
            ...(section.paragraphs ? { paragraphs: section.paragraphs.map(copy) } : {}),
            ...(section.bullets ? { bullets: section.bullets.map(copy) } : {}),
          })),
        };
        await tx.query(
          "INSERT INTO articles(id,slug,publication,data) VALUES ($1,$2,'published',$3::jsonb) ON CONFLICT (slug) DO NOTHING",
          [randomUUID(), data.slug, JSON.stringify(data)],
        );
      }
      await tx.query("INSERT INTO schema_migrations(version) VALUES ('articles-seed-v1')");
    }
  });
}
export async function provisionAppRole(db: Database, password: string) {
  if (!/^[a-f0-9]{48,128}$/.test(password))
    throw new Error("APP_DB_PASSWORD musí být 48–128 náhodných hex znaků.");
  await db.transaction(async (tx) => {
    const [role] = await tx.query("SELECT rolname FROM pg_roles WHERE rolname='realty_app'");
    await tx.exec(
      `${role ? "ALTER" : "CREATE"} ROLE realty_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD '${password}'`,
    );
    await tx.exec(`GRANT USAGE ON SCHEMA public TO realty_app;
      GRANT SELECT ON schema_migrations TO realty_app;
      GRANT SELECT,INSERT,UPDATE,DELETE ON admins,admin_sessions,properties,articles,leads,media,audit_log,rate_limits,website_content TO realty_app;
      GRANT realty_anon TO realty_app;
      DROP POLICY IF EXISTS realty_lead_admin ON leads;
      CREATE POLICY realty_lead_admin ON leads FOR ALL TO realty_app USING (true) WITH CHECK (true);`);
  });
}
