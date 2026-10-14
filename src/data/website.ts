import { createServerFn } from "@tanstack/react-start";
import type { WebsiteContent } from "@/lib/site-copy";

export const readWebsiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<WebsiteContent> => {
    const { getDatabase, hasDatabase } = await import("@/server/database.server");
    if (!hasDatabase()) return { values: {}, version: 1 };
    const { loadWebsiteContent } = await import("@/server/website.server");
    return loadWebsiteContent(await getDatabase());
  },
);
