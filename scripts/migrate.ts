import { getMigrationDatabase, migrate } from "../src/server/database.server";
const db = await getMigrationDatabase();
try {
  await migrate(db);
  console.log("Databáze je připravena.");
} finally {
  await db.close();
}
