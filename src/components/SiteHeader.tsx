import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/config/site";
import { BrandLockup } from "./BrandLockup";
import { Button } from "./ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <a
        href="#obsah"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-card focus:p-2"
      >
        <SiteText>{"Přeskočit na obsah"}</SiteText>
      </a>
      <div className="container-page grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:flex lg:justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 leading-none"
          onClick={() => setOpen(false)}
        >
          <BrandLockup />
        </Link>
        <nav aria-label="Hlavní navigace" className="hidden items-center gap-5 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!text-foreground" }}
            >
              <SiteText>{n.label}</SiteText>
            </Link>
          ))}
          <Button asChild variant="valuation" className="btn cta-arrive h-auto !py-2.5 !px-5">
            <Link to="/odhad-ceny">
              <SiteText>{"Odhad zdarma"}</SiteText>
            </Link>
          </Button>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          aria-label={open ? "Zavřít menu" : "Otevřít menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {<SiteText>{open ? <X /> : <Menu />}</SiteText>}
        </Button>
      </div>
      {open && (
        <nav
          aria-label="Mobilní navigace"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t bg-background lg:hidden"
        >
          <ul className="container-page py-4">
            {nav.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-2xl"
                >
                  <SiteText>{n.label}</SiteText>
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <Button asChild variant="valuation" className="btn h-auto w-full whitespace-normal">
                <Link to="/odhad-ceny" onClick={() => setOpen(false)}>
                  <SiteText>{"Zjistit cenu nemovitosti zdarma"}</SiteText>
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
