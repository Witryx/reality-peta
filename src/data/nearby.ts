import type { NearbyPlace, Property } from "./types";

export const nearbyCategories = [
  "school",
  "kindergarten",
  "groceries",
  "post_office",
  "doctor",
  "pharmacy",
  "transport",
  "park",
  "other",
] as const;
export const nearbyCategoryLabels: Record<NearbyPlace["category"], string> = {
  school: "Škola",
  kindergarten: "Školka",
  groceries: "Potraviny",
  post_office: "Pošta",
  doctor: "Lékař",
  pharmacy: "Lékárna",
  transport: "Zastávka",
  park: "Park",
  other: "Další místo",
};
export const nearbyDistanceLabels = { walking: "pěšky", straight_line: "vzdušnou čarou" } as const;

export function nearbyMapUrl(
  place: NearbyPlace,
  property: Pick<Property, "location" | "market">,
  directions = false,
) {
  const country = property.market === "egypt" ? "Egypt" : "Česko";
  const destination = [place.name, place.address, property.location.city, country]
    .filter(Boolean)
    .join(", ");
  const params = new URLSearchParams({ api: "1" });
  if (directions && place.distanceType === "walking") {
    const { lat, lng, street, district, city } = property.location;
    const origin =
      lat !== undefined && lng !== undefined
        ? `${lat},${lng}`
        : [street, district, city, country].filter(Boolean).join(", ");
    params.set("origin", origin);
    params.set("destination", destination);
    params.set("travelmode", "walking");
    return `https://www.google.com/maps/dir/?${params}`;
  }
  params.set("query", destination);
  return `https://www.google.com/maps/search/?${params}`;
}
