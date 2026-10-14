import catalog from "./website-catalog.json";
import { editableSiteFields } from "@/config/site";
export type WebsiteField = {
  key: string;
  default: string;
  groups: string[];
  label?: string;
  kind?: string;
  max?: number;
};
const configurationDefaults = new Set(
  editableSiteFields.map((field) => field.default).filter(Boolean),
);
export const websiteFields: WebsiteField[] = [
  ...catalog.filter((entry) => !configurationDefaults.has(entry.default)),
  ...editableSiteFields.map((field) => ({ ...field, groups: [field.group] })),
];
