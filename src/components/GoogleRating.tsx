import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Star, ArrowUpRight, BadgeCheck } from "lucide-react";

const starEmpty = "size-6 shrink-0 fill-current text-border";
const starFilled = "size-6 shrink-0 fill-current";

function Stars({ value }: { value: number }) {
  const share = Math.max(0, Math.min(1, value / 5)) * 100;
  const row = (filled: boolean) =>
    [0, 1, 2, 3, 4].map((i) => (
      <Star
        key={i}
        className={filled ? starFilled : starEmpty}
        strokeWidth={1.5}
        aria-hidden
      />
    ));
  return (
    <span className="rating-stars gap-1" aria-hidden>
      {row(false)}
      <span className="rating-stars-fill flex gap-1 text-review-star" style={{ width: `${share}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

export function GoogleRating() {
  const site = useSiteConfig();
  const value = Number(String(site.googleReviews.rating).replace(",", "."));

  return (
    <div
      data-reveal="fade"
      className="google-rating-card mt-10 flex flex-wrap items-center justify-between gap-6 p-6 md:p-8"
    >
      <div className="flex items-center gap-5 md:gap-6">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_-8px_rgb(41_41_39/0.35)] md:size-[72px]">
          <img src="/brand/google-g.png" alt="Google" width={36} height={37} className="size-9" />
        </span>
        <span className="font-display text-6xl leading-none">
          <SiteText>{site.googleReviews.rating}</SiteText>
        </span>
        <div>
          <div aria-label={`Hodnocení na Googlu ${site.googleReviews.rating} z 5`}>
            <Stars value={Number.isFinite(value) ? value : 5} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
            <BadgeCheck className="size-4 text-accent" aria-hidden />
            <SiteText>{"Hodnocení klientů na Googlu"}</SiteText>
          </p>
        </div>
      </div>
      {site.googleReviews.profileUrl ? (
        <a
          href={site.googleReviews.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-accent px-5 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          <SiteText>{"Přečíst recenze na Googlu"}</SiteText>
          <ArrowUpRight className="size-4" />
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">
          <SiteText>{"Odkaz na Google profil doplníme"}</SiteText>
        </span>
      )}
    </div>
  );
}
