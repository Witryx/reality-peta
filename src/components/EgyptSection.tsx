import { SiteImage } from "@/components/SiteImage";
import { useSiteConfig, useWebsiteImageHidden } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { egyptPhoto } from "@/data/website-image-defaults";
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
export function EgyptSection({
  detail = false,
  compact = false,
}: {
  detail?: boolean;
  compact?: boolean;
}) {
  const hidden = useWebsiteImageHidden("image.egypt");
  return (
    <section
      className={`egypt-band ${compact ? "egypt-band-home pt-12 pb-28 md:pt-16 md:pb-32" : "py-20 md:py-24"}`}
      data-reveal="slide"
    >
      <div
        className={`container-page grid gap-10 ${hidden ? "" : "md:grid-cols-2"} md:items-stretch`}
      >
        {!hidden && (
          <div className="relative overflow-hidden">
            <SiteImage
              imageKey="image.egypt"
              src={egyptPhoto}
              width={1600}
              height={1200}
              loading="lazy"
              alt="Terasa s pergolou a výhledem na Rudé moře v Hurghadě"
              className="egypt-coast-image aspect-[4/3] w-full object-cover md:absolute md:inset-0 md:aspect-auto md:h-full md:w-full"
            />
          </div>
        )}
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
          </p>
          {!compact && (
            <p className="mt-5 leading-relaxed text-muted-foreground">
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
          )}
          {compact && (
            <>
              <ul className="egypt-facts mt-6">
                <li>
                  <span aria-hidden>
                    <MessageCircle />
                  </span>
                  <SiteText>{"Celým procesem vás provedu v češtině"}</SiteText>
                </li>
                <li>
                  <span aria-hidden>
                    <ShieldCheck />
                  </span>
                  <SiteText>{"Ověření právního stavu nemovitosti a právní servis"}</SiteText>
                </li>
                <li>
                  <span aria-hidden>
                    <MapPin />
                  </span>
                  <SiteText>{"Hurghadu dobře známe"}</SiteText>
                </li>
              </ul>
            </>
          )}
          {detail ? (
            <Button asChild className="btn btn-primary mt-7 h-auto whitespace-normal">
              <a href="#egypt-kontakt">
                <SiteText>{"Probrat možnosti "}</SiteText>
                <ArrowUpRight className="size-4" />
              </a>
            </Button>
          ) : (
            !compact && (
              <Button asChild className="btn btn-primary mt-7 h-auto whitespace-normal">
                <Link to="/egypt">
                  <SiteText>{"Nemovitosti v Egyptě "}</SiteText>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            )
          )}
          {!compact && <Partners />}
        </div>
      </div>
      {compact && (
        <div className="egypt-waves" aria-hidden="true">
          <svg viewBox="0 0 2400 90" preserveAspectRatio="none">
            <path d="M0 50 C200 20 400 80 600 50 S1000 20 1200 50 S1600 80 1800 50 S2200 20 2400 50 V90 H0Z" />
          </svg>
          <svg viewBox="0 0 2400 90" preserveAspectRatio="none">
            <path d="M0 66 C150 46 300 82 450 66 S750 46 900 66 S1200 82 1350 66 S1650 46 1800 66 S2100 82 2400 66 V90 H0Z" />
          </svg>
        </div>
      )}
    </section>
  );
}
