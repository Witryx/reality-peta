import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Star } from "lucide-react";
import { photoAt, photoSrcSet } from "@/lib/photo-src";
import { formatPrice, statusLabel, type Property } from "@/data/types";
import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "./SiteText";

/** Three quiet trust facts under the hero buttons (replaces the separate trust band). */
export function HeroFacts() {
  const { googleReviews } = useSiteConfig();
  return (
    <ul className="hero-facts">
      <li>
        <strong>
          {googleReviews.rating} <Star className="hero-facts-star" aria-hidden />
        </strong>
        <SiteText>{"na Googlu"}</SiteText>
      </li>
      <li>
        <strong>
          <SiteText>{"Jeden makléř"}</SiteText>
        </strong>
        <SiteText>{"od schůzky po klíče"}</SiteText>
      </li>
      <li>
        <strong>
          <SiteText>{"Právník a finanční specialista"}</SiteText>
        </strong>
        <SiteText>{"v týmu"}</SiteText>
      </li>
    </ul>
  );
}

/** Small listing card for the homepage grid: photo, place, title, price. */
function CompactCard({ p }: { p: Property }) {
  const img = [...p.images].sort((a, b) => a.position - b.position)[0];
  return (
    <article className={`compact-card group ${p.status === "sold" ? "is-sold" : ""}`}>
      <Link to="/nabidka/$slug" params={{ slug: p.slug }} className="flex h-full flex-col">
        <div className="compact-card-photo">
          {img && (
            <img
              src={photoAt(img.src, 480)}
              srcSet={photoSrcSet(img.src, [480, 960])}
              sizes="(min-width: 1024px) 260px, 50vw"
              alt={img.alt}
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          )}
          <span className={`compact-card-badge compact-card-badge-${p.status}`}>
            <SiteText>{statusLabel[p.status]}</SiteText>
          </span>
        </div>
        <div className="compact-card-body">
          <p className="compact-card-place">
            {[p.location.city, p.location.district].filter(Boolean).join(" · ")}
          </p>
          <h3 className="compact-card-title">{p.title}</h3>
          <p className="compact-card-price">
            {p.status === "sold" ? <SiteText>{"Prodáno"}</SiteText> : formatPrice(p)}
          </p>
        </div>
      </Link>
    </article>
  );
}

/**
 * One row of small listing cards that moves on by one card every 3 seconds.
 * Stops while the visitor touches, hovers or tabs into it; respects reduced motion.
 */
export function CompactPropertyGrid({
  properties,
  limit = 8,
  className = "",
}: {
  properties: Property[];
  limit?: number;
  className?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const pausedUntil = useRef(0);
  useEffect(() => {
    const node = rail.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hold = () => (pausedUntil.current = Date.now() + 6000);
    const events = ["pointerdown", "pointerenter", "wheel", "focusin", "touchstart"] as const;
    events.forEach((e) => node.addEventListener(e, hold, { passive: true }));
    const timer = window.setInterval(() => {
      if (Date.now() < pausedUntil.current || document.hidden) return;
      if (node.scrollWidth <= node.clientWidth + 2) return;
      const card = node.firstElementChild as HTMLElement | null;
      const step = (card?.offsetWidth ?? 200) + 14;
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 4;
      node.scrollTo({ left: atEnd ? 0 : node.scrollLeft + step, behavior: "smooth" });
    }, 3000);
    return () => {
      window.clearInterval(timer);
      events.forEach((e) => node.removeEventListener(e, hold));
    };
  }, []);
  if (!properties.length) return null;
  return (
    <div ref={rail} className={`compact-grid ${className}`}>
      {properties.slice(0, limit).map((p) => (
        <CompactCard key={p.slug} p={p} />
      ))}
    </div>
  );
}

/** One line instead of the big contact box under the homepage listings. */
export function PresentationNote() {
  return (
    <p className="presentation-note">
      <SiteText>{"Líbí se Vám tato prezentace?"}</SiteText>{" "}
      <Link to="/odhad-ceny">
        <SiteText>{"Takhle prodám i tu Vaši "}</SiteText>
        <ArrowUpRight aria-hidden />
      </Link>
    </p>
  );
}

/** Curiosity section: a sensible asking price is not the same as selling for less. */
export function PriceInsight() {
  const [open, setOpen] = useState(false);
  return (
    <section className={`price-insight py-16 md:py-24 ${open ? "is-open" : ""}`} data-reveal="fade">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">
            <SiteText>{"Cena a strategie"}</SiteText>
          </p>
          <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
            <SiteText>{"Nižší cena neznamená, že prodáte za míň."}</SiteText>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            <SiteText>
              {
                "Zní to jako paradox. Ve skutečnosti je to nejčastější důvod, proč se nemovitost prodá dráž."
              }
            </SiteText>
          </p>
          <div className="price-more" id="price-more" hidden={!open}>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Rozumná cena přivede víc zájemců najednou – a kde je víc lidí, vyjednává se z pozice síly. A i když ne, peníze máte dřív a můžete koupit to, co dává smysl."
                }
              </SiteText>
            </p>
            <Link to="/odhad-ceny" className="text-link mt-6 inline-flex">
              <SiteText>{"Spočítám, co se Vám vyplatí víc"}</SiteText>
            </Link>
          </div>
          <button
            type="button"
            className="price-reveal"
            aria-expanded={open}
            aria-controls="price-more price-duel"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <SiteText>{"Skrýt"}</SiteText> : <SiteText>{"Jak je to možné?"}</SiteText>}
          </button>
        </div>
        <div id="price-duel" className="price-duel-wrap" aria-hidden={!open}>
          <div className="price-duel">
            <div className="price-lane">
              <p className="price-lane-label">
                <SiteText>{"Přestřelená cena"}</SiteText>
              </p>
              <ol>
                <li>
                  <SiteText>{"Málo prohlídek"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Měsíce na trhu"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Nabídka „okouká“"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Sleva pod reálnou cenu"}</SiteText>
                </li>
              </ol>
            </div>
            <div className="price-lane is-winner">
              <p className="price-lane-label">
                <SiteText>{"Reálná cena"}</SiteText>
              </p>
              <ol>
                <li>
                  <SiteText>{"Víc zájemců naráz"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Konkurence mezi nimi"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Silnější vyjednávání"}</SiteText>
                </li>
                <li>
                  <SiteText>{"Prodej za férovou cenu"}</SiteText>
                </li>
              </ol>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <SiteText>
              {"Ilustrativní srovnání. Výsledek vždy záleží na lokalitě, stavu nemovitosti a trhu."}
            </SiteText>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Short Egypt teaser: three big numbers and two listings, details on /egypt. */
export function EgyptTeaser({ properties }: { properties: Property[] }) {
  const active = properties.filter((p) => p.status === "active");
  return (
    <section className="egypt-teaser py-16 md:py-24" aria-labelledby="egypt-teaser-heading">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="eyebrow">
            <SiteText>{"Nemovitosti v Egyptě"}</SiteText>
          </p>
          <h2 id="egypt-teaser-heading" className="mt-4 text-4xl leading-tight md:text-5xl">
            <SiteText>{"Kolik stojí byt u Rudého moře?"}</SiteText>
          </h2>
          <dl className="egypt-stats">
            <div>
              <dt>
                <SiteText>{"od 1,15 mil."}</SiteText>
              </dt>
              <dd>
                <SiteText>{"Kč za byt"}</SiteText>
              </dd>
            </div>
            <div>
              <dt>
                <SiteText>{"4,5 h"}</SiteText>
              </dt>
              <dd>
                <SiteText>{"letu z Prahy"}</SiteText>
              </dd>
            </div>
            <div>
              <dt>
                <SiteText>{"česky"}</SiteText>
              </dt>
              <dd>
                <SiteText>{"celý proces"}</SiteText>
              </dd>
            </div>
          </dl>
          <Link to="/egypt" className="text-link inline-flex">
            <SiteText>{"Prohlédnout byty u moře"}</SiteText>
          </Link>
        </div>
        <CompactPropertyGrid properties={active} className="compact-grid-2" />
      </div>
    </section>
  );
}
