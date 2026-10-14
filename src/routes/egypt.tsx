import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { EgyptSection } from "@/components/EgyptSection";
import { SectionHead } from "@/components/Sections";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks } from "@/components/ContactLinks";
import { PropertyCarousel } from "@/components/PropertyCarousel";
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

  const egypt = Route.useLoaderData();
  return (
    <>
      <EgyptSection detail />
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
      <section className="container-page pb-16 md:pb-24">
        <SectionHead
          eyebrow="Vybrané nabídky"
          title="Nemovitosti u Rudého moře"
          intro="Přehled aktuálních možností. Každou nabídku projdeme osobně, včetně právního režimu vlastnictví a provozních nákladů."
        />
        <PropertyCarousel properties={egypt} />
        <p className="mt-8 border-t pt-5 text-sm text-muted-foreground">
          <SiteText>
            {
              "Jde o ukázkové nabídky — konkrétní a ověřené nemovitosti doplníme podle aktuální dostupnosti od partnerů. Aktuální možnosti rád proberu osobně."
            }
          </SiteText>
        </p>
      </section>
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
          <LeadForm
            kind="contact"
            defaultMessage="Zajímá mě nemovitost v Egyptě. "
            submitLabel="Probrat nabídku v Egyptě"
          />
        </div>
      </section>
    </>
  );
}
