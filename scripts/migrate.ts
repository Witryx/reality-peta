import { getDatabase, migrate } from "../src/server/database.server";
const db = await getDatabase();
try {
  await migrate(db);
  console.log("Databáze je připravena.");
} finally {
  await db.close();
}
