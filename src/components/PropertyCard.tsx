import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin, Ruler } from "lucide-react";
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
  const img = [...p.images].sort((a, b) => a.position - b.position)[0];
  const features = [...new Set(p.features.map((feature) => feature.trim()).filter(Boolean))];
  return (
    <article className="property-card group h-full">
      <Link to="/nabidka/$slug" params={{ slug: p.slug }} className="flex h-full flex-col">
        <div className="property-photo relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
          {img ? (
            <img
              src={img.src}
              alt={img.alt}
              width={1200}
              height={900}
              loading={eager ? "eager" : "lazy"}
              decoding="async"
              className="img-zoom size-full object-cover group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              <SiteText>{"Fotografii připravujeme"}</SiteText>
            </div>
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
            {[p.location.city, p.location.district].filter(Boolean).join(" · ")}
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
                  {p.status === "sold" ? "Prodáno" : formatPrice(p)}
                </p>
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
