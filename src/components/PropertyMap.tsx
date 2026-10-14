import type { Property } from "@/data/types";
import { ArrowUpRight, MapPin } from "lucide-react";
import { propertyMap } from "@/lib/property-media";
import { ConsentEmbed } from "./ConsentEmbed";
import { Placeholder } from "./ContactLinks";
import { NearbyPlaces } from "./NearbyPlaces";

export function PropertyMap({ p }: { p: Property }) {
  const map = propertyMap(p);
  if (!map.available)
    return (
      <div>
        <p className="mt-6">
          <Placeholder>Polohu nemovitosti doplníme</Placeholder>
        </p>
        <NearbyPlaces p={p} />
      </div>
    );
  return (
    <div>
      <ConsentEmbed
        src={map.embedUrl}
        title={`Google Mapy – ${map.address || p.title}`}
        kind="map"
      />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3 text-sm">
        <p className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          {map.address || "Poloha nemovitosti"}
        </p>
        <a
          href={map.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
        >
          Otevřít v Google Mapách <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
      {!map.precise && (
        <p className="mt-2 text-xs text-muted-foreground">
          Mapa zobrazuje lokalitu podle uvedené adresy.
        </p>
      )}
      <NearbyPlaces p={p} />
    </div>
  );
}
