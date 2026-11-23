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
        <h2 className="pt-6 text-4xl text-foreground">
          <SiteText>{"Kdo za mnou stojí"}</SiteText>
        </h2>
        <p>
          <SiteText>
            {
              "Spolupracuji se skupinou STELAR, která má vlastní nemovitostní fond Aurelia. Kancelář mám v City Tower na Pankráci, pomáhám po celém Česku. Osvědčení realitního zprostředkovatele mám od února 2024."
            }
          </SiteText>
        </p>
        <Link
          to="/clanky/$slug"
          params={{ slug: "fond-aurelia" }}
          className="text-link inline-flex"
        >
          <SiteText>{"Co je fond Aurelia a proč na tom záleží"}</SiteText>
        </Link>
        <p>
          <SiteText>
            {
              "Ať prodáváte, hledáte nové bydlení nebo řešíte svůj majetek, začneme obyčejným rozhovorem."
            }
          </SiteText>
        </p>
        <Link to="/kontakt" className="btn btn-primary mt-2">
          <SiteText>{"Ozvěte se mi"}</SiteText>
        </Link>
      </div>
    </div>
  );
}
