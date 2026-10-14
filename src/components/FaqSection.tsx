import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Plus } from "lucide-react";
import { frequentlyAskedQuestions } from "@/data/faq";
import { SiteText } from "./SiteText";
import { Button } from "./ui/button";

export function FaqSection() {
  const [showMore, setShowMore] = useState(false);
  const split = Math.ceil(frequentlyAskedQuestions.length / 2);
  return (
    <section
      id="caste-dotazy"
      aria-labelledby="faq-heading"
      className="border-t bg-surface py-14 md:py-20"
      data-reveal="line"
    >
      <div className="container-page">
        <div className="grid items-end gap-5 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="eyebrow">
              <SiteText>{"Na rovinu, od začátku"}</SiteText>
            </p>
            <h2 id="faq-heading" className="mt-3 max-w-lg text-4xl leading-tight md:text-5xl">
              <SiteText>{"Vaše nejčastější dotazy"}</SiteText>
            </h2>
          </div>
          <div>
            <p className="max-w-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {"Reality bez zbytečných slibů. S jasnou strategií a realistickým očekáváním."}
              </SiteText>
            </p>
            <blockquote className="mt-3 hidden max-w-lg border-l-2 border-primary pl-4 font-display text-lg leading-snug lg:block">
              <SiteText>
                {"„Řeknu vám, co dává smysl. I když to není vždy to, co chcete slyšet.“"}
              </SiteText>
            </blockquote>
          </div>
        </div>
        <div className="mt-8 grid items-start gap-4 md:grid-cols-2 md:gap-6">
          <FaqItems items={frequentlyAskedQuestions.slice(0, split)} offset={0} />
          <div id="faq-more" className={showMore ? "" : "hidden md:block"}>
            <FaqItems items={frequentlyAskedQuestions.slice(split)} offset={split} />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={showMore}
          aria-controls="faq-more"
          className="mt-3 w-full gap-2 md:hidden"
          onClick={() => setShowMore(!showMore)}
        >
          <SiteText>{showMore ? "Zobrazit méně dotazů" : "Zobrazit další dotazy"}</SiteText>
          <ChevronDown
            className={`size-4 transition-transform motion-reduce:transition-none ${showMore ? "rotate-180" : ""}`}
            aria-hidden
          />
        </Button>
        <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            <SiteText>{"Nenašli jste svou odpověď?"}</SiteText>
          </p>
          <Button asChild variant="outline" className="btn btn-outline h-auto whitespace-normal">
            <Link to="/kontakt">
              <SiteText>{"Proberme vaši situaci"}</SiteText>
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FaqItems({ items, offset }: { items: typeof frequentlyAskedQuestions; offset: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card px-4 sm:px-6">
      {items.map((item, index) => (
        <details
          key={item.slug}
          name="home-faq"
          className="faq-item group border-b last:border-b-0"
        >
          <summary className="flex items-start gap-3 rounded-sm py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
            <span className="pt-1 text-xs tabular-nums text-accent" aria-hidden>
              {<SiteText>{String(offset + index + 1).padStart(2, "0")}</SiteText>}
            </span>
            <h3 className="flex-1 text-base font-semibold leading-relaxed group-hover:text-accent">
              <SiteText>{item.question}</SiteText>
            </h3>
            <span
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-accent group-open:border-primary group-open:bg-primary group-open:text-primary-foreground"
              aria-hidden
            >
              <Plus className="faq-plus size-4" />
            </span>
          </summary>
          <p className="pb-5 pl-7 text-sm leading-relaxed text-muted-foreground sm:pr-9">
            <SiteText>{item.answer}</SiteText>
          </p>
        </details>
      ))}
    </div>
  );
}
