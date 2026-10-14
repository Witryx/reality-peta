import { SiteText } from "@/components/SiteText";
import { useEffect, useState } from "react";
import type { Property } from "@/data/types";
import { PropertyCard } from "./PropertyCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

export function PropertyCarousel({ properties }: { properties: Property[] }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  if (properties.length === 0)
    return (
      <p className="mt-10 rounded-lg border border-dashed bg-surface p-8 text-muted-foreground">
        <SiteText>
          {"Nové nabídky pro vás právě připravuji. Mezitím mi napište, jakou nemovitost hledáte."}
        </SiteText>
      </p>
    );

  return (
    <Carousel
      className="relative mt-10 min-w-0"
      aria-label="Aktuální nemovitosti"
      aria-roledescription="listovatelná nabídka"
      opts={{ align: "start", slidesToScroll: 1, duration: reducedMotion ? 0 : 25 }}
    >
      <CarouselContent className="-ml-6">
        {
          <SiteText>
            {properties.map((property, index) => (
              <CarouselItem
                key={property.id}
                className="basis-full pl-6 sm:basis-1/2 lg:basis-1/3"
                aria-label={`${index + 1} z ${properties.length}`}
                aria-roledescription="nemovitost"
              >
                <PropertyCard p={property} />
              </CarouselItem>
            ))}
          </SiteText>
        }
      </CarouselContent>
      {
        <SiteText>
          {properties.length > 1 && (
            <div className="mt-6 flex items-center justify-end gap-2">
              <CarouselPrevious
                className="static left-auto top-auto size-11 translate-y-0 bg-card disabled:opacity-40"
                aria-label="Předchozí nemovitost"
                title="Předchozí nemovitost"
              />
              <CarouselNext
                className="static right-auto top-auto size-11 translate-y-0 bg-card disabled:opacity-40"
                aria-label="Další nemovitost"
                title="Další nemovitost"
              />
            </div>
          )}
        </SiteText>
      }
    </Carousel>
  );
}
