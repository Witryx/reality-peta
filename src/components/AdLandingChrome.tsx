import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { site as staticSite } from "@/config/site";
import { openConsentSettings } from "@/lib/consent";
import { track } from "@/lib/analytics";
import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "./SiteText";
import { BrandLockup } from "./BrandLockup";
import { Button } from "./ui/button";

/** Paths of the ad landing pages, which get this lean header and footer instead of the menu. */
export const landingPaths = ["/odhad-zdarma", "/byty-u-more"];

/** Minimal header: brand and phone, nothing to wander off to. */
export function LandingHeader() {
  const { phone } = useSiteConfig().contact;
  return (
    <header className="border-b bg-background">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <BrandLockup />
        {phone && (
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            aria-label={`Zavolat ${phone}`}
            onClick={() => track("phone_click", { placement: "landing_header" })}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium sm:border-0 sm:p-0"
          >
            <Phone className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">{phone}</span>
          </a>
        )}
      </div>
    </header>
  );
}

/** Legal minimum only: company details and privacy links. */
export function LandingFooter() {
  const { company } = staticSite;
  return (
    <footer className="border-t bg-ink py-8 text-sm text-ink-foreground">
      <div className="footer-legal container-page">
        <div>
          <p>
            {company.name} · IČO {company.ico} · {company.seat} · {company.register}
          </p>
        </div>
        <ul className="footer-legal-links">
          <li>
            <Link to="/ochrana-osobnich-udaju" className="hover:underline">
              <SiteText>{"Zásady ochrany osobních údajů"}</SiteText>
            </Link>
          </li>
          <li>
            <Link to="/cookies" className="hover:underline">
              <SiteText>{"Cookies"}</SiteText>
            </Link>
          </li>
          <li>
            <Button
              variant="link"
              onClick={openConsentSettings}
              className="h-auto p-0 text-xs text-current"
            >
              <SiteText>{"Nastavení cookies"}</SiteText>
            </Button>
          </li>
        </ul>
      </div>
    </footer>
  );
}
