import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ArticlesEditor } from "./ArticlesEditor";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: vi.fn(), ApiError: class extends Error {} }));
vi.mock("@tanstack/react-router", async () => ({
  ...(await vi.importActual("@tanstack/react-router")),
  useRouter: () => ({ invalidate: vi.fn().mockResolvedValue(undefined) }),
}));
afterEach(() => vi.clearAllMocks());
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <ArticlesEditor media={[]} onMediaChange={vi.fn()} onDirty={vi.fn()} />
    </QueryClientProvider>,
  );
}
it("creates a draft article with a Czech title, sections, paragraphs and bullets", async () => {
  vi.mocked(api).mockResolvedValue({ items: [] });
  setup();
  await screen.findByText("Zatím nemáte žádné články. Přidejte první článek.");
  fireEvent.click(screen.getByRole("button", { name: "Přidat článek" }));
  fireEvent.change(screen.getByLabelText("Název článku"), {
    target: { value: "Příběh nového domova" },
  });
  expect(screen.getByLabelText("URL článku")).toHaveValue("pribeh-noveho-domova");
  fireEvent.change(screen.getByLabelText("Úvodní shrnutí"), { target: { value: "Úvod" } });
  fireEvent.change(screen.getByLabelText("Nadpis sekce"), { target: { value: "První krok" } });
  fireEvent.change(screen.getByLabelText("Odstavce (oddělte prázdným řádkem)"), {
    target: { value: "První odstavec.\n\nDruhý odstavec." },
  });
  fireEvent.change(screen.getByLabelText("Odrážky (jeden bod na řádek)"), {
    target: { value: "První bod\nDruhý bod" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Uložit článek" }));
  await screen.findByText("Článek je uložený.");
  const write = vi.mocked(api).mock.calls.find(([, options]) => options?.method === "POST")!;
  expect(write[0]).toBe("/api/admin/articles");
  expect(JSON.parse(write[1]!.body as string)).toMatchObject({
    title: "Příběh nového domova",
    slug: "pribeh-noveho-domova",
    publication: "draft",
    sections: [
      {
        heading: "První krok",
        paragraphs: ["První odstavec.", "Druhý odstavec."],
        bullets: ["První bod", "Druhý bod"],
      },
    ],
  });
});
it("retains edited content on a version conflict and sends the original article version", async () => {
  vi.mocked(api).mockImplementation(async (_path, options) => {
    if (options?.method === "PUT") throw new Error("Článek mezitím upravil jiný správce.");
    return {
      items: [
        {
          id: "article-1",
          title: "Původní blog",
          slug: "puvodni-blog",
          category: "Reality",
          excerpt: "Úvod",
          readingMinutes: 2,
          updatedAt: "2026-10-14",
          sections: [{ paragraphs: ["Obsah"] }],
          publication: "published",
          version: 4,
        },
      ],
    };
  });
  setup();
  fireEvent.click(await screen.findByRole("button", { name: "Upravit článek" }));
  fireEvent.change(screen.getByLabelText("Název článku"), {
    target: { value: "Nové znění blogu" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Uložit článek" }));
  await screen.findByText("Článek mezitím upravil jiný správce.");
  expect(screen.getByLabelText("Název článku")).toHaveValue("Nové znění blogu");
  const write = vi.mocked(api).mock.calls.find(([, options]) => options?.method === "PUT")!;
  expect(write[0]).toBe("/api/admin/articles/article-1");
  expect(JSON.parse(write[1]!.body as string)).toMatchObject({
    version: 4,
    title: "Nové znění blogu",
    slug: "puvodni-blog",
  });
});
