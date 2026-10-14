import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import logo from "@/assets/petr-pavlat-logo.png.asset.json";
import { site } from "@/config/site";
import { BrandImage } from "./BrandImage";

export function BrandLockup({
  compact = false,
  light = false,
}: {
  compact?: boolean;
  light?: boolean;
}) {
  const site = useSiteConfig();

  return (
    <span
      className={`brand-lockup flex min-w-0 items-center gap-3 ${compact ? "brand-compact" : ""}`}
    >
      <BrandImage
        asset={logo}
        alt=""
        width={48}
        height={48}
        className={`brand-mark size-10 shrink-0 object-contain ${light ? "brightness-0 invert" : ""}`}
      />
      <span className="min-w-0">
        <span className="brand-name flex items-baseline gap-1.5 whitespace-nowrap font-display text-2xl font-normal">
          <span>
            <SiteText>{site.agentName}</SiteText>
          </span>
          <span className="font-sans text-xs font-medium">
            <SiteText>{"reality"}</SiteText>
          </span>
        </span>
        {!compact && (
          <span className="brand-claim mt-1 block text-[10px] leading-relaxed text-current opacity-70">
            <SiteText>{site.claim}</SiteText>
          </span>
        )}
      </span>
    </span>
  );
}
