import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { SellerLanding } from "@/components/AdLanding";

/** Ad landing page for sellers. Not in the menu or sitemap; kept out of search results. */
export const Route = createFileRoute("/odhad-zdarma")({
  head: ({ matches }) => {
    const head = pageHead(
      {
        title: "Odhad ceny nemovitosti zdarma",
        description:
          "Za kolik reálně prodáte svůj byt nebo dům? Odhad podle skutečných prodejů v okolí, nezávazně a zdarma.",
        path: "/odhad-zdarma",
      },
      websiteValues(matches),
    );
    return { ...head, meta: [...head.meta, { name: "robots", content: "noindex, follow" }] };
  },
  component: SellerLanding,
});
