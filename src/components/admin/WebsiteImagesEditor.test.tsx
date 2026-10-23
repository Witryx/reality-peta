import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WebsiteImagesEditor } from "./WebsiteImagesEditor";
import { api } from "@/lib/api";

vi.mock("@/lib/api", () => ({ api: vi.fn(), ApiError: class extends Error {} }));
vi.mock("@/data/website-image-defaults", () => ({
  websiteImageDefaults: { "image.home": "/original.jpg" },
}));
vi.mock("@tanstack/react-router", async () => ({
  ...(await vi.importActual("@tanstack/react-router")),
  useRouter: () => ({ invalidate: vi.fn().mockResolvedValue(undefined) }),
}));
afterEach(() => vi.clearAllMocks());
const media = {
  id: "media-1",
  filename: "test.webp",
  original_name: "Nová fotografie",
  width: 20,
  height: 20,
  bytes: 200,
  created_at: "2026-10-14",
};
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <WebsiteImagesEditor media={[media]} onMediaChange={vi.fn()} onDirty={vi.fn()} />
    </QueryClientProvider>,
  );
  return client;
}
it("replaces a website image, preserves text, updates the shared cache and restores the original", async () => {
  vi.mocked(api).mockImplementation(async (_path, options) => {
    if (options?.method === "PUT") {
      const draft = JSON.parse(options.body as string);
      return { ...draft, version: draft.version + 1 };
    }
    return { values: { "site.agentName": "Vlastní jméno" }, version: 7 };
  });
  const client = setup();
  const group = await screen.findByLabelText("Stránka nebo sekce");
  fireEvent.change(group, { target: { value: "Úvodní stránka" } });
  fireEvent.click(screen.getAllByRole("button", { name: "Vybrat z knihovny" })[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Nová fotografie Nová fotografie" }));
  fireEvent.change(screen.getAllByLabelText("Popis fotografie")[0]!, {
    target: { value: "Nový pohled" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Uložit fotografie" }));
  await screen.findByText("Změny fotografií jsou uložené na webu.");
  const write = vi.mocked(api).mock.calls.find(([, options]) => options?.method === "PUT")!;
  expect(JSON.parse(write[1]!.body as string)).toEqual({
    values: {
      "site.agentName": "Vlastní jméno",
      "image.home": "/uploads/test.webp",
      "image.home.alt": "Nový pohled",
    },
    version: 7,
  });
  expect(client.getQueryData(["admin-website"])).toMatchObject({ version: 8 });
  fireEvent.click(screen.getAllByRole("button", { name: "Původní fotografie" })[0]!);
  expect(screen.getByRole("img", { name: "Úvodní fotografie" })).toHaveAttribute(
    "src",
    "/original.jpg",
  );
  expect(screen.getAllByLabelText("Popis fotografie")[0]).toHaveValue(
    "Světlý pražský byt s výhledem na Pražský hrad",
  );
});
it("removes an original photograph, persists its empty override and can restore it", async () => {
  vi.mocked(api).mockImplementation(async (_path, options) => {
    if (options?.method === "PUT") {
      const draft = JSON.parse(options.body as string);
      return { ...draft, version: draft.version + 1 };
    }
    return { values: { "site.agentName": "Vlastní jméno" }, version: 4 };
  });
  const client = setup();
  const remove = await screen.findByRole("button", {
    name: "Odebrat fotografii: Úvodní fotografie",
  });
  const card = within(remove.closest("section")!);
  fireEvent.click(remove);
  expect(card.queryByRole("img")).not.toBeInTheDocument();
  expect(remove).toBeDisabled();
  expect(card.getByLabelText("Popis fotografie")).toBeDisabled();
  expect(card.getByRole("button", { name: "Původní fotografie" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Uložit fotografie" }));
  await screen.findByText("Změny fotografií jsou uložené na webu.");
  expect(client.getQueryData(["admin-website"])).toEqual({
    values: { "site.agentName": "Vlastní jméno", "image.home": "" },
    version: 5,
  });
  fireEvent.click(card.getByRole("button", { name: "Původní fotografie" }));
  expect(card.getByRole("img")).toHaveAttribute("src", "/original.jpg");
  fireEvent.click(screen.getByRole("button", { name: "Uložit fotografie" }));
  await screen.findByText("Změny fotografií jsou uložené na webu.");
  expect(client.getQueryData(["admin-website"])).toEqual({
    values: { "site.agentName": "Vlastní jméno" },
    version: 6,
  });
});
it("keeps a saved removal after loading and allows replacing it from the library", async () => {
  vi.mocked(api).mockResolvedValue({ values: { "image.home": "" }, version: 3 });
  setup();
  const remove = await screen.findByRole("button", {
    name: "Odebrat fotografii: Úvodní fotografie",
  });
  const card = within(remove.closest("section")!);
  expect(card.queryByRole("img")).not.toBeInTheDocument();
  fireEvent.click(card.getByRole("button", { name: "Vybrat z knihovny" }));
  fireEvent.click(screen.getByRole("button", { name: "Nová fotografie Nová fotografie" }));
  expect(card.getByRole("img")).toHaveAttribute("src", "/uploads/test.webp");
  expect(remove).toBeEnabled();
});
it("preserves a selected photograph after a failed save", async () => {
  vi.mocked(api).mockImplementation(async (_path, options) => {
    if (options?.method === "PUT") throw new Error("Obsah mezitím upravil jiný správce.");
    return { values: {}, version: 1 };
  });
  setup();
  await screen.findByLabelText("Stránka nebo sekce");
  fireEvent.click(screen.getAllByRole("button", { name: "Vybrat z knihovny" })[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Nová fotografie Nová fotografie" }));
  fireEvent.click(screen.getByRole("button", { name: "Uložit fotografie" }));
  await screen.findByText("Obsah mezitím upravil jiný správce.");
  expect(screen.getByRole("img", { name: "Úvodní fotografie" })).toHaveAttribute(
    "src",
    "/uploads/test.webp",
  );
  expect(screen.getByRole("button", { name: "Uložit fotografie" })).toBeEnabled();
});
