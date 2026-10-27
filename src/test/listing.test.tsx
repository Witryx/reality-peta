import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Property } from "@/data/types";
import { listAllProperties } from "@/data/properties";
import { Route } from "@/routes/nabidka.index";

vi.mock("@/data/properties", () => ({ listAllProperties: vi.fn() }));

const base: Property = {
  id: "cz-active",
  slug: "cz-active",
  title: "Český byt",
  status: "active",
  offerType: "sale",
  propertyType: "byt",
  disposition: "2+kk",
  location: { city: "Praha", district: "" },
  price: null,
  area: 60,
  ownership: "Osobní",
  condition: "Dobrý",
  energyClass: "C",
  perex: "",
  description: [],
  features: [],
  images: [],
  featured: false,
  sortOrder: 1,
  publishedAt: "2026-10-01",
  isDemo: false,
};
const properties: Property[] = [
  base, // Existing Czech offers do not have to specify a market.
  {
    ...base,
    id: "cz-sold",
    slug: "cz-sold",
    title: "Prodaný český byt",
    market: "cz",
    status: "sold",
  },
  {
    ...base,
    id: "egypt-active",
    slug: "egypt-active",
    title: "Egyptský apartmán",
    market: "egypt",
  },
  {
    ...base,
    id: "egypt-reserved",
    slug: "egypt-reserved",
    title: "Rezervovaná vila",
    market: "egypt",
    status: "reserved",
  },
];

afterEach(cleanup);

async function openListing(url = "/nabidka") {
  vi.mocked(listAllProperties).mockResolvedValue(properties);
  const root = createRootRoute({ component: Outlet });
  // File routes receive these structural options from the generated tree in the app.
  const listing = Route.update({
    id: "/nabidka/",
    path: "/nabidka",
    getParentRoute: () => root,
  } as never);
  const router = createRouter({
    routeTree: root.addChildren([listing]),
    history: createMemoryHistory({ initialEntries: [url] }),
    defaultPendingMinMs: 0,
  });
  await act(async () => {
    await router.load();
  });
  render(<RouterProvider router={router} />);
  return router;
}

describe("Property listing filters", () => {
  it("starts with both countries and preserves each filter while changing the other", async () => {
    const router = await openListing();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    const countries = within(screen.getByRole("group", { name: "Filtr podle země" }));
    const statuses = within(screen.getByRole("group", { name: "Filtr podle stavu" }));

    fireEvent.click(countries.getByRole("link", { name: "Egypt (2)" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
    expect(screen.queryByRole("heading", { name: "Český byt" })).not.toBeInTheDocument();

    expect(statuses.queryByRole("link", { name: /Rezervováno|Prodáno/ })).not.toBeInTheDocument();
    fireEvent.click(statuses.getByRole("link", { name: "Aktivní (1)" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(1));
    expect(screen.getByRole("heading", { name: "Egyptský apartmán" })).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ zeme: "egypt", stav: "active" });

    fireEvent.click(countries.getByRole("link", { name: "Česko (1)" }));
    await screen.findByRole("heading", { name: "Český byt" });
    expect(screen.queryByRole("heading", { name: "Egyptský apartmán" })).not.toBeInTheDocument();
    expect(router.state.location.search).toEqual({ zeme: "cz", stav: "active" });

    fireEvent.click(statuses.getByRole("link", { name: "Vše (2)" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(2));
    expect(screen.getByRole("heading", { name: "Český byt" })).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ zeme: "cz" });
  });

  it("opens a shared link with both filters already applied", async () => {
    await openListing("/nabidka?zeme=egypt&stav=reserved");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Rezervovaná vila" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Egypt (1)" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Všechny země (1)" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
