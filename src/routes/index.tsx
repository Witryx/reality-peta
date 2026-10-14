import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { listEgypt, listProperties } from "@/data/properties";
import { listArticles } from "@/data/articles";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";
import { PropertyCarousel } from "@/components/PropertyCarousel";
import {
  AboutTeaser,
  ProcessList,
  SectionHead,
  ServicesGrid,
  Testimonials,
  ValuationSection,
} from "@/components/Sections";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, HeroContactHint } from "@/components/ContactLinks";
import { EgyptSection } from "@/components/EgyptSection";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Clock } from "lucide-react";
import { CollaborationStrip } from "@/components/CollaborationStrip";
import { SectionConnector } from "@/components/SectionConnector";

export const Route = createFileRoute("/")({
  loader: async () => ({
    featured: (await listProperties()).sort((a, b) => Number(b.featured) - Number(a.featured)),
    egypt: await listEgypt(),
    articles: await listArticles(),
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
  const { featured, egypt, articles } = Route.useLoaderData();
  return (
    <>
      <section className="home-hero relative">
        <div className="container-page grid gap-8 pt-8 pb-10 md:pt-12 lg:grid-cols-[1.1fr_1fr] lg:items-stretch lg:gap-12 lg:pb-14">
          <div className="hero-copy">
            <p className="eyebrow hero-stage">
              <SiteText>{"Prodej · Koupě · Pronájem"}</SiteText>
            </p>
            <h1 className="hero-title mt-4 text-5xl leading-tight sm:text-6xl">
              <SiteText>{"Co bude váš"}</SiteText>
              <br className="hidden sm:block" />
              <SiteText>{" další domov?"}</SiteText>
            </h1>
            <p className="hero-description mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Možná ho hledáte. Možná se s tím současným loučíte. Pojďme si říct, co právě řešíte — a najít další krok, který vám dává smysl."
                }
              </SiteText>
            </p>
            <div className="hero-actions mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                asChild
                variant="valuation"
                className="btn cta-arrive h-auto whitespace-normal"
              >
                <Link to="/odhad-ceny">
                  <SiteText>{"Zjistit cenu nemovitosti zdarma "}</SiteText>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="btn btn-outline h-auto whitespace-normal"
              >
                <Link to="/nabidka">
                  <SiteText>{"Prohlédnout nabídku"}</SiteText>
                </Link>
              </Button>
            </div>
            <div className="hero-social mt-6">
              <HeroContactHint />
            </div>
            <CollaborationStrip className="hero-trust mt-6 border-t pt-4" />
          </div>
          <div className="hero-photo relative overflow-hidden">
            <img
              src={hero}
              alt="Světlý pražský byt s výhledem na Pražský hrad"
              width={1600}
              height={1072}
              fetchPriority="high"
              className="aspect-[16/9] w-full object-cover lg:absolute lg:inset-0 lg:h-full lg:aspect-auto"
            />
          </div>
        </div>
      </section>

      <SectionConnector />

      <section className="situation-section border-t py-16 md:py-24" data-reveal="line">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-4xl leading-tight md:text-5xl">
              <SiteText>{"Reality šité na"}</SiteText>
              <br className="hidden md:block" />
              <SiteText>{" míru vaší situace."}</SiteText>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              <SiteText>{"Každá nemovitost má svůj příběh."}</SiteText>
              <br />
              <SiteText>{"A každý člověk svou situaci."}</SiteText>
            </p>
          </div>
          <div>
            <p className="text-lg leading-relaxed">
              <SiteText>
                {
                  "Prodáváte, kupujete, pronajímáte nebo dědíte? Řešíte složitou životní situaci, nebo chcete svůj majetek lépe využít a zhodnotit?"
                }
              </SiteText>
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Pomohu vám zorientovat se v možnostech a otevřeně říct, co dává smysl. I při exekuci nebo tlaku kolem majetku. Citlivě, bez hodnocení a bez nátlaku — a podle potřeby s pomocí odborníků."
                }
              </SiteText>
            </p>
            <div className="mt-7 flex flex-col items-start gap-4">
              <Button asChild variant="valuation" className="btn h-auto whitespace-normal">
                <Link to="/odhad-ceny">
                  <SiteText>{"Zjistit cenu nemovitosti zdarma "}</SiteText>
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="link" className="h-auto p-0">
                <Link to="/kontakt">
                  <SiteText>{"Probrat moji situaci "}</SiteText>
                  <ArrowUpRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-surface">
        <div className="container-page grid grid-cols-1 gap-6 py-8 text-sm sm:grid-cols-3">
          {[
            "Vše transparentně s osobním přístupem od A do Z",
            "Reálná cena podle skutečných prodejů a exkluzivita",
            "Právní a hypoteční servis pod jednou střechou",
          ].map((t) => (
            <p key={t} className="flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              <SiteText>{t}</SiteText>
            </p>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead
              eyebrow="Aktuální nabídka"
              title="Nemovitosti v Česku, které právě hledají nové majitele"
            />
            <Button
              asChild
              variant="outline"
              className="btn btn-outline h-auto self-start md:self-auto"
            >
              <Link to="/nabidka">
                <SiteText>{"Celá nabídka "}</SiteText>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <PropertyCarousel properties={featured} />
        </div>
      </section>

      <section className="py-20 md:py-28 border-t">
        <div className="container-page">
          <SectionHead eyebrow="Služby" title="S čím vám pomohu" />
          <ServicesGrid />
        </div>
      </section>

      <SectionConnector variant="horizon" />
      <EgyptSection />

      <section className="py-20 md:py-28">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead
              eyebrow="Nabídka v Egyptě"
              title="Nemovitosti v Hurghádě přímo u Rudého moře"
            />
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Button asChild variant="link" className="h-auto p-0">
                <Link to="/egypt">
                  <SiteText>{"Jak to u moře děláme "}</SiteText>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="btn btn-outline h-auto">
                <Link to="/egypt">
                  <SiteText>{"Celá nabídka v Egyptě "}</SiteText>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <PropertyCarousel properties={egypt} />
        </div>
      </section>

      <section className="bg-ink py-20 text-ink-foreground md:py-28">
        <div className="container-page [&_.eyebrow]:text-ink-foreground/60 [&_p]:text-ink-foreground/75">
          <SectionHead eyebrow="JAK PROBÍHÁ SPOLUPRÁCE?" title="Prodej v pěti klidných krocích" />
          <ProcessList />
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-page">
          <SectionHead eyebrow="Reference" title="Co na spolupráci říkají klienti" />
          <Testimonials />
        </div>
      </section>

      <section className="border-t bg-surface py-20 md:py-28">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHead eyebrow="Články" title="Informace, na které si dát pozor" />
            <Button
              asChild
              variant="outline"
              className="btn btn-outline h-auto self-start md:self-auto"
            >
              <Link to="/clanky">
                <SiteText>{"Všechny články "}</SiteText>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link
                key={a.slug}
                to="/clanky/$slug"
                params={{ slug: a.slug }}
                className="group flex flex-col rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <p className="eyebrow">
                  <SiteText>{a.category}</SiteText>
                </p>
                <h3 className="mt-3 font-display text-2xl leading-snug">
                  <SiteText>{a.title}</SiteText>
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  <SiteText>{a.excerpt}</SiteText>
                </p>
                <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" aria-hidden /> <SiteText>{a.readingMinutes}</SiteText>
                  <SiteText>{" min čtení"}</SiteText>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SectionConnector variant="perspective" />
      <section className="border-t py-20 md:py-28">
        <div className="container-page">
          <AboutTeaser />
        </div>
      </section>

      <ValuationSection />

      <section className="py-20 md:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHead
              eyebrow="Kontakt"
              title="Pojďme si promluvit"
              intro="Zavolejte, napište nebo vyplňte formulář. Ozvu se osobně."
            />
            <ContactLinks className="mt-8" />
          </div>
          <LeadForm kind="contact" submitLabel="Odeslat zprávu" />
        </div>
      </section>
    </>
  );
}
