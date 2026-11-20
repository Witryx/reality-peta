import { SiteImage } from "@/components/SiteImage";
import { SiteText } from "@/components/SiteText";
import { useWebsiteImageHidden } from "@/lib/website-context";
import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import { BrandImage } from "@/components/BrandImage";
import { listEgypt, listProperties, listUpcoming } from "@/data/properties";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";
import { SectionHead, Testimonials, ValuationSection } from "@/components/Sections";
import {
  CompactPropertyGrid,
  EgyptTeaser,
  HeroFacts,
  PresentationNote,
  PriceInsight,
} from "@/components/HomeSections";
import { ReferralStrip } from "@/components/ReferralStrip";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { CollaborationStrip } from "@/components/CollaborationStrip";
import { SituationPicker } from "@/components/SituationPicker";

/**
 * Homepage shows what is for sale now: active Czech listings (featured first), then „Připravuji“
 * teasers; reserved ones only fill the row up to four cards. Sold ones stay on /nabidka.
 */
async function homepageOffer() {
  const czech = (await listProperties()).sort((a, b) => Number(b.featured) - Number(a.featured));
  const upcoming = await listUpcoming();
  const shown = [...czech.filter((p) => p.status === "active"), ...upcoming];
  if (shown.length >= 4) return shown;
  return [...shown, ...czech.filter((p) => p.status === "reserved")].slice(0, 4);
}

export const Route = createFileRoute("/")({
  loader: async () => ({
    featured: await homepageOffer(),
    egypt: await listEgypt(),
  }),
  head: ({ matches }) =>
    pageHead(
      {
        title: `${site.name} – ${site.claim}`,
        description:
          "Petr Pavlát reality. Prodej, koupě a pronájem napříč Českem a pomoc s nemovitostmi v Egyptě.",
        path: "/",
      },
      websiteValues(matches),
    ),
  component: Home,
});

function Home() {
  const { featured, egypt } = Route.useLoaderData();
  const homeHidden = useWebsiteImageHidden("image.home");
  const portraitHidden = useWebsiteImageHidden("image.portrait");
  const photoHidden = homeHidden && portraitHidden;
  return (
    <div className="home-page">
      <section className="home-hero relative">
        <div
          className={`container-page grid gap-8 pt-8 pb-10 md:pt-12 ${photoHidden ? "" : "lg:grid-cols-[1.1fr_1fr]"} lg:items-stretch lg:gap-12 lg:pb-14`}
        >
          <div className="hero-copy">
            <p className="hero-motto">
              <SiteText>{"Bydlení v pohodě."}</SiteText>{" "}
              <span>
                <SiteText>{"U nás i u moře."}</SiteText>
              </span>
            </p>
            <p className="eyebrow hero-stage mt-3">
              <SiteText>{"Prodej · Koupě · Pronájem · Odhad ceny"}</SiteText>
            </p>
            <h1 className="hero-title mt-4 text-5xl leading-tight sm:text-6xl">
              <SiteText>{"Prodat dobře"}</SiteText>
              <br className="hidden sm:block" />
              <SiteText>{" neznamená prodat draho."}</SiteText>
            </h1>
            <p className="hero-description mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Přestřelená cena prodej jen protáhne a sleva stejně přijde. Řeknu Vám, za kolik se u Vás opravdu prodává."
                }
              </SiteText>
            </p>
            <div className="hero-actions mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Button
                asChild
                variant="valuation"
                className="btn cta-arrive h-auto whitespace-normal"
              >
                <Link to="/odhad-ceny">
                  <SiteText>{"Zjistit reálnou cenu zdarma "}</SiteText>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <a href="#nabidka" className="text-link">
                <SiteText>{"Prohlédnout nabídku"}</SiteText>
              </a>
            </div>
            <HeroFacts />
            <CollaborationStrip className="hero-trust mt-6 border-t pt-4" />
          </div>
          {!photoHidden && (
            <div className="hero-photo relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-[4/3] lg:aspect-auto lg:min-h-[32rem]">
              <SiteImage
                imageKey="image.home"
                src={hero}
                alt="Světlý pražský byt s výhledem na Pražský hrad"
                width={1600}
                height={1072}
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover object-left"
              />
              {!homeHidden && <div className="absolute inset-0 bg-ink/10" aria-hidden="true" />}
              <BrandImage
                asset={portrait}
                imageKey="image.portrait"
                alt="Petr Pavlát, realitní makléř"
                width={1439}
                height={1825}
                fetchPriority="high"
                className="absolute inset-x-0 bottom-0 h-[90%] w-full object-contain object-bottom"
              />
            </div>
          )}
        </div>
      </section>

      <section id="nabidka" className="offer-showcase border-t bg-surface py-14 md:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">
                <SiteText>{"Aktuální nabídka"}</SiteText>
              </p>
              <h2 className="mt-3 text-4xl leading-tight md:text-[2.75rem]">
                <SiteText>{"Nástěnka českých nemovitostí"}</SiteText>
              </h2>
            </div>
            <Link to="/nabidka" className="text-link">
              <SiteText>{"Celá nabídka i prodané"}</SiteText>
            </Link>
          </div>
          <CompactPropertyGrid properties={featured} className="mt-8" />
          <PresentationNote />
        </div>
      </section>

      <EgyptTeaser properties={egypt} />

      <section className="situation-section border-t py-16 md:py-24" data-reveal="line">
        <div className="container-page max-w-4xl">
          <SituationPicker />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="Reference" title="Co na spolupráci říkají klienti" />
            <Link to="/reference" className="text-link" data-guide="reference">
              <SiteText>{"Všechny reference"}</SiteText>
            </Link>
          </div>
          <Testimonials />
        </div>
      </section>

      <ReferralStrip />

      <ValuationSection compact />

      <PriceInsight />
    </div>
  );
}
