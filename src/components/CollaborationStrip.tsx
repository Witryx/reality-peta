import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { PartnerLogo } from "./PartnerLogo";

export function CollaborationStrip({ className = "" }: { className?: string }) {
  const site = useSiteConfig();

  return (
    <div className={`collaboration-strip ${className}`}>
      <p className="text-center text-xs font-medium opacity-70">
        <SiteText>{"Ve spolupráci s"}</SiteText>
      </p>
      <ul className="partner-grid mt-4 font-sans text-sm font-semibold">
        {site.partners.map((name, index) => (
          <li key={name} className="partner-item">
            <p className="partner-name">
              <SiteText>{name}</SiteText>
            </p>
            <PartnerLogo index={index} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}
