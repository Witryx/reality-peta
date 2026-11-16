import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { ValuationSection } from "@/components/Sections";

/** Optional purpose from the homepage signpost; fills the first line of the message. */
type ValuationSearch = { ucel?: "notar" | "vlastni" };

const purposeMessage = {
  notar: "Potřebuji odhad ceny pro notáře (dědictví / darování / vypořádání).",
  vlastni: "Potřebuji odhad ceny pro své účely.",
} as const;

export const Route = createFileRoute("/odhad-ceny")({
  validateSearch: (search: Record<string, unknown>): ValuationSearch =>
    search.ucel === "notar" || search.ucel === "vlastni" ? { ucel: search.ucel } : {},
  head: ({ matches }) =>
    pageHead(
      {
        title: "Odhad ceny nemovitosti zdarma",
        description:
          "Zjistěte reálnou tržní cenu svého bytu, domu nebo pozemku. Nezávazný odhad podle skutečných prodejů v lokalitě.",
        path: "/odhad-ceny",
      },
      websiteValues(matches),
    ),
  component: ValuationPage,
});

function ValuationPage() {
  const { ucel } = Route.useSearch();
  return <ValuationSection standalone defaultMessage={ucel ? purposeMessage[ucel] : undefined} />;
}
