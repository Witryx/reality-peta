import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { EgyptLanding } from "@/components/AdLanding";

/** Ad landing page for flats in Hurghada. Not in the menu or sitemap; kept out of search results. */
export const Route = createFileRoute("/byty-u-more")({
  head: ({ matches }) => {
    const head = pageHead(
      {
        title: "Byty v Hurghadě u Rudého moře",
        description:
          "Zrekonstruované a zařízené byty v centru Hurghady. Celý proces v češtině, právní servis a provize v ceně.",
        path: "/byty-u-more",
      },
      websiteValues(matches),
    );
    return { ...head, meta: [...head.meta, { name: "robots", content: "noindex, follow" }] };
  },
  component: EgyptLanding,
});
