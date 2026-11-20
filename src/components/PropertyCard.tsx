import { photoAt, photoSrcSet } from "@/lib/photo-src";
import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, Camera, MapPin, Ruler } from "lucide-react";
import { formatPrice, statusLabel, type Property } from "@/data/types";

export function StatusBadge({
  status,
  prominent = false,
}: {
  status: Property["status"];
  prominent?: boolean;
}) {
  return (
    <span
      className={`property-status property-status-${status} ${prominent ? "property-status-prominent" : ""}`}
    >
      <span className="property-status-dot" aria-hidden />
      <SiteText>{statusLabel[status]}</SiteText>
    </span>
  );
}

export function PropertyCard({ p, eager = false }: { p: Property; eager?: boolean }) {
  const photos = [...p.images].sort((a, b) => a.position - b.position);
  const upcoming = p.status === "upcoming";
  const [img, peek] = upcoming ? [photos[0]] : photos;
  const features = [...new Set(p.features.map((feature) => feature.trim()).filter(Boolean))].slice(
    0,
    5,
  );
  return (
    <article className={`property-card group h-full ${upcoming ? "is-upcoming" : ""}`}>
      <Link to="/nabidka/$slug" params={{ slug: p.slug }} className="flex h-full flex-col">
        <div className="property-photo relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
          {img ? (
            <img
              src={photoAt(img.src, 960)}
              srcSet={photoSrcSet(img.src, [480, 960])}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              alt={upcoming ? "" : img.alt}
              width={1200}
              height={900}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="property-card-img size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              <SiteText>{"Fotografii připravujeme"}</SiteText>
            </div>
          )}
          {peek && (
            <img
              src={photoAt(peek.src, 960)}
              srcSet={photoSrcSet(peek.src, [480, 960])}
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              alt=""
              aria-hidden
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              className="property-card-img property-card-peek size-full object-cover"
            />
          )}
          {!upcoming && photos.length > 1 && (
            <span className="property-card-count">
              <Camera aria-hidden />
              {photos.length}
            </span>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <StatusBadge status={p.status} prominent={p.status === "active"} />
            {p.isDemo && (
              <span className="rounded-full bg-placeholder px-3 py-1 text-xs font-medium text-accent-foreground">
                <SiteText>{"Ukázka"}</SiteText>
              </span>
            )}
          </div>
        </div>
        <div className="property-info">
          <p className="property-card-location">
            <MapPin size={14} aria-hidden="true" />
            <span className="truncate">
              {[p.location.city, p.location.district].filter(Boolean).join(" · ")}
            </span>
          </p>
          <h3 className="property-title property-card-title">{p.title}</h3>
          <div className="property-card-facts">
            {p.disposition && <span>{p.disposition}</span>}
            <span>
              <Ruler size={14} aria-hidden="true" />
              {`${p.area} m²`}
            </span>
            {Boolean(p.landArea) && <span>{`pozemek ${p.landArea} m²`}</span>}
            {features.map((feature) => (
              <span key={feature}>{feature}</span>
            ))}
          </div>
          {p.availableFrom?.trim() && (
            <p className="property-card-availability">
              <CalendarDays size={15} aria-hidden="true" />
              <span>
                <SiteText>{"Nastěhování:"}</SiteText> {p.availableFrom}
              </span>
            </p>
          )}
          <div className="property-card-footer">
            <div className="property-card-price-row">
              <div className="min-w-0">
                <p className="property-card-price">
                  {p.status === "sold" ? (
                    "Prodáno"
                  ) : upcoming ? (
                    <SiteText>{"Inzerát před zveřejněním"}</SiteText>
                  ) : (
                    formatPrice(p)
                  )}
                </p>
                {p.market === "egypt" && p.price !== null && p.status !== "sold" && (
                  <p className="property-card-price-note">
                    <SiteText>
                      {"Cena včetně provize a kompletního servisu zprostředkování"}
                    </SiteText>
                  </p>
                )}
                {p.priceNote && <p className="property-card-price-note">{p.priceNote}</p>}
              </div>
              <span className="property-detail-arrow">
                <span className="sr-only">
                  <SiteText>{"Detail nabídky"}</SiteText>
                </span>
                <ArrowUpRight className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
