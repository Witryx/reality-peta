import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropertyEditor } from "./PropertyEditor";
import type { AdminProperty } from "@/data/admin";
import { api } from "@/lib/api";
import { propertySchema } from "@/server/validation";
vi.mock("@/lib/api", () => ({ api: vi.fn(), ApiError: class extends Error {} }));
const initial: AdminProperty = {
  id: "2ab58016-58e4-4260-94bd-cb60d2395400",
  title: "Světlý byt 3+kk",
  slug: "svetly-byt",
  publication: "draft",
  status: "active",
  offerType: "sale",
  propertyType: "byt",
  market: "cz",
  disposition: "3+kk",
  location: { city: "Praha", district: "Vinohrady" },
  price: 4000000,
  area: 70,
  ownership: "Osobní",
  condition: "Dobrý",
  energyClass: "C",
  perex: "Světlý byt ve výborné lokalitě.",
  description: ["Podrobný popis bytu pro zájemce."],
  features: ["Balkon"],
  images: [
    { src: "https://example.com/first.jpg", alt: "První", position: 0 },
    { src: "https://example.com/second.jpg", alt: "Druhá", position: 1 },
  ],
  featured: false,
  sortOrder: 1,
  publishedAt: "2026-01-01",
  isDemo: false,
  version: 4,
  createdAt: "",
  updatedAt: "",
};
afterEach(() => vi.clearAllMocks());
describe("Property editor workflow", () => {
  it("regenerates a duplicated draft URL on rename and saves custom parameters and photo positions", async () => {
    vi.mocked(api).mockResolvedValue({});
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <PropertyEditor
        initial={{ ...initial, title: `${initial.title} – kopie`, slug: "svetly-byt-kopie-123456" }}
        media={[]}
        onCancel={vi.fn()}
        onSaved={saved}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Název nemovitosti *"), {
      target: { value: "Nový byt v Karlíně" },
    });
    for (const type of ["chata", "chalupa", "garáž", "atypický", "usedlost", "statek", "ostatní"]) {
      expect(screen.getByRole("option", { name: type })).toHaveValue(type);
      expect(propertySchema.parse({ ...initial, propertyType: type }).propertyType).toBe(type);
    }
    fireEvent.change(screen.getByLabelText("Typ nemovitosti"), { target: { value: "chata" } });
    expect(screen.getByLabelText("Adresa nabídky (URL) *")).toHaveValue("novy-byt-v-karline");
    fireEvent.change(screen.getByLabelText("Pozice fotografie 2"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Přidat parametr" }));
    fireEvent.change(screen.getByLabelText("Název parametru 1"), {
      target: { value: "Infrastruktura" },
    });
    fireEvent.change(screen.getByLabelText("Hodnota parametru 1"), {
      target: { value: "Vodovod, kanalizace" },
    });
    fireEvent.change(screen.getByLabelText("Termín nastěhování"), {
      target: { value: "Od 1. 12. 2026" },
    });
    fireEvent.change(screen.getByLabelText("Zálohy"), {
      target: { value: "3 500 Kč měsíčně za služby a energie" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    const payload = JSON.parse(vi.mocked(api).mock.calls[0]![1]!.body as string);
    expect(payload).toMatchObject({
      slug: "novy-byt-v-karline",
      propertyType: "chata",
      autoSlug: true,
      additionalParameters: [{ label: "Infrastruktura", value: "Vodovod, kanalizace" }],
      availableFrom: "Od 1. 12. 2026",
      advancePayments: "3 500 Kč měsíčně za služby a energie",
    });
    expect(payload.images).toEqual([
      { ...initial.images[1], position: 0 },
      { ...initial.images[0], position: 1 },
    ]);
  });
  it("keeps manually entered and published URLs stable when the title changes", () => {
    const { unmount } = render(
      <PropertyEditor
        initial={initial}
        media={[]}
        onCancel={vi.fn()}
        onSaved={vi.fn()}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Adresa nabídky (URL) *"), {
      target: { value: "moje-vlastni-url" },
    });
    fireEvent.change(screen.getByLabelText("Název nemovitosti *"), {
      target: { value: "Jiný název bytu" },
    });
    expect(screen.getByLabelText("Adresa nabídky (URL) *")).toHaveValue("moje-vlastni-url");
    unmount();
    render(
      <PropertyEditor
        initial={{ ...initial, publication: "published" }}
        media={[]}
        onCancel={vi.fn()}
        onSaved={vi.fn()}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Název nemovitosti *"), {
      target: { value: "Jiný název bytu" },
    });
    expect(screen.getByLabelText("Adresa nabídky (URL) *")).toHaveValue(initial.slug);
  });
  it("requires distances and saves reordered nearby places, including removals", async () => {
    vi.mocked(api).mockResolvedValue({});
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <PropertyEditor
        initial={initial}
        media={[]}
        onCancel={vi.fn()}
        onSaved={saved}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Přidat místo v okolí" }));
    fireEvent.change(screen.getByLabelText("Název místa 1 *"), {
      target: { value: "ZŠ Komenského" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    expect(api).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Vzdálenost místa 1 (m) *")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    fireEvent.change(screen.getByLabelText("Vzdálenost místa 1 (m) *"), {
      target: { value: "350" },
    });
    fireEvent.change(screen.getByLabelText("Adresa místa 1 (volitelné)"), {
      target: { value: "Komenského 1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Přidat místo v okolí" }));
    fireEvent.change(screen.getByLabelText("Název místa 2 *"), { target: { value: "Potraviny" } });
    fireEvent.change(screen.getByLabelText("Kategorie místa 2"), {
      target: { value: "groceries" },
    });
    fireEvent.change(screen.getByLabelText("Vzdálenost místa 2 (m) *"), {
      target: { value: "180" },
    });
    fireEvent.change(screen.getByLabelText("Způsob měření místa 2"), {
      target: { value: "straight_line" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Posunout místo 2 nahoru" }));
    expect(screen.getByLabelText("Název místa 1 *")).toHaveValue("Potraviny");
    fireEvent.click(screen.getByRole("button", { name: "Přidat místo v okolí" }));
    fireEvent.click(screen.getByRole("button", { name: "Odebrat místo 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(JSON.parse(vi.mocked(api).mock.calls[0]![1]!.body as string).nearbyPlaces).toEqual([
      {
        category: "groceries",
        name: "Potraviny",
        distanceMeters: 180,
        distanceType: "straight_line",
      },
      {
        category: "school",
        name: "ZŠ Komenského",
        address: "Komenského 1",
        distanceMeters: 350,
        distanceType: "walking",
      },
    ]);
  });
  it("saves ordinary YouTube links, the pending energy class and map coordinates", async () => {
    vi.mocked(api).mockResolvedValue({});
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <PropertyEditor
        initial={initial}
        media={[]}
        onCancel={vi.fn()}
        onSaved={saved}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Video (odkaz na YouTube / Vimeo)"), {
      target: { value: "https://youtu.be/M7lc1UVf-VE?si=sharing" },
    });
    fireEvent.change(screen.getByLabelText("Energetická třída"), { target: { value: "pending" } });
    fireEvent.change(screen.getByLabelText("Zeměpisná šířka (volitelné)"), {
      target: { value: "50.0755" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    expect(api).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Zkontrolujte označená pole");
    fireEvent.change(screen.getByLabelText(/Zeměpisná délka \(volitelné\)/), {
      target: { value: "14.4378" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    expect(JSON.parse(vi.mocked(api).mock.calls[0]![1]!.body as string)).toMatchObject({
      videoUrl: "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE",
      energyClass: "pending",
      location: { lat: 50.0755, lng: 14.4378 },
      version: 4,
    });
  });
  it("saves publication, edited fields, gallery order and the concurrency version", async () => {
    vi.mocked(api).mockResolvedValue({});
    const saved = vi.fn().mockResolvedValue(undefined);
    render(
      <PropertyEditor
        initial={initial}
        media={[]}
        onCancel={vi.fn()}
        onSaved={saved}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Název nemovitosti *"), {
      target: { value: "Upravený název nemovitosti" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Posunout fotografii dopředu" })[1]!);
    fireEvent.click(screen.getByRole("button", { name: "Uložit a zveřejnit" }));
    await waitFor(() => expect(saved).toHaveBeenCalledOnce());
    const [endpoint, options] = vi.mocked(api).mock.calls[0]!;
    expect(endpoint).toBe(`/api/admin/properties/${initial.id}`);
    const payload = JSON.parse(options!.body as string);
    expect(payload).toMatchObject({
      title: "Upravený název nemovitosti",
      publication: "published",
      version: 4,
    });
    expect(payload.images[0].src).toBe("https://example.com/second.jpg");
  });
  it("keeps failed saves in the editor so users can recover their changes", async () => {
    vi.mocked(api).mockRejectedValue(new Error("Konflikt změn."));
    const saved = vi.fn();
    render(
      <PropertyEditor
        initial={initial}
        media={[]}
        onCancel={vi.fn()}
        onSaved={saved}
        onMediaChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Uložit změny" }));
    await screen.findByRole("alert");
    expect(screen.getByRole("alert")).toHaveTextContent("Konflikt změn.");
    expect(saved).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Název nemovitosti *")).toHaveValue(initial.title);
  });
});
