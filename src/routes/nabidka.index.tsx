import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { listAllProperties } from "@/data/properties";
import { marketLabel, statusLabel, type Property, type PropertyStatus } from "@/data/types";
import { pageHead, websiteValues } from "@/lib/seo";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyContactCta } from "@/components/PropertyContactCta";
import { SectionHead } from "@/components/Sections";
import { CompactPropertyGrid } from "@/components/HomeSections";
import { CzechMap } from "@/components/CzechMap";
import { listCzechMapPins } from "@/data/czech-map";

const search = z.object({
  stav: z.enum(["active", "reserved", "sold"]).optional(),
  zeme: z.enum(["cz", "egypt"]).optional(),
});

export const Route = createFileRoute("/nabidka/")({
  validateSearch: search,
  loader: async () => ({ all: await listAllProperties(), mapPins: await listCzechMapPins() }),
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

const filters = [undefined, "active"] as const;
const markets = [undefined, "cz", "egypt"] as const;
const marketOf = (property: Property) => property.market ?? "cz";

const filterClass = (active: boolean) =>
  `rounded-full border px-4 py-2 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground"}`;

function Listing() {
  const { all, mapPins } = Route.useLoaderData();
  const { stav, zeme } = Route.useSearch();
  // Sold listings never mix with the current offer: they get their own folded section below.
  const inMarket = zeme ? all.filter((p) => marketOf(p) === zeme) : all;
  const offer = (list: Property[]) => list.filter((p) => p.status !== "sold");
  const inStatus = stav ? all.filter((p) => p.status === stav) : offer(all);
  const current = stav
    ? inMarket.filter((p) => p.status === stav && stav !== "sold")
    : offer(inMarket);
  const sold = inMarket.filter((p) => p.status === "sold");
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHead
        eyebrow="Nabídka"
        title="Nemovitosti"
        intro="Každou nemovitost osobně znám a rád vám o ní řeknu víc."
      />
      <div className="mt-10 grid items-center gap-6 lg:grid-cols-[1fr_minmax(0,21rem)] lg:gap-10">
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          <SiteText>
            {"Nejsem jen pražský makléř. Pomáhám po celém Česku – a na mapě vidíte, kde všude už."}
          </SiteText>
        </p>
        <CzechMap pins={mapPins} className="offer-map" />
      </div>
      <div role="group" aria-label="Filtr podle země" className="mt-10 flex flex-wrap gap-2">
        {markets.map((market) => {
          const active = zeme === market;
          const count = market
            ? inStatus.filter((p) => marketOf(p) === market).length
            : inStatus.length;
          return (
            <Link
              key={market ?? "all"}
              to="/nabidka"
              search={{ stav, zeme: market }}
              activeOptions={{ exact: true, explicitUndefined: true }}
              className={filterClass(active)}
            >
              <SiteText>{market ? marketLabel[market] : "Všechny země"}</SiteText>
              {<SiteText> </SiteText>}
              <span className="opacity-60">({<SiteText>{count}</SiteText>})</span>
            </Link>
          );
        })}
      </div>
      <div role="group" aria-label="Filtr podle stavu" className="mt-3 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = stav === f;
          const count = f ? inMarket.filter((p) => p.status === f).length : offer(inMarket).length;
          return (
            <Link
              key={f ?? "all"}
              to="/nabidka"
              search={{ stav: f, zeme }}
              activeOptions={{ exact: true, explicitUndefined: true }}
              className={filterClass(active)}
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
      {current.length ? (
        <OfferList items={current} />
      ) : (
        <p className="mt-12 text-muted-foreground">
          <SiteText>{"V této kategorii teď nic není."}</SiteText>
        </p>
      )}
      {sold.length > 0 && (
        // Sold listings wait at the bottom, folded away; only the curious open them.
        <details className="sold-offers mt-16 border-t pt-8" open={stav === "sold"}>
          <summary className="cursor-pointer text-lg font-medium focus-visible:outline-ring">
            <SiteText>{"Prodané nemovitosti"}</SiteText>{" "}
            <span className="opacity-60">({sold.length})</span>
          </summary>
          <p className="mt-4 text-muted-foreground">
            <SiteText>{"Nemovitosti, které už mají nové majitele."}</SiteText>
          </p>
          <OfferList items={sold} layout="sold-grid" />
        </details>
      )}
      <PropertyContactCta />
    </div>
  );
}

/** Phones get swipeable Czech/Egypt rows (like the homepage), larger screens a grid. */
function OfferList({ items, layout = "grid" }: { items: Property[]; layout?: string }) {
  return (
    <>
      <div className="offer-rails sm:hidden">
        {markets
          .filter((market): market is "cz" | "egypt" => Boolean(market))
          .map((market) => ({ market, list: items.filter((p) => marketOf(p) === market) }))
          .filter(({ list }) => list.length > 0)
          .map(({ market, list }) => (
            <section key={market} className="offer-rail-group" aria-label={marketLabel[market]}>
              <h2 className="offer-rail-title">
                <SiteText>{marketLabel[market]}</SiteText>{" "}
                <span className="opacity-60">({list.length})</span>
              </h2>
              <CompactPropertyGrid properties={list} limit={list.length} className="mt-4" />
            </section>
          ))}
      </div>
      <div
        data-layout={layout}
        className="mt-12 hidden gap-x-8 gap-y-14 sm:grid sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((p) => (
          <PropertyCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );
}
