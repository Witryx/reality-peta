import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { getProperty } from "@/data/properties";
import { formatPrice } from "@/data/types";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";
import { StatusBadge } from "@/components/PropertyCard";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, Placeholder } from "@/components/ContactLinks";
import { ConsentEmbed } from "@/components/ConsentEmbed";
import { PropertyParameters } from "@/components/PropertyParameters";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyMap } from "@/components/PropertyMap";
import { PropertyContactCta } from "@/components/PropertyContactCta";
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

function Detail() {
  const p = Route.useLoaderData();
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
      <header className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex gap-2">
            <StatusBadge status={p.status} />
            {p.isDemo && (
              <Placeholder>
                <SiteText>{"Ukázková nabídka"}</SiteText>
              </Placeholder>
            )}
          </div>
          <h1 className="property-title mt-4 max-w-3xl text-3xl md:text-[2.75rem]">{p.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-4" aria-hidden />
            {[p.location.street, p.location.district, p.location.city].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="shrink-0">
          <p className="text-2xl font-bold md:text-3xl">
            {p.status === "sold" ? "Prodáno" : formatPrice(p)}
          </p>
          {p.price !== null && p.status !== "sold" && (
            <p className="mt-1 text-sm text-muted-foreground">
              <SiteText>{"Cena včetně provize RK."}</SiteText>
            </p>
          )}
        </div>
      </header>

      <div className="mt-10">
        <PropertyGallery key={p.id} p={p} />
      </div>

      <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="font-sans text-xl leading-relaxed md:text-[1.375rem]">{p.perex}</p>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
            {p.description.map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </div>

          {p.priceNote && <p className="property-price-note mt-6">{p.priceNote}</p>}
          <PropertyParameters p={p} />

          <h2 className="mt-14 text-3xl">
            <SiteText>{"Lokalita"}</SiteText>
          </h2>
          <PropertyMap p={p} />

          {(video || p.matterportUrl) && (
            <>
              <h2 className="mt-14 text-3xl">
                <SiteText>{"Video a virtuální prohlídka"}</SiteText>
              </h2>
              {video && <ConsentEmbed src={video} title={`Video – ${p.title}`} />}
              {p.matterportUrl && (
                <ConsentEmbed src={p.matterportUrl} title={`Virtuální prohlídka – ${p.title}`} />
              )}
            </>
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
      <PropertyContactCta className="mt-14 md:mt-20 [&_h2]:text-2xl md:[&_h2]:text-3xl [&_p]:text-base" />
    </article>
  );
}
