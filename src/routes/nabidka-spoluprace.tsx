import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Handshake } from "lucide-react";
import { ContactLinks } from "@/components/ContactLinks";
import { LeadForm } from "@/components/LeadForm";
import { SiteText } from "@/components/SiteText";
import { pageHead, websiteValues } from "@/lib/seo";

export const Route = createFileRoute("/nabidka-spoluprace")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Nabídka spolupráce",
        description:
          "Doporučte služby Petra Pavláta a získejte po úspěšném prodeji dohodnutou odměnu. Přečtěte si, jak doporučení funguje a jaké jsou další možnosti spolupráce.",
        path: "/nabidka-spoluprace",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <article className="container-page py-16 md:py-24">
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">
              <SiteText>{"Doporučení, které má hodnotu"}</SiteText>
            </p>
            <h1 className="mt-4 text-4xl md:text-6xl">
              <SiteText>{"Nabídka spolupráce"}</SiteText>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Víte o někom, kdo zvažuje prodej nemovitosti? Propojte nás. Vaše doporučení může pomoci majiteli najít spolehlivého partnera pro prodej a vám přinést odměnu za úspěšně dokončený obchod."
                }
              </SiteText>
            </p>
            <a href="#kontakt-spoluprace" className="btn btn-primary mt-8">
              <SiteText>{"Chci se domluvit na spolupráci"}</SiteText>
              <ArrowDown className="size-4" aria-hidden />
            </a>
          </div>
          <aside className="rounded-lg border bg-surface p-7 md:p-10">
            <Handshake className="size-9 text-accent" strokeWidth={1.5} aria-hidden />
            <h2 className="mt-6 text-3xl">
              <SiteText>{"Vy doporučíte. Já se postarám o prodej."}</SiteText>
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Výši odměny i podmínky jejího vyplacení si domluvíme individuálně předem. Odměna je navázaná na úspěšné dokončení prodeje podle naší dohody."
                }
              </SiteText>
            </p>
          </aside>
        </header>

        <div className="mt-14 max-w-3xl space-y-14 md:mt-20 md:space-y-20">
          <section aria-labelledby="jak-doporuceni-funguje">
            <h2 id="jak-doporuceni-funguje" className="text-3xl md:text-4xl">
              <SiteText>{"Jak získat odměnu za doporučení"}</SiteText>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Nemusíte být z realitního oboru. Stačí znát někoho, kdo chce prodávat byt, dům, pozemek nebo jinou nemovitost, a doporučit mu mé služby. Celým prodejem pak majitele provedu osobně."
                }
              </SiteText>
            </p>
            <ol className="mt-8 space-y-8">
              <li className="border-t pt-6">
                <h3 className="text-2xl">
                  <SiteText>{"1. Ozvěte se mi s doporučením"}</SiteText>
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "Zavolejte nebo napište, že víte o někom, kdo uvažuje o prodeji. Nejjednodušší je předat můj kontakt přímo majiteli. Pokud nás chcete propojit sami, nejprve se s ním domluvte, že mi můžete jeho kontakt předat."
                    }
                  </SiteText>
                </p>
              </li>
              <li className="border-t pt-6">
                <h3 className="text-2xl">
                  <SiteText>{"2. Domluvíme si podmínky"}</SiteText>
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "Společně si předem potvrdíme, ke které nemovitosti se doporučení vztahuje, jaká bude vaše odměna a za jakých podmínek ji získáte. Ať obě strany od začátku vědí, na čem jsou."
                    }
                  </SiteText>
                </p>
              </li>
              <li className="border-t pt-6">
                <h3 className="text-2xl">
                  <SiteText>{"3. Převezmu péči o prodej"}</SiteText>
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "S majitelem proberu jeho situaci a možnosti prodeje. Pokud se dohodneme na zastoupení, zajistím přípravu nemovitosti, prezentaci, komunikaci se zájemci i koordinaci dalších kroků. Vy nemusíte organizovat prohlídky ani vyjednávat."
                    }
                  </SiteText>
                </p>
              </li>
              <li className="border-t pt-6">
                <h3 className="text-2xl">
                  <SiteText>{"4. Po úspěšném prodeji získáte odměnu"}</SiteText>
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "Když se doporučený prodej úspěšně dokončí a splní se předem domluvené podmínky, vyplatím vám sjednanou odměnu. Samotné předání kontaktu ještě nárok na odměnu nezakládá."
                    }
                  </SiteText>
                </p>
              </li>
            </ol>
          </section>

          <section aria-labelledby="dalsi-spoluprace">
            <h2 id="dalsi-spoluprace" className="text-3xl md:text-4xl">
              <SiteText>{"Další možnosti spolupráce"}</SiteText>
            </h2>
            <h3 className="mt-8 text-2xl">
              <SiteText>{"Pravidelná doporučení"}</SiteText>
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Setkáváte se ve svém okolí nebo při své práci s lidmi, kteří řeší prodej nemovitosti? Můžeme se domluvit na dlouhodobé spolupráci. Nastavíme si způsob předávání doporučení, komunikaci i odměňování za úspěšné obchody."
                }
              </SiteText>
            </p>
            <h3 className="mt-8 text-2xl">
              <SiteText>{"Propojení služeb a společné projekty"}</SiteText>
            </h3>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Působíte v oboru, který s bydlením souvisí, nebo máte nápad na společný projekt? Rád si vyslechnu, co děláte a kde by se naše služby mohly doplňovat. Konkrétní podobu spolupráce vybereme podle toho, co přinese užitek klientům i nám oběma."
                }
              </SiteText>
            </p>
          </section>
        </div>
      </article>

      <section id="kontakt-spoluprace" className="scroll-mt-24 border-t bg-surface py-16 md:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">
              <SiteText>{"Pojďme se propojit"}</SiteText>
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl">
              <SiteText>{"Máte tip nebo nápad na spolupráci?"}</SiteText>
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Napište mi pár slov o tom, jakou spolupráci si představujete. Ozvu se vám osobně a společně probereme další postup."
                }
              </SiteText>
            </p>
            <ContactLinks className="mt-8" />
          </div>
          <div className="rounded-lg border bg-card p-6 md:p-8">
            <LeadForm kind="contact" submitLabel="Probrat spolupráci" />
          </div>
        </div>
      </section>
    </>
  );
}
