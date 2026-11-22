import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { reloadOnce } from "@/lib/stale-build";
import { PageError } from "@/components/PageError";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { PromoBar } from "@/components/PromoBar";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { TrackingScripts } from "@/components/TrackingScripts";
import { agentJsonLd, socialImageMeta } from "@/lib/seo";
import { site, resolveSiteConfig } from "@/config/site";
import { PageMotion } from "@/components/PageMotion";
import { GuideCursor } from "@/components/GuideCursor";
import { MobileContactBar } from "@/components/MobileContactBar";
import { readWebsiteContent } from "@/data/website";
import { WebsiteContentContext } from "@/lib/website-context";

function NotFoundComponent() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="eyebrow">Chyba 404</p>
      <h1 className="mt-4 text-5xl">Tuhle stránku jsem nenašel.</h1>
      <Link to="/" className="btn btn-primary mt-8">
        Zpět na úvod
      </Link>
    </div>
  );
}

/** Last texts and photos loaded in this browser, used if a later refresh fails on the way. */
let lastWebsiteContent: Awaited<ReturnType<typeof readWebsiteContent>> | undefined;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Site texts change rarely: no need to ask the server again on every click (admin saves
  // refresh them right away). A failed refresh keeps the texts already shown instead of an error.
  staleTime: 5 * 60_000,
  loader: async () => {
    try {
      lastWebsiteContent = await readWebsiteContent();
      return lastWebsiteContent;
    } catch (error) {
      if (typeof window !== "undefined" && lastWebsiteContent) return lastWebsiteContent;
      throw error;
    }
  },
  head: ({ loaderData }) => {
    const site = resolveSiteConfig(loaderData?.values ?? {});
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: `${site.name} – ${site.claim}` },
        {
          name: "description",
          content:
            "Petr Pavlát reality. Prodej, koupě a pronájem napříč Českem a pomoc s nemovitostmi v Egyptě.",
        },
        { name: "author", content: site.agentName },
        { property: "og:site_name", content: site.name },
        { property: "og:locale", content: "cs_CZ" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...socialImageMeta(loaderData?.values ?? {}),
        { name: "theme-color", content: "#f9f7f2" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.png", type: "image/png" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(agentJsonLd(loaderData?.values ?? {})).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: PageError,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const website = Route.useLoaderData();
  // Remember what the server sent with the page, for a refresh that fails later.
  if (typeof window !== "undefined") lastWebsiteContent = website;
  const { queryClient } = Route.useRouteContext();
  const isAdmin = useRouterState({
    select: (state) => state.location.pathname.startsWith("/admin"),
  });
  useEffect(() => {
    // A code chunk from the previous deployment is gone: load the new version instead of failing.
    const stale = (event: Event) => {
      if (reloadOnce()) event.preventDefault();
    };
    window.addEventListener("vite:preloadError", stale);
    return () => window.removeEventListener("vite:preloadError", stale);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <WebsiteContentContext.Provider value={website.values}>
        {!isAdmin && <PromoBar />}
        {!isAdmin && <SiteHeader />}
        <main id="obsah">
          <Outlet />
        </main>
        {!isAdmin && (
          <>
            <SiteFooter />
            <CookieConsent />
            <TrackingScripts />
            <PageMotion />
            <GuideCursor />
            <MobileContactBar />
          </>
        )}
      </WebsiteContentContext.Provider>
    </QueryClientProvider>
  );
}
