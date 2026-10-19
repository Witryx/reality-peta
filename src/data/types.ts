/**
 * Sdílený model veřejných nabídek a administrace.
 * PostgreSQL ukládá tato pole v properties.data (JSONB), včetně pořadí galerie.
 * Publikace, verze a interní metadata jsou oddělené od veřejného modelu.
 */
export type PropertyStatus = "active" | "reserved" | "sold";
export type OfferType = "sale" | "rent";

export interface NearbyPlace {
  category:
    | "school"
    | "kindergarten"
    | "groceries"
    | "post_office"
    | "doctor"
    | "pharmacy"
    | "transport"
    | "park"
    | "other";
  name: string;
  address?: string;
  /** Ručně ověřená vzdálenost od nemovitosti v metrech. */
  distanceMeters: number;
  distanceType: "walking" | "straight_line";
}

export interface PropertyImage {
  src: string;
  alt: string;
  /** Pořadí v galerii (0 = titulní fotka). */
  position: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  status: PropertyStatus;
  offerType: OfferType;
  propertyType: "byt" | "dům" | "pozemek" | "komerční";
  disposition: string; // např. "3+kk"
  location: { city: string; district: string; street?: string; lat?: number; lng?: number };
  /** Trh: cz = Česko (výchozí), egypt = nemovitosti v Egyptě */
  market?: "cz" | "egypt";
  price: number | null; // null = cena na vyžádání
  priceNote?: string;
  /** Volitelný popis záloh, např. měsíčních služeb a energií u pronájmu. */
  advancePayments?: string;
  area: number; // m² užitné plochy
  landArea?: number;
  floor?: string;
  ownership: string;
  condition: string;
  energyClass: string; // A–G, "pending" = G do dodání průkazu, "—" = neuvedeno
  building?: string;
  /** Majitelem zadaný termín, např. „Ihned“, „Od 1. 12. 2026“ nebo „Dohodou“. */
  availableFrom?: string;
  perex: string;
  description: string[]; // odstavce
  features: string[];
  /** Vlastní pojmenované řádky v podsekci Další parametry. */
  additionalParameters?: { label: string; value: string }[];
  images: PropertyImage[];
  videoUrl?: string;
  matterportUrl?: string;
  nearbyPlaces?: NearbyPlace[];
  featured: boolean;
  sortOrder: number;
  publishedAt: string; // ISO datum
  /** true = ukázková data, ne reálná nabídka */
  isDemo: boolean;
}

export const statusLabel: Record<PropertyStatus, string> = {
  active: "Aktivní",
  reserved: "Rezervováno",
  sold: "Prodáno",
};

export const marketLabel: Record<NonNullable<Property["market"]>, string> = {
  cz: "Česko",
  egypt: "Egypt",
};

export function formatPrice(p: Property) {
  if (p.price === null) return "Cena na vyžádání";
  const v = new Intl.NumberFormat("cs-CZ").format(p.price) + " Kč";
  return p.offerType === "rent" ? `${v} / měsíc` : v;
}
