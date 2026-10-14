import { SiteText } from "@/components/SiteText";
import {
  ArrowUpRight,
  Baby,
  Bus,
  CircleHelp,
  GraduationCap,
  Mail,
  Pill,
  ShoppingBasket,
  Stethoscope,
  Trees,
} from "lucide-react";
import type { Property } from "@/data/types";
import { nearbyCategoryLabels, nearbyDistanceLabels, nearbyMapUrl } from "@/data/nearby";

const icons = {
  school: GraduationCap,
  kindergarten: Baby,
  groceries: ShoppingBasket,
  post_office: Mail,
  doctor: Stethoscope,
  pharmacy: Pill,
  transport: Bus,
  park: Trees,
  other: CircleHelp,
};

export function NearbyPlaces({ p }: { p: Property }) {
  const places = p.nearbyPlaces ?? [];
  if (!places.length) return null;
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-2xl">
        <SiteText>{"Co najdete v okolí"}</SiteText>
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        <SiteText>{"Důležitá místa a vzdálenosti od nemovitosti."}</SiteText>
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2" aria-label="Místa v okolí nemovitosti">
        {places.map((place, index) => {
          const Icon = icons[place.category];
          return (
            <li key={`${place.category}-${index}`}>
              <a
                href={nearbyMapUrl(place, p)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full items-start gap-3 rounded-lg border bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-card"
                aria-label={`${nearbyCategoryLabels[place.category]}: ${place.name}, ${place.distanceMeters} metrů ${nearbyDistanceLabels[place.distanceType]} – otevřít v Google Mapách`}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card text-accent">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow">
                    <SiteText>{nearbyCategoryLabels[place.category]}</SiteText>
                  </p>
                  <p className="mt-1 text-sm font-semibold [overflow-wrap:anywhere]">
                    <SiteText>{place.name}</SiteText>
                  </p>
                  {place.address && (
                    <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
                      <SiteText>{place.address}</SiteText>
                    </p>
                  )}
                  <p className="mt-3 text-sm">
                    <span className="font-semibold">
                      <SiteText>
                        {new Intl.NumberFormat("cs-CZ").format(place.distanceMeters)}
                      </SiteText>
                      {<SiteText> </SiteText>}m
                    </span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      <SiteText>{nearbyDistanceLabels[place.distanceType]}</SiteText>
                    </span>
                  </p>
                </div>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        <SiteText>
          {
            "Vzdálenosti jsou orientační. U každého místa je uvedeno, zda jde o pěší trasu, nebo vzdálenost vzdušnou čarou."
          }
        </SiteText>
      </p>
    </div>
  );
}
