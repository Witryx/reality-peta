import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { AboutTeaser } from "@/components/Sections";

export const Route = createFileRoute("/o-mne")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "O mně – Petr Pavlát",
        description:
          "Petr Pavlát, osobní realitní makléř pro klienty napříč Českem. Lidský přístup, jasné informace a spolupráce na nemovitostech v Egyptě.",
        path: "/o-mne",
        type: "profile",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <div className="container-page py-16 md:py-24">
      <AboutTeaser full />
      <div className="mx-auto mt-20 max-w-2xl space-y-6 text-lg leading-relaxed text-muted-foreground">
        <h2 className="text-4xl text-foreground">
          <SiteText>{"Nejdřív vás vyslechnu."}</SiteText>
        </h2>
        <p>
          <SiteText>
            {
              "Každý přichází s jinou představou i jinými starostmi. Chci nejprve rozumět tomu, co je pro vás důležité. Pak spolu projdeme možnosti, cenu i jednotlivé kroky — otevřeně a bez tlaku na rychlé rozhodnutí."
            }
          </SiteText>
        </p>
        <p>
          <SiteText>
            {
              "Mám zázemí v Praze a okolí, ale obrátit se na mě můžete odkudkoli z Česka. Ať prodáváte, hledáte nové bydlení nebo řešíte svůj majetek, začneme obyčejným rozhovorem."
            }
          </SiteText>
        </p>
        <Link to="/kontakt" className="btn btn-primary">
          <SiteText>{"Ozvěte se mi"}</SiteText>
        </Link>
      </div>
    </div>
  );
}
