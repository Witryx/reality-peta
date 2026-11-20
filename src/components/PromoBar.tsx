import { SiteText } from "@/components/SiteText";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/** Pages where the bar would only point at itself. */
const hiddenOn = ["/clanky/prvni-odhad-zdarma", "/odhad-ceny"];

/**
 * Slim announcement bar above the header (scrolls away, the header stays sticky).
 * The whole bar is one link to the free first valuation article.
 */
export function PromoBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (hiddenOn.includes(path)) return null;
  return (
    <Link to="/clanky/prvni-odhad-zdarma" className="promo-bar">
      <span className="promo-bar-inner container-page">
        <span className="promo-klin" aria-hidden />
        <span className="promo-text promo-text-long">
          <SiteText>{"Uplatněte svůj první odhad ceny nemovitosti zcela "}</SiteText>
          <strong>
            <SiteText>{"ZDARMA"}</SiteText>
          </strong>
        </span>
        <span className="promo-text promo-text-short">
          <SiteText>{"První odhad ceny nemovitosti "}</SiteText>
          <strong>
            <SiteText>{"ZDARMA"}</SiteText>
          </strong>
        </span>
        <span className="promo-more">
          <span className="promo-more-label">
            <SiteText>{"Více"}</SiteText>
          </span>
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
