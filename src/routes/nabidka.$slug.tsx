import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BellRing, KeyRound, Lock, MapPin } from "lucide-react";
import { z } from "zod";
import { getProperty, getSharedProperty, listAllProperties } from "@/data/properties";
import { formatPrice, type Property } from "@/data/types";
import { pageHead, websiteValues } from "@/lib/seo";
import { site } from "@/config/site";
import { PropertyCard, StatusBadge } from "@/components/PropertyCard";
import { ShareButtons } from "@/components/ShareButtons";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, Placeholder } from "@/components/ContactLinks";
import { ConsentEmbed } from "@/components/ConsentEmbed";
import { PropertyParameters } from "@/components/PropertyParameters";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyMap } from "@/components/PropertyMap";
import { PropertyContactCta } from "@/components/PropertyContactCta";
import { normalizeVideoUrl } from "@/lib/property-media";
import { photoAt } from "@/lib/photo-src";

/** „Připravuji“ listing seen without its share link: only the public teaser arrived. */
const isTeaser = (p: Property) => p.status === "upcoming" && !p.perex;

export const Route = createFileRoute("/nabidka/$slug")({
  validateSearch: z.object({ klic: z.string().max(64).optional() }),
  loaderDeps: ({ search }) => ({ klic: search.klic }),
  loader: async ({ params, deps }) => {
    const shared = deps.klic ? await getSharedProperty(params.slug, deps.klic) : null;
    const p = shared ?? (await getProperty(params.slug));
    if (!p) throw notFound();
    // Up to three other active listings from the same market, so a visitor has where to go on.
    const market = p.market ?? "cz";
    const similar = (await listAllProperties())
      .filter((x) => x.slug !== p.slug && (x.market ?? "cz") === market && x.status === "active")
      .slice(0, 3);
    return { p, similar };
  },
  head: ({ loaderData, params, matches }) => {
    if (!loaderData)
      return { meta: [{ title: "Nemovitost nenalezena" }, { name: "robots", content: "noindex" }] };
    const { p } = loaderData;
    if (p.status === "upcoming") {
      const h = pageHead(
        {
          title: `Připravuji: ${p.title}, ${p.location.city}`,
          description:
            "Nemovitost, kterou připravuji k prodeji. Dejte mi vědět a uvidíte ji jako první.",
          path: `/nabidka/${params.slug}`,
        },
        websiteValues(matches),
      );
      return { ...h, meta: [...(h.meta ?? []), { name: "robots", content: "noindex" }] };
    }
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
  const { p, similar } = Route.useLoaderData();
  if (isTeaser(p)) return <UpcomingTeaser p={p} />;
  const shared = p.status === "upcoming";
  const closed = p.status !== "active" && !shared;
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
      {shared && (
        <p className="upcoming-shared-note mt-6">
          <KeyRound aria-hidden />
          <SiteText>
            {"Exkluzivní náhled: tuto nabídku zatím vidíte jen Vy, ještě před zveřejněním."}
          </SiteText>
        </p>
      )}
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
          <ShareButtons title={p.title} />
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
            <p className="mt-6 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Vlastní nabídka makléře Petra Pavláta. Jednáte přímo se mnou – od první otázky až po předání klíčů."
                }
              </SiteText>
            </p>
          </div>
        </aside>
      </div>
      {similar.length > 0 && (
        <section className="mt-14 md:mt-20" aria-labelledby="similar-title">
          <h2 id="similar-title" className="text-3xl">
            <SiteText>{"Mohlo by Vás zajímat"}</SiteText>
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((x) => (
              <PropertyCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}
      <PropertyContactCta className="mt-14 md:mt-20 [&_h2]:text-2xl md:[&_h2]:text-3xl [&_p]:text-base" />
    </article>
  );
}

const blurredLines = [
  "Světlé a dobře řešené bydlení v klidné části obce, kde se dobře žije celý rok.",
  "Dispozice, stav i okolí odpovídají tomu, co dnes kupující nejčastěji hledají.",
  "Podrobnosti, fotografie a cenu pošlu nejdřív těm, kdo se ozvou předem.",
  "Prohlídku domluvíme podle Vašich možností, klidně ještě před spuštěním inzerce.",
];

/** „Připravuji“ without the share link: basic facts, blurred text and an interest form. */
function UpcomingTeaser({ p }: { p: Property }) {
  const cover = p.images[0];
  const place = [p.location.district, p.location.city].filter(Boolean).join(", ");
  return (
    <article className="container-page py-10 md:py-16">
      <nav aria-label="Drobečková navigace" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          <SiteText>{"Úvod"}</SiteText>
        </Link>{" "}
        <span aria-hidden>/</span> <span>{p.title}</span>
      </nav>
      <header className="mt-6">
        <StatusBadge status={p.status} />
        <h1 className="property-title mt-4 max-w-3xl text-3xl md:text-[2.75rem]">{p.title}</h1>
        <p className="mt-3 flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4" aria-hidden />
          {place}
        </p>
      </header>

      <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          <div className="upcoming-detail-photo">
            {cover && (
              <img
                src={photoAt(cover.src, 960)}
                alt=""
                aria-hidden
                width={1200}
                height={675}
                decoding="async"
              />
            )}
            <span className="upcoming-detail-photo-note">
              <Lock aria-hidden />
              <SiteText>{"Fotografie ukážu jako první zájemcům"}</SiteText>
            </span>
          </div>
          <dl className="upcoming-facts mt-8">
            <div>
              <dt>
                <SiteText>{"Typ"}</SiteText>
              </dt>
              <dd className="capitalize">{p.propertyType}</dd>
            </div>
            {p.disposition && (
              <div>
                <dt>
                  <SiteText>{"Dispozice"}</SiteText>
                </dt>
                <dd>{p.disposition}</dd>
              </div>
            )}
            {Boolean(p.area) && (
              <div>
                <dt>
                  <SiteText>{"Plocha"}</SiteText>
                </dt>
                <dd>{`${p.area} m²`}</dd>
              </div>
            )}
            {Boolean(p.landArea) && (
              <div>
                <dt>
                  <SiteText>{"Pozemek"}</SiteText>
                </dt>
                <dd>{`${p.landArea} m²`}</dd>
              </div>
            )}
            <div>
              <dt>
                <SiteText>{"Lokalita"}</SiteText>
              </dt>
              <dd>{p.location.city}</dd>
            </div>
          </dl>
          <div
            className="upcoming-blurred mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground"
            aria-hidden
          >
            {blurredLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <aside className="self-start">
          <div className="rounded-lg border bg-card p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-2xl">
              <BellRing className="size-5 text-accent" aria-hidden />
              <SiteText>{"Chci vědět více informací"}</SiteText>
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <SiteText>
                {
                  "Tuto nemovitost připravuji k prodeji. Pošlu Vám cenu, fotografie i popis dřív, než ji uvidí kdokoli jiný."
                }
              </SiteText>
            </p>
            <div className="mt-6">
              <LeadForm
                kind="property_inquiry"
                propertySlug={p.slug}
                submitLabel="Chci vědět více informací"
                defaultMessage={`Dobrý den, mám zájem o připravovanou nemovitost „${p.title}“. Pošlete mi prosím více informací.`}
              />
            </div>
            <ContactLinks className="mt-6 text-sm" />
          </div>
        </aside>
      </div>
    </article>
  );
}
