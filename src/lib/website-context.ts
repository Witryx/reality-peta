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

export function useWebsiteImage(
  key: import("@/data/website-images").WebsiteImageKey | undefined,
  fallback: string,
) {
  const values = useContext(WebsiteContentContext);
  return key ? (values[key] ?? fallback) : fallback;
}
export function useWebsiteImageAlt(
  key: import("@/data/website-images").WebsiteImageKey | undefined,
  fallback: string,
) {
  const values = useContext(WebsiteContentContext);
  return key ? (values[`${key}.alt`] ?? fallback) : fallback;
}
