import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { SectionHead, Testimonials } from "@/components/Sections";
import { SiteImage } from "@/components/SiteImage";
import { useWebsiteImage } from "@/lib/website-context";

export const Route = createFileRoute("/reference")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Reference klientů",
        description:
          "Zkušenosti klientů s prodejem, koupí a pronájmem nemovitostí s makléřem Petrem Pavlátem.",
        path: "/reference",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHead eyebrow="Reference" title="Spokojení klienti jsou moje nejlepší vizitka" />
      <Testimonials />
      <HelpBuying />
      <div className="mt-16">
        <Link to="/nabidka" search={{ stav: "sold" }} className="btn btn-outline">
          <SiteText>{"Prodané nemovitosti"}</SiteText>
        </Link>
      </div>
    </div>
  );
}

function HelpBuying() {
  const hasPhoto = Boolean(useWebsiteImage("image.helpBuyingRuska", ""));
  return (
    <section className="mt-20 md:mt-28" aria-labelledby="pomoc-s-koupi">
      <p className="eyebrow">
        <SiteText>{"Pomoc s koupí"}</SiteText>
      </p>
      <h2 id="pomoc-s-koupi" className="mt-4 max-w-2xl text-4xl md:text-5xl">
        <SiteText>{"Pomohl jsem najít a koupit"}</SiteText>
      </h2>
      <article
        className={`mt-10 grid gap-8 rounded-lg bg-card p-6 shadow-soft sm:p-8 ${hasPhoto ? "md:grid-cols-2 md:items-center" : ""}`}
      >
        <SiteImage
          imageKey="image.helpBuyingRuska"
          alt="Byt v ulici Ruská v Praze, se kterým jsem klientům pomohl při koupi"
          loading="lazy"
          width={1920}
          height={1080}
          className="aspect-video w-full rounded-lg object-cover"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <SiteText>{"Byt 68 m² · Ruská, Praha"}</SiteText>
          </p>
          <p className="mt-4 font-display text-2xl leading-snug">
            <SiteText>{"Pomohl jsem klientům najít a koupit byt, včetně právní kontroly."}</SiteText>
          </p>
        </div>
      </article>
    </section>
  );
}
