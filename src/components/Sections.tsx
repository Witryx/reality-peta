import { SiteText } from "@/components/SiteText";
import { useWebsiteImageHidden } from "@/lib/website-context";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { processSteps, services, testimonials } from "@/data/content";
import { aboutDescription } from "@/data/about-copy";
import {
  Camera,
  ChartNoAxesCombined,
  House,
  KeyRound,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { LeadForm } from "./LeadForm";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import fullPortrait from "@/assets/petr-pavlat-full.png.asset.json";
import signature from "@/assets/petr-pavlat-signature.png.asset.json";
import { BrandImage } from "./BrandImage";
import { Plus, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { GoogleRating } from "./GoogleRating";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

export function SectionHead({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">
        <SiteText>{eyebrow}</SiteText>
      </p>
      <h2 className="mt-4 text-4xl md:text-6xl">
        <SiteText>{title}</SiteText>
      </h2>
      {intro && (
        <p className="mt-5 text-lg text-muted-foreground">
          <SiteText>{intro}</SiteText>
        </p>
      )}
    </div>
  );
}

const serviceIcons = {
  prodej: House,
  koupe: Search,
  pronajem: KeyRound,
  odhad: ChartNoAxesCombined,
  homestaging: Camera,
  "pravni-hypoteka": ShieldCheck,
} as const;

export function ServicesGrid() {
  return (
    <div className="services-grid mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => {
        const Icon = serviceIcons[s.slug as keyof typeof serviceIcons];
        return (
          <details key={s.slug} className="service-detail p-6 sm:p-8">
            <summary className="focus-visible:outline-ring">
              <span className="flex items-start justify-between gap-4">
                <Icon className="service-icon" strokeWidth={1.35} aria-hidden="true" />
                <Plus className="service-plus size-5 shrink-0" aria-hidden />
              </span>
              <h3 className="mt-6 text-2xl">
                <SiteText>{s.title}</SiteText>
              </h3>
              <p className="service-description mt-3">
                <SiteText>{s.text}</SiteText>
              </p>
            </summary>
            <p className="mt-5 border-t pt-5 text-sm leading-relaxed text-muted-foreground">
              <SiteText>{s.detail}</SiteText>
            </p>
            <Button asChild variant="link" className="mt-3 h-auto p-0">
              <Link to="/kontakt">
                <SiteText>{"Probrat možnosti "}</SiteText>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </details>
        );
      })}
    </div>
  );
}

export function ProcessList() {
  return (
    <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
      {processSteps.map((s, i) => (
        <li key={s.title} className="border-t border-foreground/20 pt-6">
          <span className="font-display text-5xl text-accent">{i + 1}</span>
          <h3 className="mt-4 text-xl">
            <SiteText>{s.title}</SiteText>
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            <SiteText>{s.text}</SiteText>
          </p>
        </li>
      ))}
    </ol>
  );
}

export function Testimonials() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <>
      <GoogleRating />
      <Carousel
        className="testimonials-carousel mt-10 min-w-0"
        aria-label="Reference klientů"
        opts={{
          align: "start",
          duration: reducedMotion ? 0 : 25,
          breakpoints: { "(min-width: 768px)": { active: false } },
        }}
      >
        <CarouselContent className="md:ml-0 md:grid md:grid-cols-3 md:gap-8">
          {testimonials.map((t, index) => (
            <CarouselItem
              key={t.name}
              className="md:pl-0"
              aria-label={`${index + 1} z ${testimonials.length}`}
            >
              <figure className="flex h-full flex-col rounded-lg bg-card p-6 shadow-soft sm:p-8">
                <div className="mb-4 flex items-center gap-2" aria-label="Hodnocení 5 z 5">
                  <span className="flex text-review-star" aria-hidden="true">
                    {
                      <SiteText>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </SiteText>
                    }
                  </span>
                  <span className="text-sm font-semibold">5/5</span>
                </div>
                <blockquote className="font-display text-xl leading-snug">
                  „<SiteText>{t.text}</SiteText>“
                </blockquote>
                <figcaption className="mt-auto pt-6 text-sm">
                  <span className="font-semibold">
                    <SiteText>{t.name}</SiteText>
                  </span>
                  <span className="block text-muted-foreground">
                    <SiteText>{t.context}</SiteText>
                  </span>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="mt-5 flex justify-end gap-2 md:hidden">
          <CarouselPrevious
            className="static size-11 translate-y-0 bg-card"
            aria-label="Předchozí reference"
            title="Předchozí reference"
          />
          <CarouselNext
            className="static size-11 translate-y-0 bg-card"
            aria-label="Další reference"
            title="Další reference"
          />
        </div>
      </Carousel>
    </>
  );
}

export function ValuationSection({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  return (
    <section
      id="odhad"
      className="valuation-section border-y bg-valuation-surface py-16 md:py-24"
      data-reveal="line"
    >
      <div className="container-page grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="valuation-copy">
          <p className="eyebrow text-valuation-ink">
            <SiteText>{"První krok k dobrému rozhodnutí"}</SiteText>
          </p>
          <Heading className="mt-5 text-4xl leading-tight md:text-5xl">
            <SiteText>{"Chci znát cenu"}</SiteText>
            <br className="hidden md:block" />
            <SiteText>{" své nemovitosti."}</SiteText>
          </Heading>
          <p className="mt-8 max-w-md font-display text-2xl font-medium leading-snug">
            <SiteText>{"Pro nové klienty připravím odhad nemovitosti "}</SiteText>
            <span className="text-valuation-ink">
              <SiteText>{"zdarma."}</SiteText>
            </span>
          </p>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
            <SiteText>
              {
                "Napište mi pár základních údajů. Zjistíme reálnou cenu podle skutečných prodejů v okolí — nezávazně a diskrétně."
              }
            </SiteText>
          </p>
          <ul className="mt-8 space-y-3 border-t border-valuation/20 pt-6 text-sm text-muted-foreground">
            <li>
              <SiteText>{"Odpověď obvykle do dvou pracovních dnů"}</SiteText>
            </li>
            <li>
              <SiteText>{"Bez závazků. Bez nátlaku."}</SiteText>
            </li>
          </ul>
        </div>
        <div className="valuation-form border-t border-valuation/30 pt-6 lg:pt-8">
          <LeadForm kind="valuation" submitLabel="Získat odhad nemovitosti zdarma" />
        </div>
      </div>
    </section>
  );
}

export function AboutTeaser({ full = false }: { full?: boolean }) {
  const Heading = full ? "h1" : "h2";
  const hidden = useWebsiteImageHidden(full ? "image.fullPortrait" : "image.portrait");
  return (
    <div className={`grid gap-10 ${hidden ? "" : "md:grid-cols-[0.8fr_1.2fr]"} md:items-center`}>
      {
        <SiteText>
          {!hidden && (
            <div className="flex aspect-[4/5] items-end justify-center overflow-hidden bg-surface">
              <BrandImage
                asset={full ? fullPortrait : portrait}
                imageKey={full ? "image.fullPortrait" : "image.portrait"}
                alt="Petr Pavlát, realitní makléř"
                width={full ? 585 : 1439}
                height={full ? 1355 : 1825}
                loading="lazy"
                className="h-[95%] w-full object-contain object-bottom"
              />
            </div>
          )}
        </SiteText>
      }
      <div>
        <p className="eyebrow">
          <SiteText>{"O mně"}</SiteText>
        </p>
        <Heading className="mt-4 text-4xl md:text-5xl">
          <SiteText>{"Reality jsou pro mě o lidech."}</SiteText>
        </Heading>
        <p className="mt-6 text-lg text-muted-foreground">
          <SiteText>{aboutDescription}</SiteText>
        </p>
        <BrandImage
          asset={signature}
          alt="Podpis Petr Pavlát reality"
          width={600}
          height={75}
          loading="lazy"
          className="mt-7 h-auto w-full max-w-80"
        />
        {!full && (
          <Link to="/o-mne" className="btn btn-outline mt-8">
            <SiteText>{"Více o mně"}</SiteText>
          </Link>
        )}
      </div>
    </div>
  );
}
