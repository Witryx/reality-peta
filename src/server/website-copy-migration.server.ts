import { copyKey } from "../lib/site-copy";
import type { Database } from "./database.server";
import { aboutDescription } from "../data/about-copy";

// The owner requested a replacement of both old paragraphs, including existing overrides.
export async function migrateAboutCopy(db: Database) {
  const [applied] = await db.query(
    "SELECT version FROM schema_migrations WHERE version='about-copy-v2'",
  );
  if (applied) return;
  const [row] = await db.query<{ data: Record<string, string> }>(
    "SELECT data FROM website_content WHERE id='main' FOR UPDATE",
  );
  const legacy = [
    "Práce s lidmi mě baví a naplňuje. Právě při ní můžu naplno využít své schopnosti a pomáhat s rozhodnutími, která mají v životě skutečnou váhu.",
    "Největší smysl mi dává, když celý postup dává smysl i vám. Když přinese klid, radost z nového bydlení nebo řešení důležité situace — a posune vás blíž k tomu, co od života chcete. Nemovitost je součást příběhu. Základem je pro mě lidský přístup.",
  ].map(copyKey);
  if (row && legacy.some((key) => row.data[key] !== undefined)) {
    const values = { ...row.data };
    for (const key of legacy) delete values[key];
    values[copyKey(aboutDescription)] ??= aboutDescription;
    await db.query(
      "UPDATE website_content SET data=$1::jsonb,version=version+1,updated_at=now() WHERE id='main'",
      [JSON.stringify(values)],
    );
  }
  await db.query("INSERT INTO schema_migrations(version) VALUES ('about-copy-v2')");
}

// Preserve owner-edited values when the referral page's source copy changes.
const replacements = [
  [
    "Víte o někom, kdo zvažuje prodej nemovitosti? Propojte nás. Vaše doporučení může pomoci majiteli najít spolehlivého partnera pro prodej a vám přinést odměnu za úspěšně dokončený obchod.",
    "Znáte někoho, kdo řeší nemovitost? Nebo na toto téma narazíte při rozhovoru s přáteli, kolegy či klienty? Vzpomeňte si na mě a propojte nás. O další komunikaci a realitní servis se postarám já, vy můžete získat odměnu za doporučení.",
  ],
  ["Vy doporučíte. Já se postarám o prodej.", "Za doporučení kontaktu můžete získat až 100 000 Kč"],
  [
    "Výši odměny i podmínky jejího vyplacení si domluvíme individuálně předem. Odměna je navázaná na úspěšné dokončení prodeje podle naší dohody.",
    "Konkrétní výši odměny a podmínky jejího vyplacení si domluvíme předem.",
  ],
] as const;

export async function migrateReferralCopy(db: Database) {
  const [applied] = await db.query(
    "SELECT version FROM schema_migrations WHERE version='referral-copy-v1'",
  );
  if (applied) return;
  const [row] = await db.query<{ data: Record<string, string> }>(
    "SELECT data FROM website_content WHERE id='main' FOR UPDATE",
  );
  if (row) {
    const values = { ...row.data };
    let changed = false;
    for (const [from, to] of replacements) {
      const oldKey = copyKey(from);
      const newKey = copyKey(to);
      if (values[oldKey] === undefined) continue;
      if (values[newKey] === undefined) values[newKey] = values[oldKey]!;
      delete values[oldKey];
      changed = true;
    }
    if (changed)
      await db.query(
        "UPDATE website_content SET data=$1::jsonb,version=version+1,updated_at=now() WHERE id='main'",
        [JSON.stringify(values)],
      );
  }
  await db.query("INSERT INTO schema_migrations(version) VALUES ('referral-copy-v1')");
}
