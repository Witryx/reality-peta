import { getMigrationDatabase, migrate } from "../src/server/database.server";
import { migrateProductionDeployment } from "../src/server/deployment.server";
import {
  resetAdminFromDeployment,
  RecoveryAccountSelection,
} from "../src/server/admin-recovery.server";

try {
  if (
    await migrateProductionDeployment(process.env, getMigrationDatabase, migrate, async (db) => {
      try {
        const account = await resetAdminFromDeployment(db, process.env);
        if (account) console.log(`Admin recovery completed for ${account.email}`);
      } catch (error) {
        if (error instanceof RecoveryAccountSelection)
          console.log(`Admin recovery accounts: ${JSON.stringify(error.emails)}`);
        throw error;
      }
    })
  )
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
