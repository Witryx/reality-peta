import { useId, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import type { NearbyPlace, Property } from "@/data/types";
import {
  nearbyCategories,
  nearbyCategoryLabels,
  nearbyDistanceLabels,
  nearbyMapUrl,
} from "@/data/nearby";

export function NearbyPlacesEditor({
  p,
  onChange,
  errors,
}: {
  p: Property;
  onChange: (places: NearbyPlace[]) => void;
  errors: Record<string, string>;
}) {
  const id = useId();
  const places = p.nearbyPlaces ?? [];
  const update = (index: number, patch: Partial<NearbyPlace>) =>
    onChange(places.map((place, i) => (i === index ? { ...place, ...patch } : place)));
  function move(index: number, direction: number) {
    const next = [...places];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }
  function field(
    index: number,
    key: keyof NearbyPlace,
    label: string,
    children: (props: {
      id: string;
      "aria-invalid": boolean;
      "aria-describedby": string | undefined;
    }) => ReactNode,
  ) {
    const fieldId = `${id}-${index}-${key}`;
    const error = errors[`nearbyPlaces.${index}.${key}`];
    return (
      <div className={error ? "invalid" : ""}>
        <label htmlFor={fieldId}>{label}</label>
        {children({
          id: fieldId,
          "aria-invalid": !!error,
          "aria-describedby": error ? `${fieldId}-error` : undefined,
        })}
        {error && (
          <p id={`${fieldId}-error`} className="admin-field-error">
            {error}
          </p>
        )}
      </div>
    );
  }
  return (
    <section className="admin-card admin-form-card">
      <h2>
        <MapPin size={20} aria-hidden /> Okolí nemovitosti
      </h2>
      <p className="admin-description">
        Vyberte konkrétní školu, potraviny, poštu, lékaře nebo další zajímavé místo. Zadejte název a
        ověřenou vzdálenost od nemovitosti v metrech. Údaje se zobrazí pod mapou ve stejném pořadí.
      </p>
      {errors["nearbyPlaces"] && <p className="admin-field-error">{errors["nearbyPlaces"]}</p>}
      {!places.length && (
        <p className="admin-description">
          Zatím není přidané žádné místo. Prázdný seznam se na webu nezobrazuje.
        </p>
      )}
      <div className="admin-nearby-list">
        {places.map((place, index) => (
          <div className="admin-nearby-place" key={index}>
            <div className="admin-nearby-heading">
              <h3>{index + 1}. místo</h3>
              <div className="admin-nearby-actions">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`Posunout místo ${index + 1} nahoru`}
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={index === places.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Posunout místo ${index + 1} dolů`}
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  type="button"
                  className="admin-btn danger"
                  onClick={() => onChange(places.filter((_, i) => i !== index))}
                  aria-label={`Odebrat místo ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className="admin-field-grid">
              {field(index, "category", `Kategorie místa ${index + 1}`, (props) => (
                <select
                  {...props}
                  value={place.category}
                  onChange={(e) =>
                    update(index, { category: e.target.value as NearbyPlace["category"] })
                  }
                >
                  {nearbyCategories.map((category) => (
                    <option key={category} value={category}>
                      {nearbyCategoryLabels[category]}
                    </option>
                  ))}
                </select>
              ))}
              {field(index, "name", `Název místa ${index + 1} *`, (props) => (
                <input
                  {...props}
                  value={place.name}
                  maxLength={200}
                  placeholder="např. ZŠ Komenského"
                  onChange={(e) => update(index, { name: e.target.value })}
                />
              ))}
              {field(index, "distanceMeters", `Vzdálenost místa ${index + 1} (m) *`, (props) => (
                <input
                  {...props}
                  type="number"
                  min="0"
                  max="100000"
                  step="1"
                  value={Number.isFinite(place.distanceMeters) ? place.distanceMeters : ""}
                  placeholder="např. 350"
                  onChange={(e) =>
                    update(index, {
                      distanceMeters: e.target.value === "" ? Number.NaN : Number(e.target.value),
                    })
                  }
                />
              ))}
              {field(index, "distanceType", `Způsob měření místa ${index + 1}`, (props) => (
                <select
                  {...props}
                  value={place.distanceType}
                  onChange={(e) =>
                    update(index, { distanceType: e.target.value as NearbyPlace["distanceType"] })
                  }
                >
                  {Object.entries(nearbyDistanceLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            {field(index, "address", `Adresa místa ${index + 1} (volitelné)`, (props) => (
              <input
                {...props}
                value={place.address ?? ""}
                maxLength={300}
                placeholder="Ulice a číslo domu pro přesnější vyhledání v Google Mapách"
                onChange={(e) => update(index, { address: e.target.value })}
              />
            ))}
            {place.name.trim() && (
              <a
                href={nearbyMapUrl(place, p, true)}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-back"
              >
                {place.distanceType === "walking"
                  ? "Ověřit pěší trasu v Google Mapách"
                  : "Najít místo v Google Mapách"}{" "}
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="admin-btn"
        disabled={places.length >= 20}
        onClick={() =>
          onChange([
            ...places,
            { category: "school", name: "", distanceMeters: Number.NaN, distanceType: "walking" },
          ])
        }
      >
        <Plus size={16} /> Přidat místo v okolí
      </button>
      <p className="admin-description">
        Pěší vzdálenost ověřte podle trasy od domu, například v Google Mapách. U vzdálenosti
        vzdušnou čarou zvolte odpovídající způsob měření. Nevkládejte vzdálenost od středu města
        nebo čtvrti. Maximálně 20 míst.
      </p>
    </section>
  );
}
