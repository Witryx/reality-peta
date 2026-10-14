import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { listProperties } from "@/data/properties";
import { statusLabel, type PropertyStatus } from "@/data/types";
import { pageHead, websiteValues } from "@/lib/seo";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHead } from "@/components/Sections";

const search = z.object({ stav: z.enum(["active", "reserved", "sold"]).optional() });

export const Route = createFileRoute("/nabidka/")({
  validateSearch: search,
  loader: () => listProperties(),
  head: ({ matches }) =>
    pageHead(
      {
        title: "Nabídka nemovitostí",
        description:
          "Nabídka nemovitostí Petr Pavlát reality pro klienty napříč Českem. Prohlédněte si aktivní, rezervované i prodané nemovitosti.",
        path: "/nabidka",
      },
      websiteValues(matches),
    ),
  component: Listing,
});

const filters: (PropertyStatus | undefined)[] = [undefined, "active", "reserved", "sold"];

function Listing() {
  const all = Route.useLoaderData();
  const { stav } = Route.useSearch();
  const items = stav ? all.filter((p) => p.status === stav) : all;
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHead
        eyebrow="Nabídka"
        title="Nemovitosti"
        intro="Každou nemovitost osobně znám a rád vám o ní řeknu víc."
      />
      <div role="group" aria-label="Filtr podle stavu" className="mt-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = stav === f;
          const count = f ? all.filter((p) => p.status === f).length : all.length;
          return (
            <Link
              key={f ?? "all"}
              to="/nabidka"
              search={f ? { stav: f } : {}}
              aria-pressed={active}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground"}`}
            >
              <SiteText>{f ? statusLabel[f] : "Vše"}</SiteText>
              <SiteText> </SiteText>
              <span className="opacity-60">
                (<SiteText>{count}</SiteText>)
              </span>
            </Link>
          );
        })}
      </div>
      {items.length ? (
        <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <PropertyCard key={p.id} p={p} eager={i < 3} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-muted-foreground">
          <SiteText>{"V této kategorii teď nic není."}</SiteText>
        </p>
      )}
    </div>
  );
}
