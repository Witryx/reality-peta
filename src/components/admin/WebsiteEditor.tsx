import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ExternalLink, Loader2, RotateCcw, Save, Search } from "lucide-react";
import { websiteFields as catalog } from "@/data/website-fields";
import { api } from "@/lib/api";
import type { WebsiteContent } from "@/lib/site-copy";
import { Notice, errorMessage } from "./AdminPanel";

const paths: Record<string, string> = {
  "Úvodní stránka": "/",
  Služby: "/sluzby",
  Egypt: "/egypt",
  "O mně": "/o-mne",
  Reference: "/reference",
  Kontakt: "/kontakt",
  Nabídka: "/nabidka",
  Články: "/clanky",
  Cookies: "/cookies",
  "Ochrana osobních údajů": "/ochrana-osobnich-udaju",
  Formuláře: "/kontakt",
};
const groups = [...new Set(catalog.flatMap((entry) => entry.groups))];
const searchText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function WebsiteEditor({ onDirty }: { onDirty: (value: boolean) => void }) {
  const router = useRouter();
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-website"],
    queryFn: () => api<WebsiteContent>("/api/admin/website"),
    refetchOnWindowFocus: false,
  });
  const [draft, setDraft] = useState<WebsiteContent | null>(null);
  const baseline = useRef("");
  const [group, setGroup] = useState("Úvodní stránka");
  const [search, setSearch] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const dirty = draft !== null && JSON.stringify(draft.values) !== baseline.current;
  useEffect(() => {
    if (query.data && !draft) {
      baseline.current = JSON.stringify(query.data.values);
      setDraft(query.data);
    }
  }, [query.data, draft]);
  useEffect(() => {
    onDirty(dirty);
    return () => onDirty(false);
  }, [dirty, onDirty]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || busy) return;
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
      onDirty(false);
      setMessage("Texty jsou uložené a zobrazují se na webu. Není potřeba nové nasazení.");
      await router.invalidate();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    if (dirty && !window.confirm("Načíst aktuální texty a zahodit vaše neuložené změny?")) return;
    setBusy(true);
    setError("");
    try {
      const latest = await api<WebsiteContent>("/api/admin/website");
      baseline.current = JSON.stringify(latest.values);
      setDraft(latest);
      client.setQueryData(["admin-website"], latest);
      client.setQueryData(["admin-website-images"], latest);
      onDirty(false);
      setMessage("Aktuální obsah je načtený.");
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  function edit(key: string, value: string | undefined) {
    if (!draft) return;
    const values = { ...draft.values };
    const original = catalog.find((entry) => entry.key === key)?.default;
    if (value === undefined || value === original) delete values[key];
    else values[key] = value;
    setDraft({ ...draft, values });
    setMessage("");
  }
  if (query.error && !draft)
    return (
      <Notice>
        {errorMessage(query.error)} <button onClick={() => query.refetch()}>Zkusit znovu</button>
      </Notice>
    );
  if (!draft)
    return (
      <div className="admin-loading">
        <Loader2 className="admin-spin" /> Načítám texty webu…
      </div>
    );
  const needle = searchText(search.trim());
  const visible = catalog.filter(
    (entry) =>
      (!group || entry.groups.includes(group)) &&
      (!onlyChanged || draft.values[entry.key] !== undefined) &&
      (!needle ||
        searchText(
          `${entry.label ?? ""} ${entry.default} ${draft.values[entry.key] ?? ""}`,
        ).includes(needle)),
  );
  return (
    <form onSubmit={save} className="admin-website-editor">
      <div className="admin-page-title">
        <div>
          <p className="admin-eyebrow">Váš obsah</p>
          <h1>Texty webu</h1>
        </div>
        <a
          href={paths[group] ?? "/"}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn"
        >
          Otevřít stránku <ExternalLink size={16} />
        </a>
      </div>
      <p className="admin-description">
        Vyberte stránku, přepište text a uložte změny. Fotografie upravíte v sekci Fotky webu.
        Rozložení a funkce webu zůstanou zachované. Text rozdělený zalomením nebo zvýrazněním má
        samostatná pole. Stejný text použitý vícekrát se upraví na všech těchto místech.
      </p>
      {error && (
        <Notice>
          {error}{" "}
          <button type="button" disabled={busy} onClick={reload}>
            Načíst aktuální texty
          </button>
        </Notice>
      )}
      {message && <Notice success>{message}</Notice>}
      <div className="admin-card admin-website-toolbar">
        <label>
          Stránka nebo sekce
          <select value={group} onChange={(event) => setGroup(event.target.value)}>
            <option value="">Všechny texty</option>
            {groups.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Najít text
          <span className="admin-website-search">
            <Search size={16} aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Napište část nadpisu nebo odstavce"
            />
          </span>
        </label>
        <label className="admin-checkbox">
          <input
            type="checkbox"
            checked={onlyChanged}
            onChange={(event) => setOnlyChanged(event.target.checked)}
          />{" "}
          Jen upravené texty
        </label>
        <button className="admin-btn primary" type="submit" disabled={busy || !dirty}>
          {busy ? <Loader2 className="admin-spin" size={16} /> : <Save size={16} />}
          {busy ? "Ukládám…" : "Uložit texty"}
        </button>
        <p className="admin-website-summary">
          {visible.length} textů · {dirty ? "Máte neuložené změny" : "Vše uloženo"}
        </p>
      </div>
      <div className="admin-website-fields">
        {visible.map((entry, index) => {
          const value = draft.values[entry.key] ?? entry.default;
          const changed = draft.values[entry.key] !== undefined;
          return (
            <section className="admin-card admin-website-field" key={entry.key}>
              <div className="admin-website-field-heading">
                <span>
                  {entry.groups.join(" · ")}
                  {changed && <b>Upraveno</b>}
                </span>
                <button
                  type="button"
                  className="admin-text-button"
                  disabled={!changed || busy}
                  onClick={() => edit(entry.key, undefined)}
                  aria-label={`Obnovit původní text ${index + 1}`}
                >
                  <RotateCcw size={14} /> Původní znění
                </button>
              </div>
              <label htmlFor={entry.key}>
                {entry.label ??
                  (entry.default.length > 100 ? `${entry.default.slice(0, 97)}…` : entry.default)}
              </label>
              {entry.kind ? (
                <input
                  id={entry.key}
                  value={value}
                  disabled={busy}
                  maxLength={entry.max ?? 10000}
                  type={entry.kind === "url" || entry.kind === "email" ? entry.kind : "text"}
                  onChange={(event) => edit(entry.key, event.target.value)}
                />
              ) : (
                <textarea
                  id={entry.key}
                  value={value}
                  disabled={busy}
                  maxLength={entry.max ?? 10000}
                  rows={entry.default.length > 300 ? 6 : entry.default.length > 100 ? 4 : 2}
                  onChange={(event) => edit(entry.key, event.target.value)}
                />
              )}
              <div className="admin-website-field-footer">
                <span>
                  {value.length} / {entry.max ?? 10000} znaků
                </span>
                {entry.groups.length > 1 && <span>Sdílený text na více stránkách</span>}
              </div>
              {changed && (
                <details className="admin-website-original">
                  <summary>Původní text</summary>
                  <p>{entry.default}</p>
                </details>
              )}
            </section>
          );
        })}
        {!visible.length && (
          <div className="admin-empty">
            <h3>Žádné odpovídající texty</h3>
            <p>Změňte hledání, stránku nebo filtr upravených textů.</p>
          </div>
        )}
      </div>
    </form>
  );
}
