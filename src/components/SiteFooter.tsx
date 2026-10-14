import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { nav, site } from "@/config/site";
import { openConsentSettings } from "@/lib/consent";
import { ContactLinks, SocialLinks } from "./ContactLinks";
import signature from "@/assets/petr-pavlat-signature.png.asset.json";
import { BrandImage } from "./BrandImage";
import { BrandLockup } from "./BrandLockup";
import { SocialIcons } from "./ContactLinks";
import { Button } from "./ui/button";
import { CollaborationStrip } from "./CollaborationStrip";

export function SiteFooter() {
  const site = useSiteConfig();

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        <div>
          <Link to="/" aria-label="Petr Pavlát reality – úvod">
            <BrandLockup light />
          </Link>
          <BrandImage
            asset={signature}
            alt="Podpis Petr Pavlát reality"
            width={600}
            height={75}
            loading="lazy"
            className="mt-5 h-auto w-full max-w-72"
          />
          <p className="mt-6 max-w-xs text-sm leading-relaxed opacity-60">
            <SiteText>{site.footerRegion}</SiteText>
          </p>
          <div className="mt-6">
            <SocialIcons />
          </div>
        </div>
        <nav aria-label="Odkazy v patičce">
          <ul className="space-y-2">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="opacity-80 hover:opacity-100">
                  <SiteText>{n.label}</SiteText>
                </Link>
              </li>
            ))}
            <li>
              <Link to="/odhad-ceny" className="opacity-80 hover:opacity-100">
                <SiteText>{"Odhad ceny"}</SiteText>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="[&_li]:border-ink-foreground/15">
          <ContactLinks />
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>
      </div>
      <div className="container-page pb-12">
        <div className="border-t border-ink-foreground/15 pt-8">
          <CollaborationStrip />
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs opacity-70 md:flex-row md:justify-between">
          <p>
            © <SiteText>{new Date().getFullYear()}</SiteText> <SiteText>{site.name}</SiteText>
            <SiteText>{site.contact.ico ? ` · IČO ${site.contact.ico}` : ""}</SiteText>
          </p>
          <ul className="flex flex-wrap gap-5">
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
      </div>
    </footer>
  );
}
