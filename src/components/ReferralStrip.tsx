import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteText } from "./SiteText";

/**
 * Full-width referral band on the homepage, placed after the client references so the
 * visitor already trusts the work. Details and conditions live on /nabidka-spoluprace.
 */
export function ReferralStrip() {
  return (
    <section
      aria-labelledby="referral-heading"
      className="referral-strip bg-[color-mix(in_oklab,var(--color-primary)_88%,black)] py-14 text-primary-foreground md:py-20"
      data-reveal="fade"
    >
      <div className="container-page flex flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-12">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <SiteText>{"Doporučte mě"}</SiteText>
          </p>
          <h2 id="referral-heading" className="mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl">
            <SiteText>{"Znáte někoho, kdo prodává?"}</SiteText>
          </h2>
          <p className="referral-amount">
            <span>
              <SiteText>{"Odměna pro vás až"}</SiteText>
            </span>
            <strong>
              <SiteText>{"100 000 Kč"}</SiteText>
            </strong>
          </p>
          <p className="mt-5 max-w-xl text-lg leading-relaxed">
            <SiteText>
              {
                "Stačí nás propojit. Podmínky si domluvíme předem a odměnu dostanete po úspěšném prodeji."
              }
            </SiteText>
          </p>
        </div>
        <Link to="/nabidka-spoluprace" className="btn btn-light h-auto self-start md:self-auto">
          <SiteText>{"Doporučit kontakt "}</SiteText>
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
