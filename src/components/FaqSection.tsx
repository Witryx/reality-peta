import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Plus } from "lucide-react";
import { frequentlyAskedQuestions } from "@/data/faq";
import { SiteText } from "./SiteText";
import { Button } from "./ui/button";

export function FaqSection() {
  return (
    <section
      id="caste-dotazy"
      aria-labelledby="faq-heading"
      className="border-t bg-surface py-20 md:py-28"
      data-reveal="line"
    >
      <div className="container-page grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <p className="eyebrow">
            <SiteText>{"Na rovinu, od začátku"}</SiteText>
          </p>
          <h2 id="faq-heading" className="mt-4 max-w-md text-4xl leading-tight md:text-5xl">
            <SiteText>{"Vaše nejčastější dotazy"}</SiteText>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            <SiteText>
              {"Reality bez zbytečných slibů. S jasnou strategií a realistickým očekáváním."}
            </SiteText>
          </p>
          <blockquote className="mt-8 max-w-md border-l-2 border-primary pl-5 font-display text-2xl leading-snug">
            <SiteText>
              {"„Řeknu vám, co dává smysl. I když to není vždy to, co chcete slyšet.“"}
            </SiteText>
          </blockquote>
          <div className="mt-9">
            <p className="text-sm text-muted-foreground">
              <SiteText>{"Nenašli jste svou odpověď?"}</SiteText>
            </p>
            <Button
              asChild
              variant="outline"
              className="btn btn-outline mt-4 h-auto whitespace-normal"
            >
              <Link to="/kontakt">
                <SiteText>{"Proberme vaši situaci"}</SiteText>
                <ArrowUpRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border bg-card px-5 sm:px-8">
          {frequentlyAskedQuestions.map((item, index) => (
            <details
              key={item.slug}
              name="home-faq"
              open={index === 0}
              className="faq-item group border-b last:border-b-0"
            >
              <summary className="flex items-start gap-3 rounded-sm py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-4">
                <span className="pt-1 text-xs tabular-nums text-accent" aria-hidden>
                  {<SiteText>{String(index + 1).padStart(2, "0")}</SiteText>}
                </span>
                <h3 className="flex-1 text-base font-semibold leading-relaxed group-hover:text-accent sm:text-lg">
                  <SiteText>{item.question}</SiteText>
                </h3>
                <span
                  className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-accent group-open:border-primary group-open:bg-primary group-open:text-primary-foreground"
                  aria-hidden
                >
                  <Plus className="faq-plus size-4" />
                </span>
              </summary>
              <p className="pb-7 pl-7 text-sm leading-7 text-muted-foreground sm:pl-8 sm:pr-9">
                <SiteText>{item.answer}</SiteText>
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
