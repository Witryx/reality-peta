import { createContext, useContext } from "react";
import { resolveCopy } from "./site-copy";
import { resolveSiteConfig } from "@/config/site";
export const WebsiteContentContext = createContext<Record<string, string>>({});
export function useSiteCopy() {
  const values = useContext(WebsiteContentContext);
  return (text: string) => resolveCopy(values, text);
}
export function useSiteConfig() {
  return resolveSiteConfig(useContext(WebsiteContentContext));
}
