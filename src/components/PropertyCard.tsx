import { SiteText } from "@/components/SiteText";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
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
            <StatusBadge status={p.status} />
            {p.isDemo && (
              <span className="rounded-full bg-placeholder px-3 py-1 text-xs font-medium text-accent-foreground">
                <SiteText>{"Ukázka"}</SiteText>
              </span>
            )}
          </div>
        </div>
        <div className="property-info flex flex-1 flex-col p-5">
          <p className="text-xs text-muted-foreground">
            {[p.location.city, p.location.district].filter(Boolean).join(" · ")}
          </p>
          <h3 className="property-title mt-2 text-xl leading-snug [overflow-wrap:anywhere] group-hover:underline decoration-1 underline-offset-4 md:text-2xl">
            {p.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {[p.disposition, `${p.area} m²`, p.landArea ? `pozemek ${p.landArea} m²` : ""]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {p.priceNote && (
            <p className="property-card-price-note mt-3 text-xs leading-relaxed text-muted-foreground">
              {p.priceNote}
            </p>
          )}
          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <p className="text-base font-semibold leading-snug">
                {p.status === "sold" ? "Prodáno" : formatPrice(p)}
              </p>
              <span className="property-detail-arrow flex size-8 shrink-0 items-center justify-center rounded-full bg-surface text-accent">
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
