import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  ArrowUpRight,
  ChartPie,
  House,
  KeyRound,
  Scale,
  ScrollText,
  Search,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { situations } from "@/data/content";
import { SiteText } from "./SiteText";

type Situation = (typeof situations)[number];

/** Small icons that make the phone tiles easy to scan. */
const situationIcons: Record<string, typeof House> = {
  prodej: House,
  koupe: Search,
  oboji: ArrowLeftRight,
  najem: KeyRound,
  dedictvi: ScrollText,
  podil: ChartPie,
  exekuce: Scale,
  egypt: Sun,
};

/** Secondary step for each situation; sellers get the free valuation, buyers the offer. */
function NextStep({ slug }: { slug: Situation["slug"] }) {
  if (slug === "koupe")
    return (
      <Link to="/nabidka" className="situation-link">
        <SiteText>{"Prohlédnout nabídku "}</SiteText>
        <ArrowUpRight aria-hidden />
      </Link>
    );
  if (slug === "egypt")
    return (
      <Link to="/egypt" className="situation-link">
        <SiteText>{"Nabídka v Egyptě "}</SiteText>
        <ArrowUpRight aria-hidden />
      </Link>
    );
  return (
    <Link to="/odhad-ceny" className="situation-link">
      <SiteText>{"Zjistit cenu nemovitosti zdarma "}</SiteText>
      <ArrowUpRight aria-hidden />
    </Link>
  );
}

/** Signpost: the visitor picks what they are dealing with and sees how Petr helps. */
export function SituationPicker() {
  const [current, setCurrent] = useState<Situation>(situations[0]);
  return (
    <div>
      <p className="text-lg leading-relaxed">
        <strong className="font-semibold">
          <SiteText>{"Co právě řešíte?"}</SiteText>
        </strong>{" "}
        <SiteText>{"Vyberte, co je vám nejblíž – hned uvidíte, jak vám pomohu."}</SiteText>
      </p>
      <div className="situation-chips mt-5" role="group" aria-label="Vaše situace">
        {situations.map((situation) => {
          const Icon = situationIcons[situation.slug] ?? House;
          return (
            <button
              key={situation.slug}
              type="button"
              className="situation-chip"
              aria-pressed={situation.slug === current.slug}
              onClick={() => setCurrent(situation)}
            >
              <Icon className="situation-chip-icon" strokeWidth={1.6} aria-hidden />
              <SiteText>{situation.label}</SiteText>
            </button>
          );
        })}
      </div>
      <div className="situation-answer mt-5" aria-live="polite">
        <div key={current.slug} className="situation-answer-body">
          <p className="situation-kicker">
            <SiteText>{"Jak vám pomohu"}</SiteText>
          </p>
          <h3 className="mt-2 text-2xl leading-snug md:text-[1.7rem]">
            <SiteText>{current.title}</SiteText>
          </h3>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            <SiteText>{current.text}</SiteText>
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild variant="valuation" className="btn h-auto whitespace-normal">
              <Link to="/kontakt">
                <SiteText>{"Probrat moji situaci "}</SiteText>
                <ArrowUpRight aria-hidden />
              </Link>
            </Button>
            <NextStep slug={current.slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
