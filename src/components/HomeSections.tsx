import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, KeyRound, Scale, Sofa, Star, Sun } from "lucide-react";
import { photoAt, photoSrcSet } from "@/lib/photo-src";
import { formatPrice, statusLabel, type Property } from "@/data/types";
import { useSiteConfig, useWebsiteImageHidden } from "@/lib/website-context";
import { SiteText } from "./SiteText";
import { SiteImage } from "./SiteImage";
import { egyptPhoto } from "@/data/website-image-defaults";

/** Three trust facts under the hero buttons: same height, number on top, label below. */
export function HeroFacts() {
  const { googleReviews } = useSiteConfig();
  return (
    <ul className="hero-facts">
      <li>
        <strong>
          <img
            src="/brand/google-g.png"
            alt="Google"
            width={18}
            height={18}
            className="hero-facts-g"
          />
          {googleReviews.rating}
          <Star className="hero-facts-star" aria-hidden />
        </strong>
        <span>
          <SiteText>{"hodnocení na Googlu"}</SiteText>
        </span>
      </li>
      <li>
        <strong>
          <SiteText>{"1 makléř"}</SiteText>
        </strong>
        <span>
          <SiteText>{"od schůzky po klíče"}</SiteText>
        </span>
      </li>
      <li>
        <strong>
          <SiteText>{"Právník a finance"}</SiteText>
        </strong>
        <span>
          <SiteText>{"specialisté v týmu"}</SiteText>
        </span>
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
          {p.market === "egypt" && p.price !== null && p.status !== "sold" && (
            <p className="compact-card-note">
              <SiteText>{"Cena včetně provize a kompletního servisu zprostředkování"}</SiteText>
            </p>
          )}
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
            <SiteText>{"Nižší, správně stanovená cena neznamená, že prodáte za míň."}</SiteText>
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

/** Why buy in Egypt through Petr: four short reasons (facts Petr stated about his work). */
const egyptReasons = [
  {
    icon: BadgeCheck,
    title: "V každém bytě jsem byl",
    text: "Žádné vizualizace developerů na okraji města.",
  },
  {
    icon: Sofa,
    title: "Připravené k nastěhování",
    text: "Zařízené, klimatizace v každém pokoji.",
  },
  {
    icon: Scale,
    title: "Ověřený právní stav",
    text: "Kontrola na místě, v češtině i arabštině.",
  },
  {
    icon: KeyRound,
    title: "Správa, když nejste tam",
    text: "Úklid, dohled, přepis energií a internetu.",
  },
];

const egyptSteps = [
  "Videohovor – co hledáte a za kolik",
  "Prohlídka na místě nebo online",
  "Ověření právního stavu a rezervace",
  "Podpis, klíče a přepis energií",
];

/**
 * Egypt is Petr's main market, so it gets a full homepage section: the price answer,
 * three key numbers, four reasons, the current flats (moving row) and the four steps.
 */
export function EgyptTeaser({ properties }: { properties: Property[] }) {
  const { contact } = useSiteConfig();
  const active = properties.filter((p) => p.status === "active");
  const whatsapp = contact.egyptWhatsapp || contact.whatsapp;
  const photoHidden = useWebsiteImageHidden("image.egypt");
  return (
    <section className="egypt-home py-16 md:py-24" aria-labelledby="egypt-home-heading">
      <div className="egypt-home-sun" aria-hidden />
      <svg
        className="egypt-home-waves"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        <path d="M0 64c120-28 240-28 360 0s240 28 360 0 240-28 360 0 240 28 360 0v56H0z" />
        <path d="M0 84c120-22 240-22 360 0s240 22 360 0 240-22 360 0 240 22 360 0v36H0z" />
      </svg>
      <div className="container-page relative z-[1]">
        <div className="egypt-home-top">
          <div>
            <p className="eyebrow">
              <SiteText>{"Nemovitosti v Egyptě · Hurghada"}</SiteText>
            </p>
            <h2 id="egypt-home-heading" className="mt-4 text-4xl leading-tight md:text-5xl">
              <SiteText>{"Kolik stojí byt u Rudého moře?"}</SiteText>
            </h2>
            <p className="egypt-home-answer">
              <SiteText>{"od"}</SiteText>{" "}
              <strong>
                <SiteText>{"1,15 mil. Kč"}</SiteText>
              </strong>
            </p>
            <p className="egypt-home-lead">
              <SiteText>
                {
                  "Byty v centru Hurghady u Sheratonu – tam, kde se žije a všude dojdete pěšky. V každém z nich jsem osobně byl."
                }
              </SiteText>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/egypt" className="btn btn-primary h-auto">
                <SiteText>{"Prohlédnout byty u moře "}</SiteText>
                <ArrowUpRight className="size-4" aria-hidden />
              </Link>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link egypt-home-link"
                >
                  <SiteText>{"Napsat přes WhatsApp"}</SiteText>
                </a>
              )}
            </div>
          </div>
          <div className={`egypt-home-visual ${photoHidden ? "" : "has-photo"}`}>
            {!photoHidden && (
              <figure className="egypt-home-photo">
                <SiteImage
                  imageKey="image.egypt"
                  src={egyptPhoto}
                  alt="Terasa s výhledem na Rudé moře v Hurghadě"
                  width={1600}
                  height={1200}
                  loading="lazy"
                  className="size-full object-cover"
                />
                <figcaption>
                  <Sun aria-hidden />
                  <SiteText>{"Hurghada · Rudé moře"}</SiteText>
                </figcaption>
              </figure>
            )}
            <dl className="egypt-home-stats">
              <div>
                <dt>
                  <SiteText>{"4,5 h"}</SiteText>
                </dt>
                <dd>
                  <SiteText>{"přímý let z Prahy"}</SiteText>
                </dd>
              </div>
              <div>
                <dt>
                  <SiteText>{"česky"}</SiteText>
                </dt>
                <dd>
                  <SiteText>{"celý proces i právník"}</SiteText>
                </dd>
              </div>
              <div>
                <dt>
                  <SiteText>{"v ceně"}</SiteText>
                </dt>
                <dd>
                  <SiteText>{"právní servis i provize"}</SiteText>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <ul className="egypt-home-why">
          {egyptReasons.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon className="egypt-home-why-icon" aria-hidden />
              <strong>
                <SiteText>{title}</SiteText>
              </strong>
              <span>
                <SiteText>{text}</SiteText>
              </span>
            </li>
          ))}
        </ul>

        {active.length > 0 && (
          <>
            <div className="mt-12 flex flex-wrap items-end justify-between gap-4">
              <h3 className="text-3xl">
                <SiteText>{"Aktuálně u moře"}</SiteText>
              </h3>
              <Link to="/egypt" className="text-link egypt-home-link">
                <SiteText>{"Celá nabídka v Egyptě"}</SiteText>
              </Link>
            </div>
            <CompactPropertyGrid properties={active} className="mt-6" />
          </>
        )}

        <div className="egypt-home-steps">
          <p className="egypt-home-steps-title">
            <SiteText>{"Jak koupě probíhá"}</SiteText>
          </p>
          <ol>
            {egyptSteps.map((step, index) => (
              <li key={step}>
                <span aria-hidden>{index + 1}</span>
                <SiteText>{step}</SiteText>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
