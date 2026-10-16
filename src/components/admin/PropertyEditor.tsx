import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  ExternalLink,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/data/types";
import { publicationLabel, type AdminProperty, type Media, type Publication } from "@/data/admin";
import { propertySchema } from "@/server/validation";
import { today } from "@/lib/dates";
import { Notice, errorMessage, uploadImages } from "./AdminPanel";
import { useDialogFocus } from "./useDialogFocus";
import { ENERGY_PENDING, energyClasses, energyLabels } from "@/data/energy";
import { EnergyRating } from "@/components/EnergyRating";
import { propertyMap } from "@/lib/property-media";
import { NearbyPlacesEditor } from "./NearbyPlacesEditor";
import { NearbyPlaces } from "@/components/NearbyPlaces";
import { PropertyImagesEditor } from "./PropertyImagesEditor";
import { PropertyParameters } from "@/components/PropertyParameters";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 200)
    .replace(/^-|-$/g, "");
const blank = (): AdminProperty => ({
  id: "",
  title: "",
  slug: "",
  publication: "draft",
  status: "active",
  offerType: "sale",
  propertyType: "byt",
  market: "cz",
  disposition: "",
  location: { city: "", district: "", street: "" },
  price: null,
  priceNote: "",
  area: 0,
  ownership: "Osobní",
  condition: "",
  energyClass: ENERGY_PENDING,
  perex: "",
  description: [],
  features: [],
  availableFrom: "",
  images: [],
  featured: false,
  sortOrder: 0,
  publishedAt: today(),
  isDemo: false,
  version: 1,
  createdAt: "",
  updatedAt: "",
});

export function PropertyEditor({
  initial,
  media,
  onCancel,
  onSaved,
  onMediaChange,
}: {
  initial: AdminProperty | null;
  media: Media[];
  onCancel: () => void;
  onSaved: () => Promise<void>;
  onMediaChange: () => Promise<void>;
}) {
  const [value, setValue] = useState<AdminProperty>(() =>
    initial ? structuredClone(initial) : blank(),
  );
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState("");
  const [library, setLibrary] = useState(false);
  const [preview, setPreview] = useState(false);
  const [automaticSlug, setAutomaticSlug] = useState(!initial || initial.publication === "draft");
  const original = useRef(JSON.stringify(value));
  const dirty = original.current !== JSON.stringify(value);
  useDialogFocus(library || preview, () => {
    setLibrary(false);
    setPreview(false);
  });
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  function update<K extends keyof AdminProperty>(key: K, data: AdminProperty[K]) {
    setValue((p) => ({ ...p, [key]: data }));
  }
  function cancel() {
    if (!dirty || window.confirm("Odejít bez uložení změn?")) onCancel();
  }
  async function save(publication = value.publication) {
    setError("");
    setFieldErrors({});
    const candidate = { ...value, publication, autoSlug: automaticSlug };
    const parsed = propertySchema.safeParse(candidate);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errors[i.path.join(".")] ??= i.message;
      });
      setFieldErrors(errors);
      setError("Zkontrolujte označená pole. Změny ještě nejsou uložené.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setBusy(true);
    try {
      await api(initial ? `/api/admin/properties/${initial.id}` : "/api/admin/properties", {
        method: initial ? "PUT" : "POST",
        body: JSON.stringify(parsed.data),
      });
      original.current = JSON.stringify(value);
      await onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setUploading("Nahrávám…");
    try {
      // Apply each successful upload immediately, so a later failed file doesn't lose it.
      for (const [i, file] of Array.from(files).entries()) {
        setUploading(`Nahrávám ${i + 1} z ${files.length}…`);
        const images = await uploadImages([file]);
        setValue((p) => ({
          ...p,
          images: [...p.images, ...images]
            .slice(0, 50)
            .map((image, position) => ({ ...image, position })),
        }));
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setUploading("");
      await onMediaChange();
    }
  }
  function addFromLibrary(m: Media) {
    if (value.images.some((im) => im.src === `/uploads/${m.filename}`)) return;
    update("images", [
      ...value.images,
      {
        src: `/uploads/${m.filename}`,
        alt: m.original_name.replace(/\.[^.]+$/, ""),
        position: value.images.length,
      },
    ]);
  }
  const field = (key: string, label: string, child: ReactNode) => (
    <label key={key} className={fieldErrors[key] ? "invalid" : ""}>
      {label}
      {child}
      {fieldErrors[key] && <span className="admin-field-error">{fieldErrors[key]}</span>}
    </label>
  );
  const input = (
    key:
      | "title"
      | "slug"
      | "disposition"
      | "priceNote"
      | "floor"
      | "ownership"
      | "condition"
      | "building"
      | "availableFrom"
      | "videoUrl"
      | "matterportUrl",
    label: string,
    placeholder = "",
  ) =>
    field(
      key,
      label,
      <input
        value={value[key] ?? ""}
        placeholder={placeholder}
        maxLength={
          key === "title" || key === "slug"
            ? 200
            : key === "videoUrl" || key === "matterportUrl"
              ? 2048
              : key === "priceNote"
                ? 500
                : key === "disposition"
                  ? 80
                  : 200
        }
        onChange={(e) => {
          if (key === "slug") setAutomaticSlug(false);
          update(key, e.target.value);
        }}
      />,
    );
  return (
    <>
      <button className="admin-back" onClick={cancel}>
        <ArrowLeft size={16} /> Zpět na nemovitosti
      </button>
      <div className="admin-page-title">
        <div>
          <p className="admin-eyebrow">{initial ? "Úprava nabídky" : "Nový příběh"}</p>
          <h1>{initial ? "Upravit nemovitost" : "Přidat nemovitost"}</h1>
        </div>
        <div className="admin-editor-actions">
          <button className="admin-btn" onClick={() => setPreview(true)}>
            <Eye size={17} /> Náhled
          </button>
          <button
            className="admin-btn primary"
            disabled={busy || Boolean(uploading)}
            onClick={() => save()}
          >
            {busy ? <Loader2 className="admin-spin" size={17} /> : <Save size={17} />} Uložit změny
          </button>
        </div>
      </div>
      {error && <Notice>{error}</Notice>}
      <form
        className="admin-editor-grid"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="admin-editor-main">
          <section className="admin-card admin-form-card">
            <h2>
              <span>01</span> Základní informace
            </h2>
            {field(
              "title",
              "Název nemovitosti *",
              <input
                value={value.title}
                maxLength={200}
                placeholder="Např. Světlý byt 3+kk s balkonem na Vinohradech"
                onChange={(e) => {
                  const title = e.target.value;
                  setValue((p) => ({
                    ...p,
                    title,
                    slug: automaticSlug ? slugify(title) : p.slug,
                  }));
                }}
              />,
            )}
            {input("slug", "Adresa nabídky (URL) *", "byt-3kk-praha-vinohrady")}
            <div className="admin-slug-help">
              <p className="admin-description">
                {automaticSlug
                  ? "URL se mění podle názvu. Při shodě s jinou nabídkou se při uložení doplní číslo."
                  : "URL je nastavená ručně. Změna názvu ji nepřepíše."}
              </p>
              <button
                type="button"
                className="admin-text-button"
                onClick={() => {
                  update("slug", slugify(value.title));
                  setAutomaticSlug(true);
                }}
              >
                Vytvořit URL z názvu
              </button>
            </div>
            <div className="admin-field-grid">
              {field(
                "offerType",
                "Typ nabídky",
                <select
                  value={value.offerType}
                  onChange={(e) =>
                    update("offerType", e.target.value as AdminProperty["offerType"])
                  }
                >
                  <option value="sale">Prodej</option>
                  <option value="rent">Pronájem</option>
                </select>,
              )}
              {field(
                "propertyType",
                "Typ nemovitosti",
                <select
                  value={value.propertyType}
                  onChange={(e) =>
                    update("propertyType", e.target.value as AdminProperty["propertyType"])
                  }
                >
                  {["byt", "dům", "pozemek", "komerční"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>,
              )}
              {input("disposition", "Dispozice", "3+kk")}
              {field(
                "market",
                "Trh",
                <select
                  value={value.market ?? "cz"}
                  onChange={(e) => update("market", e.target.value as "cz" | "egypt")}
                >
                  <option value="cz">Česko</option>
                  <option value="egypt">Egypt</option>
                </select>,
              )}
            </div>
          </section>
          <section className="admin-card admin-form-card">
            <h2>
              <span>02</span> Lokalita a cena
            </h2>
            <div className="admin-field-grid">
              {["city", "district", "street"].map((key) =>
                field(
                  `location.${key}`,
                  (
                    { city: "Město", district: "Čtvrť / okres", street: "Ulice" } as Record<
                      string,
                      string
                    >
                  )[key]!,
                  <input
                    key={key}
                    value={value.location[key as keyof typeof value.location] ?? ""}
                    maxLength={200}
                    onChange={(e) =>
                      update("location", { ...value.location, [key]: e.target.value })
                    }
                  />,
                ),
              )}
              {field(
                "price",
                `Cena v Kč${value.offerType === "rent" ? " / měsíc" : ""}`,
                <input
                  type="number"
                  min="0"
                  max="1000000000000"
                  value={value.price ?? ""}
                  placeholder="Prázdné = cena na vyžádání"
                  onChange={(e) =>
                    update("price", e.target.value === "" ? null : Number(e.target.value))
                  }
                />,
              )}
            </div>
            <div className="admin-field-grid">
              {(["lat", "lng"] as const).map((key) =>
                field(
                  `location.${key}`,
                  key === "lat" ? "Zeměpisná šířka (volitelné)" : "Zeměpisná délka (volitelné)",
                  <input
                    key={key}
                    type="number"
                    step="any"
                    min={key === "lat" ? -90 : -180}
                    max={key === "lat" ? 90 : 180}
                    value={value.location[key] ?? ""}
                    placeholder={key === "lat" ? "např. 50.0755" : "např. 14.4378"}
                    onChange={(e) =>
                      update("location", {
                        ...value.location,
                        [key]: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />,
                ),
              )}
            </div>
            <p className="admin-description">
              Google Mapy se zobrazí podle ulice a města. Pro přesný bod vyplňte obě souřadnice: v
              Google Mapách klikněte pravým tlačítkem na místo a zkopírujte první číslo jako šířku a
              druhé jako délku.
            </p>
            {propertyMap(value).available && (
              <a
                className="admin-back"
                href={propertyMap(value).externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Zkontrolovat polohu v Google Mapách <ExternalLink size={15} />
              </a>
            )}
            {input("priceNote", "Poznámka k ceně", "Včetně provize a právního servisu")}
          </section>
          <NearbyPlacesEditor
            p={value}
            onChange={(places) => update("nearbyPlaces", places)}
            errors={fieldErrors}
          />
          <section className="admin-card admin-form-card">
            <h2>
              <span>03</span> Parametry nemovitosti
            </h2>
            <div className="admin-field-grid">
              {field(
                "area",
                "Užitná plocha (m²)",
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={value.area || ""}
                  onChange={(e) => update("area", Number(e.target.value))}
                />,
              )}
              {field(
                "landArea",
                "Plocha pozemku (m²)",
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={value.landArea ?? ""}
                  onChange={(e) =>
                    setValue((p) => {
                      const next = { ...p };
                      if (e.target.value) next.landArea = Number(e.target.value);
                      else delete next.landArea;
                      return next;
                    })
                  }
                />,
              )}
              {input("floor", "Podlaží", "4. NP z 5")}
              {input("ownership", "Vlastnictví", "Osobní")}
              {input("condition", "Stav nemovitosti", "Po rekonstrukci")}
              {field(
                "energyClass",
                "Energetická třída",
                <select
                  value={value.energyClass}
                  onChange={(e) => update("energyClass", e.target.value)}
                >
                  <option value={ENERGY_PENDING}>G – vypracováváme energetickou hodnotu</option>
                  {energyClasses.map((v) => (
                    <option key={v} value={v}>
                      {v} – {energyLabels[v]}
                    </option>
                  ))}
                  <option value="—">Neuvedeno / nevztahuje se</option>
                </select>,
              )}
              {input("building", "Stavba", "Cihlový dům")}
              {input("availableFrom", "Termín nastěhování", "Ihned / Od 1. 12. 2026 / Dohodou")}
            </div>
            <EnergyRating value={value.energyClass} />
            <h3 className="admin-subheading">Další parametry</h3>
            {field(
              "features",
              "Příslušenství a výhody (jedna položka na řádek)",
              <textarea
                value={value.features.join("\n")}
                rows={4}
                onChange={(e) => update("features", e.target.value.split("\n"))}
                placeholder={"Balkon\nVýtah\nSklep"}
              />,
            )}
            <p className="admin-description">
              Přidejte vlastní řádky, například infrastrukturu nebo vybavenost.
            </p>
            {(value.additionalParameters ?? []).map((parameter, i) => (
              <div className="admin-parameter-row" key={i}>
                {field(
                  `additionalParameters.${i}.label`,
                  `Název parametru ${i + 1}`,
                  <input
                    value={parameter.label}
                    maxLength={100}
                    placeholder="Např. Infrastruktura"
                    onChange={(e) =>
                      update(
                        "additionalParameters",
                        value.additionalParameters!.map((item, index) =>
                          index === i ? { ...item, label: e.target.value } : item,
                        ),
                      )
                    }
                  />,
                )}
                {field(
                  `additionalParameters.${i}.value`,
                  `Hodnota parametru ${i + 1}`,
                  <textarea
                    value={parameter.value}
                    maxLength={1000}
                    rows={2}
                    placeholder="Např. Vodovod, kanalizace, plyn"
                    onChange={(e) =>
                      update(
                        "additionalParameters",
                        value.additionalParameters!.map((item, index) =>
                          index === i ? { ...item, value: e.target.value } : item,
                        ),
                      )
                    }
                  />,
                )}
                <button
                  type="button"
                  className="admin-icon-button"
                  aria-label={`Odebrat parametr ${i + 1}`}
                  onClick={() =>
                    update(
                      "additionalParameters",
                      value.additionalParameters!.filter((_, index) => index !== i),
                    )
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {fieldErrors["additionalParameters"] && (
              <Notice>{fieldErrors["additionalParameters"]}</Notice>
            )}
            <button
              type="button"
              className="admin-btn"
              disabled={(value.additionalParameters?.length ?? 0) >= 20}
              onClick={() =>
                update("additionalParameters", [
                  ...(value.additionalParameters ?? []),
                  { label: "", value: "" },
                ])
              }
            >
              Přidat parametr
            </button>
          </section>
          <section className="admin-card admin-form-card">
            <h2>
              <span>04</span> Příběh nemovitosti
            </h2>
            {field(
              "perex",
              "Krátký úvod",
              <textarea
                value={value.perex}
                rows={3}
                maxLength={700}
                onChange={(e) => update("perex", e.target.value)}
                placeholder="Co z této nemovitosti dělá výjimečné místo?"
              />,
            )}
            {field(
              "description",
              "Podrobný popis",
              <textarea
                value={value.description.join("\n\n")}
                rows={9}
                maxLength={100000}
                onChange={(e) => update("description", e.target.value.split("\n\n"))}
                placeholder="Jednotlivé odstavce oddělte prázdným řádkem."
              />,
            )}
          </section>
          <section className="admin-card admin-form-card">
            <h2>
              <span>05</span> Fotografie a prohlídky
            </h2>
            <p className="admin-description">
              První fotografie je titulní. Fotografie přetáhněte za úchyt nebo vyberte jejich
              pozici. Maximálně 50 fotografií.
            </p>
            {fieldErrors["images"] && <Notice>{fieldErrors["images"]}</Notice>}
            <div className="admin-upload-zone">
              <ImagePlus size={30} strokeWidth={1.3} />
              <strong>{uploading || "Přidejte fotografie nemovitosti"}</strong>
              <span>JPG, PNG, WebP, AVIF · max. 12 MB / fotografie</span>
              <div>
                <label className="admin-btn primary admin-upload-label">
                  <PlusIcon /> Vybrat soubory
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    disabled={Boolean(uploading) || value.images.length >= 50}
                    onChange={(e) => {
                      void upload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button type="button" className="admin-btn" onClick={() => setLibrary(true)}>
                  Z knihovny
                </button>
              </div>
            </div>
            <PropertyImagesEditor
              images={value.images}
              onChange={(images) => update("images", images)}
            />
            <div className="admin-field-grid">
              {input(
                "videoUrl",
                "Video (odkaz na YouTube / Vimeo)",
                "https://www.youtube.com/watch?v=… nebo https://youtu.be/…",
              )}
              {input("matterportUrl", "Virtuální prohlídka", "https://my.matterport.com/show/?m=…")}
            </div>
            <p className="admin-description">
              Nahrajte video na YouTube jako veřejné nebo neveřejné a vložte odkaz z tlačítka
              Sdílet. Soukromé video nebude pro návštěvníky dostupné. Vkládání videa musí být na
              YouTube povolené. Video i virtuální prohlídka se na webu zobrazí samostatně po
              souhlasu s marketingovými cookies.
            </p>
          </section>
        </div>
        <aside className="admin-editor-side">
          <section className="admin-card admin-form-card">
            <h2>Publikace</h2>
            {field(
              "publication",
              "Viditelnost na webu",
              <select
                value={value.publication}
                onChange={(e) => update("publication", e.target.value as Publication)}
              >
                {Object.entries(publicationLabel).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>,
            )}
            <p className="admin-description">
              {value.publication === "draft"
                ? "Koncept vidíte pouze v administraci."
                : value.publication === "archived"
                  ? "Archivované nabídky nejsou na veřejném webu."
                  : "Po uložení bude nabídka dostupná od data zveřejnění."}
            </p>
            {field(
              "publishedAt",
              "Datum zveřejnění",
              <input
                type="date"
                value={value.publishedAt}
                onChange={(e) => update("publishedAt", e.target.value)}
              />,
            )}
            {field(
              "status",
              "Stav nabídky",
              <select
                value={value.status}
                onChange={(e) => update("status", e.target.value as AdminProperty["status"])}
              >
                <option value="active">Aktivní</option>
                <option value="reserved">Rezervováno</option>
                <option value="sold">Prodáno</option>
              </select>,
            )}
            <label className="admin-checkbox">
              <input
                type="checkbox"
                checked={value.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />{" "}
              Doporučená nabídka
            </label>
            {field(
              "sortOrder",
              "Pořadí na webu",
              <input
                type="number"
                min="0"
                max="100000"
                value={value.sortOrder}
                onChange={(e) => update("sortOrder", Number(e.target.value))}
              />,
            )}
            <button
              type="submit"
              className="admin-btn primary"
              disabled={busy || Boolean(uploading)}
            >
              <Save size={17} />
              {busy ? "Ukládám…" : "Uložit nabídku"}
            </button>
            {value.publication === "draft" && (
              <button
                type="button"
                className="admin-btn"
                disabled={busy || Boolean(uploading)}
                onClick={() => save("published")}
              >
                <Check size={17} /> Uložit a zveřejnit
              </button>
            )}
            {initial?.publication === "published" && (
              <a
                href={`/nabidka/${initial.slug}`}
                className="admin-text-button"
                target="_blank"
                rel="noreferrer"
              >
                Otevřít na webu <ExternalLink size={14} />
              </a>
            )}
          </section>
          <div className="admin-editor-help">
            <ShieldCheckIcon />
            <p>
              Nejdřív si nabídku připravte v konceptu. Před zveřejněním zkontrolujte cenu, popis a
              titulní fotografii.
            </p>
            {dirty && <span>Máte neuložené změny.</span>}
          </div>
        </aside>
      </form>
      {library && (
        <div className="admin-dialog-backdrop">
          <section
            className="admin-dialog wide"
            role="dialog"
            aria-modal="true"
            aria-label="Knihovna fotografií"
          >
            <button
              className="admin-dialog-close"
              onClick={() => setLibrary(false)}
              aria-label="Zavřít"
            >
              <X size={22} />
            </button>
            <h2>Vybrat z knihovny</h2>
            <p>Kliknutím přidáte fotografii do galerie.</p>
            <div className="admin-media-grid">
              {media.map((m) => {
                const selected = value.images.some((im) => im.src === `/uploads/${m.filename}`);
                return (
                  <button
                    type="button"
                    disabled={selected || value.images.length >= 50}
                    className={`admin-library-item ${selected ? "selected" : ""}`}
                    key={m.id}
                    onClick={() => addFromLibrary(m)}
                  >
                    <img src={`/uploads/${m.filename}`} alt={m.original_name} />
                    <span>{selected ? "Přidáno ✓" : m.original_name}</span>
                  </button>
                );
              })}
            </div>
            {!media.length && <p>Knihovna je prázdná. Nahrajte nové fotografie.</p>}
            <button className="admin-btn primary" onClick={() => setLibrary(false)}>
              Hotovo
            </button>
          </section>
        </div>
      )}
      {preview && (
        <div className="admin-dialog-backdrop">
          <section
            className="admin-dialog wide admin-preview"
            role="dialog"
            aria-modal="true"
            aria-label="Náhled nabídky"
          >
            <button
              className="admin-dialog-close"
              onClick={() => setPreview(false)}
              aria-label="Zavřít"
            >
              <X size={22} />
            </button>
            <p className="admin-eyebrow">Náhled neuložené nabídky</p>
            {value.images[0] ? (
              <img
                className="admin-preview-image"
                src={value.images[0].src}
                alt={value.images[0].alt}
              />
            ) : (
              <div className="admin-preview-image placeholder">
                <Building2 size={40} />
              </div>
            )}
            <h2>{value.title || "Název nemovitosti"}</h2>
            <p>
              <MapPin size={15} /> {value.location.city} · {value.disposition} · {value.area} m²
            </p>
            <strong className="admin-preview-price">{formatPrice(value)}</strong>
            <p>{value.perex}</p>
            {value.description.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {value.priceNote && <p className="property-price-note">{value.priceNote}</p>}
            <PropertyParameters p={value} />
            <NearbyPlaces
              p={{
                ...value,
                nearbyPlaces: (value.nearbyPlaces ?? []).filter(
                  (place) => place.name.trim() && Number.isFinite(place.distanceMeters),
                ),
              }}
            />
            <button className="admin-btn" onClick={() => setPreview(false)}>
              Zpět do editoru
            </button>
          </section>
        </div>
      )}
    </>
  );
}
function PlusIcon() {
  return <ImagePlus size={16} />;
}
function ShieldCheckIcon() {
  return <Check size={20} />;
}
