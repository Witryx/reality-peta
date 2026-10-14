import type { ReactNode } from "react";
import { useSiteCopy } from "@/lib/website-context";
export function SiteText({ children }: { children: ReactNode }) {
  const copy = useSiteCopy();
  return <>{typeof children === "string" ? copy(children) : children}</>;
}
