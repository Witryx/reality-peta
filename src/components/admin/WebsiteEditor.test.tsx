import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { WebsiteEditor } from "./WebsiteEditor";
import { api } from "@/lib/api";
import { copyKey } from "@/lib/site-copy";
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
      <WebsiteEditor onDirty={vi.fn()} />
    </QueryClientProvider>,
  );
}
it("saves a public headline and restores its source default with the current concurrency version", async () => {
  vi.mocked(api).mockImplementation(async (path, options) => {
    if (options?.method === "PUT") {
      const draft = JSON.parse(options.body as string);
      return { values: draft.values, version: draft.version + 1 };
    }
    return { values: {}, version: 1 };
  });
  setup();
  const field = await screen.findByLabelText("Co bude váš");
  fireEvent.change(screen.getByLabelText("Najít text"), { target: { value: "Co bude váš" } });
  fireEvent.change(field, { target: { value: "Váš nový domov" } });
  fireEvent.click(screen.getByRole("button", { name: "Uložit texty" }));
  await screen.findByRole("status");
  const writes = vi.mocked(api).mock.calls.filter(([, options]) => options?.method === "PUT");
  expect(JSON.parse(writes[0]![1]!.body as string)).toEqual({
    values: { [copyKey("Co bude váš")]: "Váš nový domov" },
    version: 1,
  });
  fireEvent.click(screen.getByRole("button", { name: "Obnovit původní text 1" }));
  expect(screen.getByLabelText("Co bude váš")).toHaveValue("Co bude váš");
  fireEvent.click(screen.getByRole("button", { name: "Uložit texty" }));
  await waitFor(() =>
    expect(
      vi.mocked(api).mock.calls.filter(([, options]) => options?.method === "PUT"),
    ).toHaveLength(2),
  );
  const lastWrite = vi
    .mocked(api)
    .mock.calls.filter(([, options]) => options?.method === "PUT")[1]!;
  expect(JSON.parse(lastWrite[1]!.body as string)).toEqual({ values: {}, version: 2 });
});
it("retains unsaved text after a failed save", async () => {
  vi.mocked(api).mockImplementation(async (path, options) => {
    if (options?.method === "PUT") throw new Error("Texty mezitím upravil jiný správce.");
    return { values: {}, version: 1 };
  });
  setup();
  const field = await screen.findByLabelText("Co bude váš");
  fireEvent.change(field, { target: { value: "Můj neuložený nadpis" } });
  fireEvent.click(screen.getByRole("button", { name: "Uložit texty" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Texty mezitím upravil jiný správce");
  expect(field).toHaveValue("Můj neuložený nadpis");
});
