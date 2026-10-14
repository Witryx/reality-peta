import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CookieConsent } from "@/components/CookieConsent";
import { TrackingScripts } from "@/components/TrackingScripts";
import { agentJsonLd } from "@/lib/seo";
import { site, resolveSiteConfig } from "@/config/site";
import { PageMotion } from "@/components/PageMotion";
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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-start justify-center py-24">
      <h1 className="text-4xl">Stránku se nepodařilo načíst</h1>
      <p className="mt-3 text-muted-foreground">Zkuste to prosím znovu.</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="btn btn-primary"
        >
          Zkusit znovu
        </button>
        <a href="/" className="btn btn-outline">
          Na úvod
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => readWebsiteContent(),
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
  errorComponent: ErrorComponent,
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
  const { queryClient } = Route.useRouteContext();
  const isAdmin = useRouterState({
    select: (state) => state.location.pathname.startsWith("/admin"),
  });
  return (
    <QueryClientProvider client={queryClient}>
      <WebsiteContentContext.Provider value={website.values}>
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
          </>
        )}
      </WebsiteContentContext.Provider>
    </QueryClientProvider>
  );
}
