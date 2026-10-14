import { createInterface } from "node:readline/promises";
import { getDatabase } from "../src/server/database.server";
import { resetAdminPassword } from "../src/server/admin-recovery.server";

// Prefer an external database; never reset a local account by mistake during recovery.
if (!process.env["APP_DATABASE_URL"] && !process.env["DATABASE_URL"])
  throw new Error(
    "Chybí připojení k ostré databázi. Pro Vercel použijte npm.cmd run admin:reset:vercel; tajné databázové připojení zůstane ve Vercelu.",
  );
let password = process.env["ADMIN_PASSWORD"];
delete process.env["ADMIN_PASSWORD"];
if (!password || password.length < 12 || password.length > 200)
  throw new Error("Nastavte ADMIN_PASSWORD skrytým zadáním v terminálu (12–200 znaků).");
const db = await getDatabase();
try {
  const accounts = await db.query<{ email: string; name: string }>(
    "SELECT email,name FROM admins ORDER BY email",
  );
  if (!accounts.length) throw new Error("V této databázi není žádný admin účet.");
  let email = process.env["ADMIN_EMAIL"];
  if (!email && accounts.length === 1) email = accounts[0]!.email;
  if (!email) {
    console.log("Existující admin účty:");
    for (const account of accounts) console.log(`  ${account.email} (${account.name})`);
    if (!process.stdin.isTTY) throw new Error("Vyberte účet pomocí ADMIN_EMAIL.");
    const input = createInterface({ input: process.stdin, output: process.stdout });
    try {
      email = await input.question("E-mail účtu pro reset: ");
    } finally {
      input.close();
    }
  }
  const account = await resetAdminPassword(db, email, password);
  console.log(
    `Heslo účtu ${account.email} je obnovené. Staré relace jsou odhlášené. Přihlaste se na /admin.`,
  );
} finally {
  password = undefined;
  await db.close();
}
