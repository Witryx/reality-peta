import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { getProperty } from "@/data/properties";
import { formatPrice, type Property } from "@/data/types";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";
import { StatusBadge } from "@/components/PropertyCard";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, Placeholder } from "@/components/ContactLinks";
import { ConsentEmbed } from "@/components/ConsentEmbed";
import { EnergyRating } from "@/components/EnergyRating";
import { PropertyMap } from "@/components/PropertyMap";
import { normalizeVideoUrl } from "@/lib/property-media";

export const Route = createFileRoute("/nabidka/$slug")({
  loader: async ({ params }) => {
    const p = await getProperty(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData, params, matches }) => {
    if (!loaderData)
      return { meta: [{ title: "Nemovitost nenalezena" }, { name: "robots", content: "noindex" }] };
    const p = loaderData;
    const h = pageHead(
      {
        title: `${p.title}, ${p.location.city}`,
        description: p.perex,
        path: `/nabidka/${params.slug}`,
        type: "product",
      },
      websiteValues(matches),
    );
    return {
      ...h,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: p.title,
            description: p.perex,
            datePosted: p.publishedAt,
            url: `/nabidka/${p.slug}`,
            offers: {
              "@type": "Offer",
              ...(p.price ? { price: p.price, priceCurrency: "CZK" } : {}),
              availability:
                p.status === "active"
                  ? "https://schema.org/InStock"
                  : p.status === "reserved"
                    ? "https://schema.org/LimitedAvailability"
                    : "https://schema.org/SoldOut",
              seller: { "@type": "RealEstateAgent", name: site.name },
            },
            about: {
              "@type": p.propertyType === "dům" ? "SingleFamilyResidence" : "Apartment",
              floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "MTK" },
              address: {
                "@type": "PostalAddress",
                addressLocality: p.location.city,
                addressCountry: p.market === "egypt" ? "EG" : "CZ",
              },
            },
          }).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-24">
      <h1 className="text-4xl">
        <SiteText>{"Tato nemovitost už není v nabídce."}</SiteText>
      </h1>
      <Link to="/nabidka" className="btn btn-primary mt-8">
        <SiteText>{"Zpět na nabídku"}</SiteText>
      </Link>
    </div>
  ),
  component: Detail,
});

function Gallery({ p }: { p: Property }) {
  const imgs = [...p.images].sort((a, b) => a.position - b.position);
  const [i, setI] = useState(0);
  const go = (d: number) => setI((i + d + imgs.length) % imgs.length);
  return (
    <div>
      <div
        className="relative overflow-hidden rounded-lg bg-muted"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <img
          src={imgs[i]?.src}
          alt={imgs[i]?.alt ?? ""}
          width={1600}
          height={1066}
          className="aspect-[3/2] w-full object-cover"
        />
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Předchozí fotografie"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Další fotografie"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/90 p-2"
            >
              <ChevronRight />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-card/90 px-3 py-1 text-xs">
              {i + 1} / <SiteText>{imgs.length}</SiteText>
            </span>
          </>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {imgs.map((im, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Zobrazit fotografii ${idx + 1}`}
            aria-current={idx === i}
            className={`overflow-hidden rounded ${idx === i ? "ring-2 ring-accent" : "opacity-70 hover:opacity-100"}`}
          >
            <img
              src={im.src}
              alt=""
              loading="lazy"
              width={300}
              height={200}
              className="aspect-[3/2] w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function Detail() {
  const p = Route.useLoaderData();
  const params: [string, string | undefined][] = [
    ["Dispozice", p.disposition],
    ["Užitná plocha", `${p.area} m²`],
    ["Pozemek", p.landArea ? `${p.landArea} m²` : undefined],
    ["Podlaží", p.floor],
    ["Vlastnictví", p.ownership],
    ["Stav", p.condition],
    ["Stavba", p.building],
  ];
  const closed = p.status !== "active";
  const video = normalizeVideoUrl(p.videoUrl || "");
  return (
    <article className="container-page py-10 md:py-16">
      <nav aria-label="Drobečková navigace" className="text-sm text-muted-foreground">
        <Link to="/nabidka" className="hover:underline">
          <SiteText>{"Nabídka"}</SiteText>
        </Link>
        {<SiteText> </SiteText>}
        <span aria-hidden>/</span> <span>{p.title}</span>
      </nav>
      <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex gap-2">
            <StatusBadge status={p.status} />
            {p.isDemo && (
              <Placeholder>
                <SiteText>{"Ukázková nabídka"}</SiteText>
              </Placeholder>
            )}
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl md:text-6xl">{p.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {[p.location.street, p.location.district, p.location.city].filter(Boolean).join(", ")}
          </p>
        </div>
        <p className="font-display text-3xl md:text-4xl">
          {p.status === "sold" ? "Prodáno" : formatPrice(p)}
        </p>
      </header>

      <div className="mt-10">
        <Gallery p={p} />
      </div>

      <div className="mt-14 grid gap-14 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="font-display text-2xl leading-snug">{p.perex}</p>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            {p.description.map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </div>

          <h2 className="mt-14 text-3xl">
            <SiteText>{"Parametry"}</SiteText>
          </h2>
          <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2">
            {params
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-3 sm:mr-8">
                  <dt className="text-muted-foreground">
                    <SiteText>{k}</SiteText>
                  </dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
          </dl>
          <EnergyRating value={p.energyClass} />

          <h2 className="mt-14 text-3xl">
            <SiteText>{"Vybavení"}</SiteText>
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.features.map((f) => (
              <li key={f} className="rounded-full border px-4 py-1.5 text-sm">
                <SiteText>{f}</SiteText>
              </li>
            ))}
          </ul>

          <h2 className="mt-14 text-3xl">
            <SiteText>{"Lokalita"}</SiteText>
          </h2>
          <PropertyMap p={p} />

          <h2 className="mt-14 text-3xl">
            <SiteText>{"Video a virtuální prohlídka"}</SiteText>
          </h2>
          {video && <ConsentEmbed src={video} title={`Video – ${p.title}`} />}
          {p.matterportUrl && (
            <ConsentEmbed src={p.matterportUrl} title={`Virtuální prohlídka – ${p.title}`} />
          )}
          {!p.matterportUrl && !video && (
            <p className="mt-4">
              <Placeholder>
                <SiteText>{"Video / Matterport URL – doplnit v administraci"}</SiteText>
              </Placeholder>
            </p>
          )}
        </div>

        <aside className="self-start">
          <div className="rounded-lg border bg-card p-6 md:p-8">
            <h2 className="text-2xl">
              <SiteText>{closed ? "Hledáte podobnou nemovitost?" : "Domluvit prohlídku"}</SiteText>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <SiteText>
                {closed
                  ? "Tato nabídka už není dostupná. Napište mi, co hledáte – dám vědět jako prvním."
                  : "Rád vám nemovitost ukážu osobně."}
              </SiteText>
            </p>
            <div className="mt-6">
              <LeadForm
                kind="property_inquiry"
                propertySlug={p.slug}
                submitLabel={closed ? "Odeslat poptávku" : "Chci na prohlídku"}
                defaultMessage={
                  closed ? "" : `Dobrý den, mám zájem o prohlídku nemovitosti „${p.title}“.`
                }
              />
            </div>
            <ContactLinks className="mt-6 text-sm" />
          </div>
        </aside>
      </div>
    </article>
  );
}
