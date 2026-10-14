import { getDatabase, migrate, provisionAppRole } from "../src/server/database.server";
const db = await getDatabase();
try {
  await migrate(db);
  await provisionAppRole(db, process.env["APP_DB_PASSWORD"] || "");
  console.log("Databáze i omezený aplikační účet jsou připravené.");
} catch (error) {
  // Don't print a driver error object: it can contain the CREATE ROLE password.
  console.error(error instanceof Error ? error.message : "Databázi se nepodařilo připravit.");
  process.exitCode = 1;
} finally {
  await db.close();
}
