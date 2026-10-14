import { createServerFn } from "@tanstack/react-start";
import type { Article } from "./article-types";
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
export async function listArticles(): Promise<Article[]> {
  return (await readArticles()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
export async function getArticle(slug: string): Promise<Article | undefined> {
  return (await readArticles()).find((article) => article.slug === slug);
}
