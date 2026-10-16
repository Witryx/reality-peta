import type { ReactNode } from "react";
import type { Property } from "@/data/types";
import { formatPrice } from "@/data/types";
import { SiteText } from "./SiteText";
import { EnergyRating } from "./EnergyRating";

export function PropertyParameters({ p }: { p: Property }) {
  const params: [string, ReactNode][] = [
    ["Cena", formatPrice(p)],
    ["Poznámka k ceně", p.priceNote],
    ["Dispozice", p.disposition],
    ["Užitná plocha", p.area ? `${p.area} m²` : undefined],
    ["Pozemek", p.landArea ? `${p.landArea} m²` : undefined],
    ["Podlaží", p.floor],
    ["Vlastnictví", p.ownership],
    ["Stav", p.condition],
    ["Stavba", p.building],
    ["Termín nastěhování", p.availableFrom],
  ];
  const additional =
    p.additionalParameters?.filter((item) => item.label.trim() && item.value.trim()) ?? [];
  const features = p.features.filter((feature) => feature.trim());
  return (
    <section className="property-parameters mt-12">
      <h2 className="text-3xl">
        <SiteText>{"Parametry"}</SiteText>
      </h2>
      <dl className="property-parameter-list mt-6">
        {params
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>
                <SiteText>{label}</SiteText>
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      {(features.length > 0 || additional.length > 0) && (
        <div className="mt-8">
          <h3 className="property-parameters-subtitle">
            <SiteText>{"Další parametry"}</SiteText>
          </h3>
          <dl className="property-parameter-list mt-3">
            {features.length > 0 && (
              <div>
                <dt>
                  <SiteText>{"Příslušenství"}</SiteText>
                </dt>
                <dd>
                  <ul className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <li key={index} className="property-feature">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {additional.map((parameter, index) => (
              <div key={index}>
                <dt>{parameter.label}</dt>
                <dd className="whitespace-pre-line">{parameter.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <EnergyRating value={p.energyClass} />
    </section>
  );
}
