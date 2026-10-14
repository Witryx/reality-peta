import type { Property } from "./types";
export type Publication = "draft" | "published" | "archived";
export interface AdminProperty extends Property {
  publication: Publication;
  version: number;
  createdAt: string;
  updatedAt: string;
}
export interface Lead {
  id: string;
  kind: "contact" | "valuation" | "property_inquiry";
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  property_slug: string | null;
  property_type: string | null;
  property_location: string | null;
  property_size: string | null;
  status: "new" | "contacted" | "in_progress" | "closed";
  notes: string;
  created_at: string;
  updated_at: string;
}
export interface Media {
  id: string;
  filename: string;
  original_name: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}
export const publicationLabel: Record<Publication, string> = {
  draft: "Koncept",
  published: "Zveřejněno",
  archived: "Archiv",
};
export const leadStatusLabel: Record<Lead["status"], string> = {
  new: "Nová",
  contacted: "Kontaktováno",
  in_progress: "V řešení",
  closed: "Uzavřeno",
};
export const leadKindLabel: Record<Lead["kind"], string> = {
  contact: "Kontakt",
  valuation: "Odhad ceny",
  property_inquiry: "Zájem o nabídku",
};
