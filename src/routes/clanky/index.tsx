import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { listArticles } from "@/data/articles";
import { pageHead, websiteValues } from "@/lib/seo";

export const Route = createFileRoute("/clanky/")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Články pro klienty",
        description:
          "Informace a upozornění pro majitele nemovitostí: daň z nemovitosti, PNB a předání, hypotéky a úrokové sazby, bezpečný převod peněz.",
        path: "/clanky",
      },
      websiteValues(matches),
    ),
  loader: async () => ({ articles: await listArticles() }),
  component: Page,
});

function Page() {
  const { articles } = Route.useLoaderData();
  return (
    <div className="container-page py-16 md:py-24">
      <p className="eyebrow">
        <SiteText>{"Články"}</SiteText>
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-tight md:text-6xl">
        <SiteText>{"Informace, na které si dát pozor"}</SiteText>
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        <SiteText>
          {
            "Při prodeji, koupi i vlastnictví nemovitosti je potřeba hlídat spoustu povinností. Tady najdete přehledně shrnuté, co se klientů nejčastěji týká — daň z nemovitosti, předání, hypotéky i peníze."
          }
        </SiteText>
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            to="/clanky/$slug"
            params={{ slug: a.slug }}
            className="group flex flex-col rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
          >
            <p className="eyebrow">
              <SiteText>{a.category}</SiteText>
            </p>
            <h2 className="mt-3 font-display text-2xl leading-snug">
              <SiteText>{a.title}</SiteText>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <SiteText>{a.excerpt}</SiteText>
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden /> <SiteText>{a.readingMinutes}</SiteText>
              <SiteText>{" min čtení"}</SiteText>
              <span
                className="ml-auto inline-flex items-center gap-1 text-accent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              >
                <SiteText>{"Číst "}</SiteText>
                <ArrowUpRight className="size-3.5" />
              </span>
            </p>
          </Link>
        ))}
      </div>

      <p className="mt-12 max-w-2xl text-sm text-muted-foreground">
        <SiteText>
          {
            "Články mají obecný informační charakter a nenahrazují daňové ani právní poradenství. U konkrétní nemovitosti vždy ověřte aktuální podmínky."
          }
        </SiteText>
      </p>
    </div>
  );
}
