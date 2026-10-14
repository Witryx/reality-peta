import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { ValuationSection } from "@/components/Sections";

export const Route = createFileRoute("/odhad-ceny")({
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
  component: () => <ValuationSection standalone />,
});
