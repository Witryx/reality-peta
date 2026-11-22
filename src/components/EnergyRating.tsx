import { SiteText } from "@/components/SiteText";
import { ENERGY_EXEMPT, ENERGY_PENDING, energyClasses, energyLabels } from "@/data/energy";

export function EnergyRating({ value }: { value: string }) {
  const pending = value === ENERGY_PENDING;
  const exempt = value === ENERGY_EXEMPT;
  const known = energyClasses.some((letter) => letter === value);
  return (
    <div className="mt-6 rounded-lg border bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <span
          className={`energy-badge energy-${known ? value : "pending"}`}
          aria-label={`Energetická třída ${pending ? "G – připravujeme" : exempt ? "nevyžaduje se" : known ? value : "neuvedena"}`}
        >
          <SiteText>{pending ? "G" : known ? value : "—"}</SiteText>
        </span>
        <div>
          <p className="text-sm font-semibold">
            <SiteText>{"Energetická náročnost"}</SiteText>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <SiteText>
              {pending
                ? "Vypracováváme pro vás energetickou hodnotu."
                : exempt
                  ? "Průkaz energetické náročnosti se nevyžaduje – stavba s plochou do 50 m²."
                  : energyLabels[value] || "Energetická třída zatím není uvedena."}
            </SiteText>
          </p>
        </div>
      </div>
      {known && (
        <div className="energy-scale mt-5" aria-label={`Stupnice A až G, třída ${value}`}>
          {energyClasses.map((letter) => (
            <span
              key={letter}
              className={`energy-${letter} ${value === letter ? "energy-selected" : ""}`}
              aria-hidden="true"
            >
              <SiteText>{letter}</SiteText>
            </span>
          ))}
        </div>
      )}
      {pending && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <SiteText>
            {
              "Do dodání průkazu uvádíme třídu G. Skutečnou energetickou náročnost doplníme po jeho vypracování."
            }
          </SiteText>
        </p>
      )}
    </div>
  );
}
