import type { Publication } from "./admin";

export type ArticleSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};
export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingMinutes: number;
  updatedAt: string;
  sections: ArticleSection[];
  image?: { src: string; alt: string };
};
export type AdminArticle = Article & {
  id: string;
  publication: Publication;
  version: number;
};
