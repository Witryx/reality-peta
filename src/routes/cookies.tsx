import { SiteText } from "@/components/SiteText";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { openConsentSettings } from "@/lib/consent";

export const Route = createFileRoute("/cookies")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Zásady používání cookies",
        description: "Jaké cookies web používá a jak můžete změnit svůj souhlas.",
        path: "/cookies",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <div className="container-page max-w-3xl py-16 md:py-24 [&_h2]:mt-10 [&_h2]:text-2xl [&_p]:mt-3 [&_p]:text-muted-foreground">
      <p className="eyebrow">
        <SiteText>{"Právní informace"}</SiteText>
      </p>
      <h1 className="mt-4 text-5xl">
        <SiteText>{"Cookies"}</SiteText>
      </h1>
      <h2>
        <SiteText>{"Nezbytné"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Uložení vaší volby souhlasu (localStorage „ppr-consent“). Bez nich web nefunguje správně."
          }
        </SiteText>
      </p>
      <p>
        <SiteText>
          {
            "Administrace používá nezbytnou cookie „realty_session“ pro přihlášení správce. Je chráněná před čtením z JavaScriptu a platí nejdéle 8 hodin."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Analytické"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {
            "Google Analytics 4 / Google Tag Manager – anonymní statistiky návštěvnosti. Načtou se až po vašem souhlasu."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Marketingové"}</SiteText>
      </h2>
      <p>
        <SiteText>
          {"Google Ads a Meta Pixel – měření účinnosti reklam. Načtou se až po vašem souhlasu."}
        </SiteText>
      </p>
      <p>
        <SiteText>
          {
            "Stejný souhlas umožní načtení externího obsahu: Google Map, videí YouTube / Vimeo a virtuálních prohlídek Matterport. Bez souhlasu se vložené mapy a přehrávače nenačítají. Google Mapy můžete otevřít samostatným odkazem."
          }
        </SiteText>
      </p>
      <h2>
        <SiteText>{"Změna souhlasu"}</SiteText>
      </h2>
      <p>
        <SiteText>{"Souhlas můžete kdykoli změnit nebo odvolat."}</SiteText>
      </p>
      <button onClick={openConsentSettings} className="btn btn-primary mt-6">
        <SiteText>{"Otevřít nastavení cookies"}</SiteText>
      </button>
    </div>
  );
}
