import { describe, expect, it } from "vitest";
import { formalAddress } from "./formal-address";

describe("formalAddress", () => {
  it("capitalises every form of the polite pronoun", () => {
    expect(formalAddress("Řeknu vám, co je pro vás důležité.")).toBe(
      "Řeknu Vám, co je pro Vás důležité.",
    );
    expect(formalAddress("S vaším souhlasem a vaší volbou, vaše data, váš domov.")).toBe(
      "S Vaším souhlasem a Vaší volbou, Vaše data, Váš domov.",
    );
    expect(formalAddress("vy si vyberete")).toBe("Vy si vyberete");
  });

  it("leaves other words untouched", () => {
    expect(formalAddress("vysoký vývoj, vyberete, vašek")).toBe("vysoký vývoj, vyberete, vašek");
  });
});
