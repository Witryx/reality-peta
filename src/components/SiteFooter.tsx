import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode } from "lucide-react";
import { scrollToTop } from "@/lib/scroll-to-top";
import { nav, site } from "@/config/site";
import { openConsentSettings } from "@/lib/consent";
import { ContactLinks, SocialLinks } from "./ContactLinks";
import { BrandLockup } from "./BrandLockup";
import { SocialIcons } from "./ContactLinks";
import { Button } from "./ui/button";
import { CollaborationStrip } from "./CollaborationStrip";

export function SiteFooter() {
  const site = useSiteConfig();
  const router = useRouter();

  return (
    <footer className="site-footer bg-ink text-ink-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-3">
        <div>
          <Link to="/" aria-label="Petr Pavlát reality – úvod" onClick={() => scrollToTop(router)}>
            <BrandLockup light />
          </Link>
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
          <SaveContact />
        </div>
      </div>
      <div className="container-page pb-12">
        <div className="border-t border-ink-foreground/15 pt-8">
          <CollaborationStrip />
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs opacity-70 md:flex-row md:justify-between">
          <div>
            <p>
              © <SiteText>{2023}</SiteText>–{new Date().getFullYear()}{" "}
              <SiteText>{site.name}</SiteText>
              <SiteText>{site.contact.ico ? ` · IČO ${site.contact.ico}` : ""}</SiteText>
            </p>
            <p className="mt-1">
              <SiteText>
                {
                  "Všechna práva vyhrazena. Texty, fotografie a design webu jsou chráněny autorským zákonem."
                }
              </SiteText>
            </p>
          </div>
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

/** A quiet QR button on larger screens, a direct download button on phones. */
function SaveContact() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8">
      <a
        href="/kontakt.vcf"
        download="Petr-Pavlat-reality.vcf"
        className="btn btn-primary md:hidden"
      >
        <SiteText>{"Uložit kontakt do telefonu"}</SiteText>
      </a>
      <div className="qr-pop hidden md:inline-block" data-open={open}>
        <button
          type="button"
          className="qr-pop-button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <QrCode aria-hidden className="h-[18px] w-[18px] text-[#fdca5d]" />
          <SiteText>{"Uložte si můj kontakt do telefonu"}</SiteText>
        </button>
        <div className="qr-pop-card">
          <img
            src="/kontakt-qr.svg"
            alt="QR kód pro uložení kontaktu Petr Pavlát reality"
            width={192}
            height={192}
            loading="lazy"
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <SiteText>{"Stačí naskenovat fotoaparátem."}</SiteText>
          </p>
        </div>
      </div>
    </div>
  );
}
