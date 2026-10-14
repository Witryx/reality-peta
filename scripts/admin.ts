import { createInterface } from "node:readline/promises";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../src/server/database.server";
import { hashPassword } from "../src/server/security.server";
const input = createInterface({ input: process.stdin, output: process.stdout });
const email = (process.env["ADMIN_EMAIL"] || (await input.question("E-mail správce: ")))
  .trim()
  .toLowerCase();
const name = (process.env["ADMIN_NAME"] || (await input.question("Jméno správce: "))).trim();
let password = process.env["ADMIN_PASSWORD"];
input.close();
if (
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
  !name ||
  !password ||
  password.length < 12 ||
  password.length > 200
) {
  console.error(
    "Nastavte ADMIN_EMAIL, ADMIN_NAME a ADMIN_PASSWORD (12–200 znaků). Heslo zadávejte pouze do proměnné prostředí.",
  );
  process.exit(1);
}
const db = await getDatabase();
try {
  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    const [admin] = await tx.query(
      `INSERT INTO admins(id,email,name,password_hash) VALUES ($1,$2,$3,$4)
      ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash RETURNING id`,
      [randomUUID(), email, name, passwordHash],
    );
    await tx.query("DELETE FROM admin_sessions WHERE admin_id=$1", [admin!.id]);
  });
  console.log("Správce připraven. Přihlaste se na /admin. Předchozí relace byly odhlášeny.");
} finally {
  password = undefined;
  delete process.env["ADMIN_PASSWORD"];
  await db.close();
}
