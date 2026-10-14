import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";

export const Route = createFileRoute("/ochrana-osobnich-udaju")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Zásady ochrany osobních údajů",
        description: `Jak ${site.name} zpracovává osobní údaje z formulářů a webu.`,
        path: "/ochrana-osobnich-udaju",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  const site = useSiteConfig();

  return (
    <div className="container-page max-w-3xl py-16 md:py-24 [&_h2]:mt-10 [&_h2]:text-2xl [&_p]:mt-3 [&_p]:text-muted-foreground">
      <p className="eyebrow">
        <SiteText>{"Právní informace"}</SiteText>
      </p>
      <h1 className="mt-4 text-5xl">
        <SiteText>{"Zásady ochrany osobních údajů"}</SiteText>
      </h1>
      <p className="rounded-lg border border-dashed p-4 text-sm">
        <SiteText>
          {
            "Pracovní verze – před spuštěním nechte text zkontrolovat a doplňte identifikační údaje správce (jméno, IČO, adresu, kontakt)."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Správce"}</SiteText>
      </h2>
      <p>
        <SiteText>{site.agentName}</SiteText>, <SiteText>{site.name}</SiteText>
        <SiteText>{". Identifikační a kontaktní údaje budou doplněny."}</SiteText>
      </p>
      <h2>
        <SiteText>{"Jaké údaje zpracovávám"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Jméno, e-mail, telefon a obsah zprávy z kontaktních formulářů; u odhadu ceny také typ, lokalitu a plochu nemovitosti."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Účel a právní základ"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Vyřízení vašeho dotazu a jednání o smlouvě (čl. 6 odst. 1 písm. b GDPR). Analytické a marketingové cookies pouze na základě souhlasu (čl. 6 odst. 1 písm. a GDPR)."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Doba uložení"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Po dobu nezbytnou k vyřízení dotazu, nejdéle však 3 roky, pokud nevznikne smluvní vztah."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Příjemci"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Poskytovatel hostingu a databáze. Po udělení souhlasu s marketingovými cookies také Google (Analytics, Ads) a Meta (Facebook, Instagram) pro měření návštěvnosti a reklam."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Vaše práva"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Máte právo na přístup, opravu, výmaz, omezení zpracování, přenositelnost, vznesení námitky a odvolání souhlasu. Stížnost můžete podat u Úřadu pro ochranu osobních údajů."
          }
        </SiteText>
      </p>
    </div>
  );
}
