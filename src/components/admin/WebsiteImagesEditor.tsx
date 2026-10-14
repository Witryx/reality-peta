import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { websiteImages } from "@/data/website-images";
import { websiteImageDefaults } from "@/data/website-image-defaults";
import type { Media } from "@/data/admin";
import type { WebsiteContent } from "@/lib/site-copy";
import { api } from "@/lib/api";
import { Notice, errorMessage } from "./AdminPanel";
import { ImagePicker } from "./ImagePicker";

export function WebsiteImagesEditor({
  media,
  onMediaChange,
  onDirty,
}: {
  media: Media[];
  onMediaChange: () => Promise<unknown>;
  onDirty: (dirty: boolean) => void;
}) {
  const router = useRouter();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-website-images"],
    queryFn: () => api<WebsiteContent>("/api/admin/website"),
    refetchOnWindowFocus: false,
  });
  const [draft, setDraft] = useState<WebsiteContent | null>(null);
  const baseline = useRef("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [group, setGroup] = useState("");
  const dirty = !!draft && JSON.stringify(draft.values) !== baseline.current;
  useEffect(() => {
    if (query.data && !draft) {
      baseline.current = JSON.stringify(query.data.values);
      setDraft(query.data);
    }
  }, [query.data, draft]);
  useEffect(() => {
    onDirty(dirty || uploading);
    return () => onDirty(false);
  }, [dirty, uploading, onDirty]);
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => {
      if (dirty || uploading) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty, uploading]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || uploading || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const saved = await api<WebsiteContent>("/api/admin/website", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      baseline.current = JSON.stringify(saved.values);
      setDraft(saved);
      client.setQueryData(["admin-website"], saved);
      client.setQueryData(["admin-website-images"], saved);
      setMessage("Fotografie jsou uložené a zobrazují se na webu.");
      await router.invalidate();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    if (dirty && !window.confirm("Načíst aktuální obsah a zahodit neuložené změny fotografií?"))
      return;
    setBusy(true);
    setError("");
    try {
      const latest = await api<WebsiteContent>("/api/admin/website");
      baseline.current = JSON.stringify(latest.values);
      setDraft(latest);
      client.setQueryData(["admin-website"], latest);
      client.setQueryData(["admin-website-images"], latest);
      setMessage("Aktuální obsah je načtený.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function edit(key: string, src?: string) {
    if (!draft) return;
    const values = { ...draft.values };
    if (src) values[key] = src;
    else {
      delete values[key];
      delete values[`${key}.alt`];
    }
    setDraft({ ...draft, values });
    setMessage("");
  }
  if (!draft)
    return query.error ? (
      <Notice>
        {errorMessage(query.error)} <button onClick={() => query.refetch()}>Zkusit znovu</button>
      </Notice>
    ) : (
      <div className="admin-loading">
        <Loader2 className="admin-spin" /> Načítám fotografie webu…
      </div>
    );
  return (
    <form onSubmit={save}>
      <div className="admin-page-title">
        <div>
          <p className="admin-eyebrow">Váš obsah</p>
          <h1>Fotky webu</h1>
        </div>
        <button type="submit" className="admin-btn primary" disabled={!dirty || busy || uploading}>
          <Save size={16} /> {busy ? "Ukládám…" : "Uložit fotografie"}
        </button>
      </div>
      <p className="admin-description">
        Vyberte místo na webu a nahraďte fotografii. Stejný obrázek použitý na více stránkách se
        změní všude. Fotografie nemovitostí upravíte v Nemovitostech, fotografie článků v Článcích.
      </p>
      {error && (
        <Notice>
          {error}{" "}
          <button type="button" onClick={reload} disabled={busy || uploading}>
            Načíst aktuální obsah
          </button>
        </Notice>
      )}
      {message && <Notice success>{message}</Notice>}
      <label className="admin-photo-filter">
        Stránka nebo sekce
        <select value={group} onChange={(event) => setGroup(event.target.value)}>
          <option value="">Všechny fotografie</option>
          {[...new Set(websiteImages.flatMap((image) => [...image.groups]))].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <div className="admin-site-images">
        {websiteImages
          .filter((entry) => !group || (entry.groups as readonly string[]).includes(group))
          .map((entry) => {
            const src = draft.values[entry.key] ?? websiteImageDefaults[entry.key];
            return (
              <section className="admin-card admin-site-image" key={entry.key}>
                <h2>{entry.label}</h2>
                <p>{entry.groups.join(" · ")}</p>
                {src ? (
                  <img className="admin-site-image-preview" src={src} alt={entry.label} />
                ) : (
                  <div className="admin-empty">Původní portrét není k dispozici.</div>
                )}
                <label>
                  Popis fotografie
                  <input
                    value={draft.values[`${entry.key}.alt`] ?? entry.alt}
                    maxLength={500}
                    required
                    disabled={busy || uploading}
                    onChange={(event) => {
                      const values = { ...draft.values };
                      if (event.target.value === entry.alt) delete values[`${entry.key}.alt`];
                      else values[`${entry.key}.alt`] = event.target.value;
                      setDraft({ ...draft, values });
                      setMessage("");
                    }}
                  />
                </label>
                <ImagePicker
                  media={media}
                  onMediaChange={onMediaChange}
                  onSelect={(src) => edit(entry.key, src)}
                  disabled={busy || uploading}
                  onBusy={setUploading}
                />
                <div className="admin-image-actions">
                  <button
                    type="button"
                    className="admin-text-button"
                    onClick={() => edit(entry.key)}
                    disabled={
                      busy ||
                      uploading ||
                      (!draft.values[entry.key] && !draft.values[`${entry.key}.alt`])
                    }
                  >
                    <RotateCcw size={14} /> Původní fotografie
                  </button>
                  <a href={entry.path} target="_blank" rel="noopener noreferrer">
                    Otevřít stránku
                  </a>
                </div>
              </section>
            );
          })}
      </div>
      <p className="admin-description">
        {uploading ? "Nahrávám fotografii…" : dirty ? "Máte neuložené změny." : "Vše uloženo."}
      </p>
    </form>
  );
}
