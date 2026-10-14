import type { Database } from "./database.server";

export async function migrateProductionDeployment(
  env: NodeJS.ProcessEnv,
  connect: () => Promise<Database>,
  migrate: (db: Database) => Promise<void>,
  afterMigration?: (db: Database) => Promise<void>,
): Promise<boolean> {
  if (env["VERCEL"] !== "1" || env["VERCEL_ENV"] !== "production") return false;
  const db = await connect();
  try {
    await migrate(db);
    await afterMigration?.(db);
  } finally {
    await db.close();
  }
  return true;
}
