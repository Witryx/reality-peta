import { createServerFn } from "@tanstack/react-start";
import type { Article } from "./article-types";
import { formalAddress } from "@/lib/formal-address";
export type { Article, ArticleSection } from "./article-types";

const readArticles = createServerFn({ method: "GET" }).handler(async (): Promise<Article[]> => {
  const { getDatabase, hasDatabase } = await import("@/server/database.server");
  if (hasDatabase()) {
    const { publicArticles } = await import("@/server/articles.server");
    return publicArticles(await getDatabase());
  }
  if (process.env["NODE_ENV"] === "production") throw new Error("Chybí databáze pro články.");
  const { defaultArticles } = await import("./articles.defaults");
  return [...defaultArticles];
});
function publicCopy(article: Article): Article {
  return {
    ...article,
    title: formalAddress(article.title),
    excerpt: formalAddress(article.excerpt),
    category: formalAddress(article.category),
    sections: article.sections.map((section) => ({
      ...section,
      ...(section.heading !== undefined && { heading: formalAddress(section.heading) }),
      ...(section.paragraphs && { paragraphs: section.paragraphs.map(formalAddress) }),
      ...(section.bullets && { bullets: section.bullets.map(formalAddress) }),
    })),
  };
}
export async function listArticles(): Promise<Article[]> {
  return (await readArticles())
    .map(publicCopy)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await listArticles()).find((article) => article.slug === slug);
}
