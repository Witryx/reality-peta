import { SiteImage } from "@/components/SiteImage";
import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import coast from "@/assets/egypt-coast.jpg";
import { Button } from "@/components/ui/button";
import { PartnerLogo } from "./PartnerLogo";

export function Partners() {
  const site = useSiteConfig();

  return (
    <div className="mt-10 border-t pt-7">
      <p className="eyebrow text-center">
        <SiteText>{"Ve spolupráci s"}</SiteText>
      </p>
      <div className="partner-grid mt-5">
        {site.partners.map((name, index) => (
          <div key={name} className="partner-item">
            <p className="partner-name text-sm font-semibold sm:text-base">
              <SiteText>{name}</SiteText>
            </p>
            <PartnerLogo index={index} showPlaceholder />
          </div>
        ))}
      </div>
    </div>
  );
}
export function EgyptSection({ detail = false }: { detail?: boolean }) {
  return (
    <section className="egypt-band py-20 md:py-24" data-reveal="slide">
      <div className="container-page grid gap-10 md:grid-cols-2 md:items-stretch">
        <div className="relative overflow-hidden">
          <SiteImage
            imageKey="image.egypt"
            src={coast}
            width={1440}
            height={1024}
            loading="lazy"
            alt="Ilustrační pohled na bydlení u Rudého moře v Egyptě"
            className="egypt-coast-image aspect-[4/3] w-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full md:w-full"
          />
          <span className="absolute bottom-3 left-3 bg-card px-2 py-1 text-xs text-card-foreground">
            <SiteText>{"Ilustrační fotografie, ne konkrétní nabídka"}</SiteText>
          </span>
        </div>
        <div>
          <p className="eyebrow">
            <SiteText>{"DALŠÍ HORIZONT · EGYPTSKO ČESKÁ REALITY"}</SiteText>
          </p>
          {detail ? (
            <h1 className="mt-4 text-4xl md:text-5xl">
              <SiteText>{"Nemovitosti v Egyptě"}</SiteText>
            </h1>
          ) : (
            <h2 className="mt-4 text-4xl md:text-5xl">
              <SiteText>{"Vaše místo"}</SiteText>
              <br />
              <SiteText>{"u Rudého moře."}</SiteText>
            </h2>
          )}
          <p className="mt-5 leading-relaxed text-muted-foreground">
            <SiteText>
              {
                "Druhý domov u moře, místo pro vlastní pobyt nebo příležitost ke zhodnocení vašich prostředků."
              }
            </SiteText>
            <br />
            <br />
            <SiteText>
              {
                "Ve spolupráci s prověřenými partnerskými značkami vám pomáhám se zprostředkováním koupě i pronájmu apartmánu v Egyptě. Pomůžeme vám zorientovat se na místním trhu, prověřit vybranou nemovitost a v případě potřeby zajistit také její dovybavení nebo rekonstrukci podle vašich představ."
              }
            </SiteText>
            <br />
            <br />
            <SiteText>
              {
                "Celým procesem vás provedeme přehledně v češtině a s dostatkem prostoru pro všechny vaše otázky. Hurghadu dobře známe a chceme, abyste se zde dokázali rychle zorientovat a cítili se jako doma."
              }
            </SiteText>
            <br />
            <br />
            <SiteText>
              {"Právní podporu máme k dispozici přímo na místě, a to v českém i arabském jazyce."}
            </SiteText>
            <br />
            <br />
            <SiteText>
              {
                "Vy si vyberete. My nemovitost prověříme a pomůžeme vám celý proces bezpečně realizovat."
              }
            </SiteText>
          </p>
          {detail ? (
            <Button asChild className="btn btn-primary mt-7 h-auto whitespace-normal">
              <a href="#egypt-kontakt">
                <SiteText>{"Probrat možnosti "}</SiteText>
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          ) : (
            <Button asChild className="btn btn-primary mt-7 h-auto whitespace-normal">
              <Link to="/egypt">
                <SiteText>{"Nemovitosti v Egyptě "}</SiteText>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          )}
          <Partners />
        </div>
      </div>
    </section>
  );
}
