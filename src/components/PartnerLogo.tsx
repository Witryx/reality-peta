import { useSiteConfig } from "@/lib/website-context";
import stelar from "@/assets/stelar-reality-logo.png.asset.json";
import advisory from "@/assets/stelar-advisory-logo.png.asset.json";
import egypt from "@/assets/egyptskoceska-reality-logo.png.asset.json";
import { SiteText } from "./SiteText";

// Stable partner positions match site.partners, whose displayed names remain editable.
const logos = [stelar, advisory, egypt];

export function PartnerLogo({
  index,
  compact = false,
  showPlaceholder = false,
}: {
  index: number;
  compact?: boolean;
  showPlaceholder?: boolean;
}) {
  const site = useSiteConfig();
  const asset = logos[index];
  if (!asset?.url) {
    return asset || showPlaceholder ? (
      <p className="mt-1 text-xs font-normal text-muted-foreground">
        <SiteText>{"Oficiální logo doplníme"}</SiteText>
      </p>
    ) : null;
  }
  const content = (
    <div
      className={`partner-logo ${compact ? "partner-logo-compact" : ""} ${index === 1 ? "partner-logo-advisory" : ""} ${index === 2 ? "partner-logo-egypt" : ""}`}
    >
      <img
        className="partner-logo-image"
        src={asset.url}
        alt=""
        width={index === 0 ? 946 : index === 1 ? 1448 : 642}
        height={index === 0 ? 264 : index === 1 ? 736 : 389}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
  const href = site.partnerUrls[index];
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={site.partners[index]}
      className="block rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
    >
      {content}
    </a>
  ) : (
    content
  );
}
