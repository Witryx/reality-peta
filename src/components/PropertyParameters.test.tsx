import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Property } from "@/data/types";
import { PropertyParameters } from "./PropertyParameters";
import { WebsiteContentContext } from "@/lib/website-context";
import { copyKey } from "@/lib/site-copy";

const p: Property = {
  id: "test",
  slug: "test-byt",
  title: "Testovací byt",
  status: "active",
  offerType: "rent",
  propertyType: "byt",
  disposition: "2+kk",
  location: { city: "Praha", district: "Karlín" },
  price: 23000,
  priceNote: "+ poplatky 1 000 Kč",
  area: 50,
  ownership: "Osobní",
  condition: "Dobrý",
  energyClass: "C",
  perex: "Úvod nabídky",
  description: [],
  features: ["Balkon"],
  additionalParameters: [{ label: "Infrastruktura", value: "Vodovod, kanalizace" }],
  images: [],
  featured: false,
  sortOrder: 0,
  publishedAt: "2026-01-01",
  isDemo: false,
};
describe("Property parameters", () => {
  it("joins existing features and custom rows with price information, preserving property data independently of copy overrides", () => {
    render(
      <WebsiteContentContext.Provider
        value={{
          [copyKey("Další parametry")]: "Podrobnosti",
          [copyKey("Balkon")]: "Nesprávný přepis",
          [copyKey("Infrastruktura")]: "Jiná infrastruktura",
        }}
      >
        <PropertyParameters p={p} />
      </WebsiteContentContext.Provider>,
    );
    expect(screen.getByRole("heading", { name: "Parametry" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Podrobnosti" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Vybavení" })).not.toBeInTheDocument();
    expect(screen.getByText(p.priceNote!)).toBeInTheDocument();
    expect(screen.getByText("Balkon")).toBeInTheDocument();
    expect(screen.getByText("Infrastruktura")).toBeInTheDocument();
    expect(screen.getByText("Vodovod, kanalizace")).toBeInTheDocument();
  });
});
