import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowUpRight, Clock } from "lucide-react";
import { getArticle } from "@/data/articles";
import { pageHead, websiteValues } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/clanky/$slug")({
  loader: async ({ params }) => {
    const article = await getArticle(params.slug);
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData, params, matches }) => {
    if (!loaderData)
      return { meta: [{ title: "Článek nenalezen" }, { name: "robots", content: "noindex" }] };
    const a = loaderData;
    return {
      ...pageHead(
        {
          title: a.title,
          description: a.excerpt,
          path: `/clanky/${params.slug}`,
          type: "article",
        },
        websiteValues(matches),
      ),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: a.title,
            description: a.excerpt,
            dateModified: a.updatedAt,
            author: { "@type": "Person", name: "Petr Pavlát" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <h1 className="text-4xl">
        <SiteText>{"Tento článek už tu není."}</SiteText>
      </h1>
      <Link to="/clanky" className="btn btn-primary mt-8">
        <SiteText>{"Zpět na články"}</SiteText>
      </Link>
    </div>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const article = Route.useLoaderData();
  return (
    <article className="container-page py-12 md:py-20">
      <nav aria-label="Drobečková navigace" className="text-sm text-muted-foreground">
        <Link to="/clanky" className="hover:underline">
          <SiteText>{"Články"}</SiteText>
        </Link>
        <SiteText> </SiteText>
        <span aria-hidden>/</span>
        {<SiteText> </SiteText>}
        <span>
          <SiteText>{article.category}</SiteText>
        </span>
      </nav>
      <header className="mt-6 max-w-3xl">
        <p className="eyebrow">
          <SiteText>{article.category}</SiteText>
        </p>
        <h1 className="mt-3 text-4xl leading-tight md:text-6xl">
          <SiteText>{article.title}</SiteText>
        </h1>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4" aria-hidden /> <SiteText>{article.readingMinutes}</SiteText>
          <SiteText>{" min čtení"}</SiteText>
        </p>
        <p className="mt-6 font-display text-2xl leading-snug">
          <SiteText>{article.excerpt}</SiteText>
        </p>
      </header>

      <div className="mt-12 max-w-3xl space-y-10">
        {article.sections.map((s, i) => (
          <section key={i}>
            {s.heading && (
              <h2 className="text-3xl">
                <SiteText>{s.heading}</SiteText>
              </h2>
            )}
            {s.paragraphs && (
              <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>
                    <SiteText>{p}</SiteText>
                  </p>
                ))}
              </div>
            )}
            {s.bullets && (
              <ul className="mt-4 space-y-3">
                {s.bullets.map((b, j) => (
                  <li key={j} className="flex gap-3 leading-relaxed">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    <span>
                      <SiteText>{b}</SiteText>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <aside className="mt-16 max-w-3xl rounded-lg border bg-card p-6 md:p-8">
        <h2 className="font-display text-2xl">
          <SiteText>{"Máte dotaz k tomu, co jste si přečetli?"}</SiteText>
        </h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">
          <SiteText>
            {
              "Rád to s vámi projdu osobně — i u vaší konkrétní nemovitosti. Zavolejte nebo napište."
            }
          </SiteText>
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="valuation" className="btn h-auto whitespace-normal">
            <Link to="/odhad-ceny">
              <SiteText>{"Zjistit cenu nemovitosti zdarma "}</SiteText>
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="btn btn-outline h-auto">
            <Link to="/kontakt">
              <SiteText>{"Kontaktovat Petra"}</SiteText>
            </Link>
          </Button>
        </div>
      </aside>
    </article>
  );
}
