import stelar from "@/assets/stelar-reality-logo.png.asset.json";
import egypt from "@/assets/egyptskoceska-reality-logo.png.asset.json";
import { SiteText } from "./SiteText";

// Stable partner positions match site.partners, whose displayed names remain editable.
const logos = [stelar, null, egypt];

export function PartnerLogo({
  index,
  compact = false,
  showPlaceholder = false,
}: {
  index: number;
  compact?: boolean;
  showPlaceholder?: boolean;
}) {
  const asset = logos[index];
  if (!asset?.url) {
    return asset || showPlaceholder ? (
      <p className="mt-1 text-xs font-normal text-muted-foreground">
        <SiteText>{"Oficiální logo doplníme"}</SiteText>
      </p>
    ) : null;
  }
  return (
    <div
      className={`partner-logo ${compact ? "partner-logo-compact" : ""} ${index === 2 ? "partner-logo-egypt" : ""}`}
    >
      <img
        className="partner-logo-image"
        src={asset.url}
        alt=""
        width={index === 0 ? 946 : 642}
        height={index === 0 ? 264 : 389}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
