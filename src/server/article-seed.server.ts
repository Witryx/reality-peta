import type { Database } from "./database.server";
import type { Article } from "../data/article-types";
import { defaultArticles } from "../data/articles.defaults";
import { resolveCopy } from "../lib/site-copy";

// Keep the existing articles and their text overrides available during a schema upgrade.
export async function originalArticles(db: Database): Promise<Article[]> {
  const [website] = await db.query<{ data: Record<string, string> }>(
    "SELECT data FROM website_content WHERE id='main'",
  );
  const copy = (text: string) => resolveCopy(website?.data ?? {}, text);
  return defaultArticles.map((article) => ({
    ...article,
    title: copy(article.title),
    category: copy(article.category),
    excerpt: copy(article.excerpt),
    sections: article.sections.map((section) => ({
      ...section,
      ...(section.heading ? { heading: copy(section.heading) } : {}),
      ...(section.paragraphs ? { paragraphs: section.paragraphs.map(copy) } : {}),
      ...(section.bullets ? { bullets: section.bullets.map(copy) } : {}),
    })),
  }));
}
