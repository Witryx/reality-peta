import { SiteText } from "@/components/SiteText";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, openConsentSettings, readConsent } from "@/lib/consent";
export function ConsentEmbed({
  src,
  title = "Video nebo virtuální prohlídka",
  kind = "video",
}: {
  src: string;
  title?: string;
  kind?: "video" | "map";
}) {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const update = () => setAllowed(Boolean(readConsent()?.marketing));
    update();
    window.addEventListener(CONSENT_EVENT, update);
    return () => window.removeEventListener(CONSENT_EVENT, update);
  }, []);
  return allowed ? (
    <div className="mt-6 aspect-video overflow-hidden rounded-lg">
      <iframe
        src={src}
        title={title}
        className="size-full"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow={kind === "video" ? "encrypted-media; picture-in-picture; fullscreen" : undefined}
        allowFullScreen
      />
    </div>
  ) : (
    <div className="mt-6 rounded-lg border bg-surface p-6">
      <p className="font-medium">
        <SiteText>{kind === "map" ? "Prohlédněte si okolí v Google Mapách" : title}</SiteText>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <SiteText>
          {kind === "map" ? "Mapu poskytuje Google." : "Přehrávač poskytuje externí služba."}
        </SiteText>
        <SiteText>{" Načte se po povolení marketingových cookies."}</SiteText>
      </p>
      <button className="btn btn-outline mt-4" onClick={openConsentSettings}>
        <SiteText>{"Upravit souhlas"}</SiteText>
      </button>
    </div>
  );
}
