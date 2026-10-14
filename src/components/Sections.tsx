import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { processSteps, services, testimonials, videoTestimonials } from "@/data/content";
import { Star } from "lucide-react";
import { LeadForm } from "./LeadForm";
import { Placeholder } from "./ContactLinks";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import fullPortrait from "@/assets/petr-pavlat-full.png.asset.json";
import signature from "@/assets/petr-pavlat-signature.png.asset.json";
import { BrandImage } from "./BrandImage";
import { Plus, ArrowUpRight } from "lucide-react";
import { Button } from "./ui/button";
import { GoogleRating } from "./GoogleRating";

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

export function ServicesGrid() {
  return (
    <div className="mt-14 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s, i) => (
        <details
          key={s.slug}
          className="service-detail bg-background p-8 transition-colors hover:bg-surface"
        >
          <summary className="focus-visible:outline-ring">
            <span className="flex justify-between gap-4">
              <span className="font-display text-sm text-accent">0{i + 1}</span>
              <Plus className="service-plus size-4 shrink-0 text-accent" aria-hidden />
            </span>
            <h3 className="mt-6 text-2xl">
              <SiteText>{s.title}</SiteText>
            </h3>
            <p className="mt-3 text-muted-foreground">
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
      ))}
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
  return (
    <>
      <GoogleRating />
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-lg bg-card p-8 shadow-soft">
            <div className="mb-4 flex items-center gap-2" aria-label="Hodnocení 5 z 5">
              <span className="flex text-valuation-ink" aria-hidden="true">
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
              {t.isDemo && (
                <span className="mt-2 inline-block">
                  <Placeholder>
                    <SiteText>{"Ukázková reference"}</SiteText>
                  </Placeholder>
                </span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
      <VideoReels />
    </>
  );
}

function VideoReels() {
  return (
    <div className="mt-16" aria-labelledby="video-reference">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            <SiteText>{"Reference na videu"}</SiteText>
          </p>
          <h3 id="video-reference" className="mt-2 font-display text-2xl md:text-3xl">
            <SiteText>{"Slovo mají klienti"}</SiteText>
          </h3>
        </div>
        <p className="text-sm text-muted-foreground md:hidden" aria-hidden="true">
          <SiteText>{"Posuňte do strany →"}</SiteText>
        </p>
      </div>
      <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {videoTestimonials.map((v, i) => (
          <li key={i} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
            <figure>
              <div className="relative aspect-[9/16] overflow-hidden rounded-lg bg-muted shadow-soft">
                {v.src ? (
                  <video
                    className="h-full w-full object-cover"
                    src={v.src}
                    poster={v.poster}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`Video reference: ${v.title}`}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-current"
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                    <Placeholder>
                      <SiteText>{"Video doplníme"}</SiteText>
                    </Placeholder>
                  </div>
                )}
              </div>
              <figcaption className="mt-3 text-sm">
                <span className="font-semibold">
                  <SiteText>{v.title}</SiteText>
                </span>
                <span className="block text-muted-foreground">
                  <SiteText>{v.context}</SiteText>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
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
  return (
    <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-center">
      <div className="flex aspect-[4/5] items-end justify-center overflow-hidden bg-surface">
        <BrandImage
          asset={full ? fullPortrait : portrait}
          alt="Petr Pavlát, realitní makléř"
          width={full ? 585 : 1439}
          height={full ? 1355 : 1825}
          loading="lazy"
          className="h-[95%] w-full object-contain object-bottom"
        />
      </div>
      <div>
        <p className="eyebrow">
          <SiteText>{"O mně"}</SiteText>
        </p>
        <Heading className="mt-4 text-4xl md:text-5xl">
          <SiteText>{"Reality jsou pro mě o lidech."}</SiteText>
        </Heading>
        <p className="mt-6 text-lg text-muted-foreground">
          <SiteText>
            {
              "Práce s lidmi mě baví a naplňuje. Právě při ní můžu naplno využít své schopnosti a pomáhat s rozhodnutími, která mají v životě skutečnou váhu."
            }
          </SiteText>
        </p>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          <SiteText>
            {
              "Největší smysl mi dává, když celý postup dává smysl i vám. Když přinese klid, radost z nového bydlení nebo řešení důležité situace — a posune vás blíž k tomu, co od života chcete. Nemovitost je součást příběhu. Základem je pro mě lidský přístup."
            }
          </SiteText>
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
