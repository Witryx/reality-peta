// @vitest-environment node
import { expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { embeddedAdapter, migrate } from "./database.server";
import { loadWebsiteContent } from "./website.server";
import { copyKey } from "../lib/site-copy";

it("migrates referral copy overrides once without losing newer edits or photo removals", async () => {
  const db = embeddedAdapter(new PGlite());
  try {
    await migrate(db);
    await db.query("DELETE FROM schema_migrations WHERE version='referral-copy-v1'");
    const oldHeading = copyKey("Vy doporučíte. Já se postarám o prodej.");
    const newHeading = copyKey("Za doporučení kontaktu můžete získat až 100 000 Kč");
    const oldTerms = copyKey(
      "Výši odměny i podmínky jejího vyplacení si domluvíme individuálně předem. Odměna je navázaná na úspěšné dokončení prodeje podle naší dohody.",
    );
    const newTerms = copyKey(
      "Konkrétní výši odměny a podmínky jejího vyplacení si domluvíme předem.",
    );
    await db.query("UPDATE website_content SET data=$1::jsonb,version=8 WHERE id='main'", [
      JSON.stringify({
        [oldHeading]: "Vlastní nadpis správce",
        [oldTerms]: "Původní vlastní podmínky",
        [newTerms]: "Novější vlastní podmínky",
        "image.home": "",
        "site.agentName": "Vlastní jméno",
      }),
    ]);
    await migrate(db);
    const saved = await loadWebsiteContent(db);
    expect(saved).toEqual({
      version: 9,
      values: {
        [newHeading]: "Vlastní nadpis správce",
        [newTerms]: "Novější vlastní podmínky",
        "image.home": "",
        "site.agentName": "Vlastní jméno",
      },
    });
    await migrate(db);
    expect(await loadWebsiteContent(db)).toEqual(saved);
  } finally {
    await db.close();
  }
}, 30_000);
