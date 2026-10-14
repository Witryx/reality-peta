import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import type { Property } from "@/data/types";
import { NearbyPlaces } from "./NearbyPlaces";
import { nearbyMapUrl } from "@/data/nearby";

const p = {
  location: {
    city: "Praha",
    district: "Vinohrady",
    street: "Mánesova",
    lat: 50.0755,
    lng: 14.4378,
  },
  nearbyPlaces: [
    {
      category: "school",
      name: "ZŠ Komenského",
      address: "Komenského 1",
      distanceMeters: 350,
      distanceType: "walking",
    },
    {
      category: "groceries",
      name: "Potraviny",
      distanceMeters: 180,
      distanceType: "straight_line",
    },
  ],
} as Property;

it("shows real place names, distances and their measuring method with Google links", () => {
  render(<NearbyPlaces p={p} />);
  expect(screen.getByText("350 m")).toBeInTheDocument();
  expect(screen.getByText("180 m")).toBeInTheDocument();
  expect(screen.getByText("pěšky")).toBeInTheDocument();
  expect(screen.getByText("vzdušnou čarou")).toBeInTheDocument();
  const link = screen.getByRole("link", { name: /Škola: ZŠ Komenského, 350 metrů pěšky/ });
  const url = new URL(link.getAttribute("href")!);
  expect(url.hostname).toBe("www.google.com");
  expect(url.searchParams.get("query")).toBe("ZŠ Komenského, Komenského 1, Praha, Česko");
});

it("hides an empty list for old properties", () => {
  const { nearbyPlaces, ...oldProperty } = p;
  const { container } = render(<NearbyPlaces p={oldProperty} />);
  expect(container).toBeEmptyDOMElement();
});

it("opens a walking route from the property coordinates for verification", () => {
  const url = new URL(nearbyMapUrl(p.nearbyPlaces![0]!, p, true));
  expect(url.pathname).toBe("/maps/dir/");
  expect(url.searchParams.get("origin")).toBe("50.0755,14.4378");
  expect(url.searchParams.get("travelmode")).toBe("walking");
  const egyptUrl = new URL(
    nearbyMapUrl(
      p.nearbyPlaces![1]!,
      { market: "egypt", location: { city: "Hurghada", district: "" } },
      true,
    ),
  );
  expect(egyptUrl.pathname).toBe("/maps/search/");
  expect(egyptUrl.searchParams.get("query")).toContain("Egypt");
});
