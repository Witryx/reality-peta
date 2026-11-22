import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { EgyptSection } from "@/components/EgyptSection";
import { AboutCard } from "@/components/AboutCard";
import { EgyptScene } from "@/components/SectionVisuals";
import {
  CompactPropertyGrid,
  EgyptReasons,
  EgyptSteps,
  egyptOfferOrder,
} from "@/components/HomeSections";
import { SectionHead } from "@/components/Sections";
import { EgyptAlertForm } from "@/components/AdLanding";
import { ContactLinks } from "@/components/ContactLinks";
import { PropertyContactCta } from "@/components/PropertyContactCta";
import { listEgypt } from "@/data/properties";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/egypt")({
  loader: () => listEgypt(),
  head: ({ matches }) =>
    pageHead(
      {
        title: "Nemovitosti v Egyptě – bydlení u Rudého moře",
        description:
          "Nemovitosti v Egyptě s Petrem Pavlátem a partnerskými značkami. Druhý domov i využití majetku, s jasnými informacemi o postupu a rizicích.",
        path: "/egypt",
      },
      websiteValues(matches),
    ),
  component: Page,
});
function Page() {
  const site = useSiteConfig();
  const egypt = egyptOfferOrder(Route.useLoaderData());
  return (
    <>
      {/* 1. Short intro with the Egypt picture, the offer follows right below. */}
      <section className="egypt-top">
        <div className="container-page egypt-top-grid">
          <div className="egypt-top-copy">
            <p className="eyebrow">
              <SiteText>{"Hurghada · Rudé moře"}</SiteText>
            </p>
            <h1 className="mt-4 text-4xl leading-tight md:text-6xl">
              <SiteText>{"Nemovitosti v Egyptě"}</SiteText>
            </h1>
            <p className="egypt-top-lead">
              <SiteText>
                {
                  "Byty v centru Hurghady, 4,5 hodiny letu od Prahy. Celý proces v češtině, s právní kontrolou na místě."
                }
              </SiteText>
            </p>
            <ul className="egypt-top-facts">
              <li>
                <b>
                  <SiteText>{"od 1,15 mil. Kč"}</SiteText>
                </b>
                <span>
                  <SiteText>{"byt u moře"}</SiteText>
                </span>
              </li>
              <li>
                <b>
                  <SiteText>{"4,5 h"}</SiteText>
                </b>
                <span>
                  <SiteText>{"přímý let z Prahy"}</SiteText>
                </span>
              </li>
              <li>
                <b>
                  <SiteText>{"v ceně"}</SiteText>
                </b>
                <span>
                  <SiteText>{"právní servis i provize"}</SiteText>
                </span>
              </li>
            </ul>
          </div>
          <EgyptScene className="egypt-top-scene" />
        </div>
      </section>

      {/* 2. The offer. */}
      <section id="nabidka" className="egypt-offer container-page scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">
              <SiteText>{"Aktuální nabídka"}</SiteText>
            </p>
            <h2 className="mt-3 text-3xl leading-tight md:text-5xl">
              <SiteText>{"Byty u Rudého moře"}</SiteText>
            </h2>
          </div>
          <nav aria-label="Přepnout nabídku" className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary bg-primary px-4 py-2 text-sm text-primary-foreground">
              <SiteText>{"Egypt"}</SiteText>
            </span>
            <Link
              to="/nabidka"
              search={{ zeme: "cz" }}
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground"
            >
              <SiteText>{"Česko"}</SiteText>
            </Link>
            <Link
              to="/nabidka"
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-foreground"
            >
              <SiteText>{"Celá nabídka"}</SiteText>
            </Link>
          </nav>
        </div>
        {egypt.length ? (
          <CompactPropertyGrid properties={egypt} limit={egypt.length} className="mt-8" />
        ) : (
          <p className="mt-8 rounded-lg border border-dashed bg-surface p-8 text-muted-foreground">
            <SiteText>
              {
                "Nové nabídky pro vás právě připravuji. Mezitím mi napište, jakou nemovitost hledáte."
              }
            </SiteText>
          </p>
        )}
        <PropertyContactCta />
      </section>

      {/* 3. Why buy with me and how the purchase goes. */}
      <section className="egypt-why-band">
        <div className="container-page">
          <SectionHead
            eyebrow="Proč se mnou"
            title="V každém bytě jsem osobně byl"
            intro="Nabízím jen byty v centru Hurghady, kde se žije celý rok. Víte přesně, co kupujete i kolik zaplatíte."
          />
          <EgyptReasons />
          <EgyptSteps />
        </div>
      </section>

      {/* 4. Prague and Hurghada side by side (moved here from O mně). */}
      <section className="egypt-distance container-page">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <SectionHead
            eyebrow="Praha – Hurghada"
            title="Blíž, než si myslíte"
            intro="Přímý let trvá zhruba 4,5 hodiny. Na hodinách vidíte, kolik je právě teď v Praze a kolik u moře."
          />
          <AboutCard />
        </div>
      </section>

      {/* 5. How we help on the spot, partners. */}
      <EgyptSection detail />

      {/* 6. Questions worth asking before buying. */}
      <section className="container-page py-16 md:py-24">
        <SectionHead
          eyebrow="Egypt · srozumitelně a osobně"
          title="Nejdřív otázky. Potom rozhodnutí."
          intro="Společně si ujasníme, proč o nemovitosti v Egyptě přemýšlíte, jaký máte rozpočet a co od ní očekáváte."
        />
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Druhý domov",
              text: "Pro vlastní pobyty, čas s rodinou nebo delší zimní měsíce u moře. Důležitá je lokalita i každodenní zázemí.",
            },
            {
              title: "Využití majetku",
              text: "Projdeme možnosti pronájmu, správu a související výdaje. Výnos ani růst hodnoty nejsou zaručené.",
            },
            {
              title: "Jasný postup",
              text: "S partnery probereme dostupnou nabídku, právní režim vlastnictví, poplatky, kurzová rizika a správu na místě.",
            },
          ].map((item) => (
            <div key={item.title} className="border-t pt-6">
              <h3 className="text-2xl">
                <SiteText>{item.title}</SiteText>
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                <SiteText>{item.text}</SiteText>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Contact. */}
      <section id="egypt-kontakt" className="scroll-mt-24 bg-surface py-16 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead
              eyebrow="Kontakt pro Egypt"
              title="Co vás láká k moři?"
              intro="Napište mi, co hledáte. Probereme možnosti i otázky, které je dobré si položit před koupí."
            />
            <ContactLinks className="mt-7" />
            <div className="mt-6 border-l-2 border-accent pl-4">
              {site.contact.egyptWhatsapp && (
                <a
                  href={`https://wa.me/${site.contact.egyptWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("whatsapp_click")}
                  className="font-semibold hover:underline"
                >
                  <SiteText>{"WhatsApp pro Egypt: "}</SiteText>
                  <SiteText>{site.contact.egyptPhone}</SiteText>
                </a>
              )}
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                <SiteText>
                  {
                    "Pro kontakt na egyptském čísle prosím využijte WhatsApp. Komunikace přes WhatsApp je zdarma."
                  }
                </SiteText>
              </p>
            </div>
          </div>
          <EgyptAlertForm />
        </div>
      </section>
    </>
  );
}
