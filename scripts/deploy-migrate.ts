import { getMigrationDatabase, migrate } from "../src/server/database.server";
import { migrateProductionDeployment } from "../src/server/deployment.server";

try {
  if (await migrateProductionDeployment(process.env, getMigrationDatabase, migrate))
    console.log("Produkční databáze je aktualizovaná. Pokračuji sestavením webu.");
} catch (error) {
  // Migration credentials must never be printed into deployment logs.
  const code =
    error && typeof error === "object" && "code" in error ? String(error.code) : "configuration";
  console.error(
    `Aktualizace produkční databáze selhala (${code}). Ověřte DATABASE_URL s migračním účtem; běžící web používá samostatné APP_DATABASE_URL.`,
  );
  process.exitCode = 1;
}
