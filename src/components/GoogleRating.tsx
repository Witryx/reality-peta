import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Star, ArrowUpRight } from "lucide-react";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";

export function GoogleRating() {
  const site = useSiteConfig();

  return (
    <div
      data-reveal="fade"
      className="mt-10 flex flex-wrap items-center justify-between gap-6 border-y py-7"
    >
      <div className="flex items-center gap-5">
        <span className="font-display text-5xl">
          <SiteText>{site.googleReviews.rating}</SiteText>
          <span className="ml-1 font-sans text-base text-muted-foreground">/ 5</span>
        </span>
        <div>
          <div
            aria-label={`Google hodnocení ${site.googleReviews.rating} z 5`}
            className="flex gap-1 text-accent"
          >
            {
              <SiteText>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-current" aria-hidden />
                ))}
              </SiteText>
            }
          </div>
          <p className="mt-2 text-sm">
            <SiteText>{"Google hodnocení"}</SiteText>
          </p>
        </div>
      </div>
      {site.googleReviews.profileUrl ? (
        <Button variant="link" asChild>
          <a href={site.googleReviews.profileUrl} target="_blank" rel="noopener noreferrer">
            <SiteText>{"Všechny recenze na Google "}</SiteText>
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
      ) : (
        <span className="text-sm text-muted-foreground">
          <SiteText>{"Odkaz na Google profil doplníme"}</SiteText>
        </span>
      )}
    </div>
  );
}
