import { describe, expect, it } from "vitest";
import { isStaleBuildError } from "./stale-build";

describe("isStaleBuildError", () => {
  it("recognises missing code chunks after a new deployment in all browsers", () => {
    for (const message of [
      "Failed to fetch dynamically imported module: https://x.cz/assets/nabidka._slug-B1.js",
      "Importing a module script failed.",
      "error loading dynamically imported module",
      "Unable to preload CSS for /assets/styles.css",
    ])
      expect(isStaleBuildError(new TypeError(message))).toBe(true);
  });
  it("leaves ordinary errors alone", () => {
    expect(isStaleBuildError(new Error("Chybí databáze pro produkční nabídky."))).toBe(false);
    expect(isStaleBuildError(undefined)).toBe(false);
  });
});
