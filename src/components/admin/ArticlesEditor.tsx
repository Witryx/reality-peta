import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { AdminArticle, Article } from "@/data/article-types";
import type { Media, Publication } from "@/data/admin";
import { publicationLabel } from "@/data/admin";
import { today } from "@/lib/dates";
import { api } from "@/lib/api";
import { Notice, errorMessage } from "./AdminPanel";
import { ImagePicker } from "./ImagePicker";

type SectionDraft = { heading: string; paragraphs: string; bullets: string };
type Draft = Omit<Article, "sections" | "image"> & {
  image?: Article["image"] | undefined;
  sections: SectionDraft[];
  publication: Publication;
  version?: number;
};
const emptySection = (): SectionDraft => ({ heading: "", paragraphs: "", bullets: "" });
function makeDraft(article: AdminArticle | null): Draft {
  if (!article)
    return {
      slug: "",
      title: "",
      category: "Reality",
      excerpt: "",
      readingMinutes: 3,
      updatedAt: today(),
      publication: "draft",
      sections: [emptySection()],
    };
  const { id: _id, ...rest } = article;
  return {
    ...rest,
    sections: article.sections.map((section) => ({
      heading: section.heading ?? "",
      paragraphs: section.paragraphs?.join("\n\n") ?? "",
      bullets: section.bullets?.join("\n") ?? "",
    })),
  };
}
const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 160);

export function ArticlesEditor({
  media,
  onMediaChange,
  onDirty,
}: {
  media: Media[];
  onMediaChange: () => Promise<unknown>;
  onDirty: (dirty: boolean) => void;
}) {
  const client = useQueryClient();
  const router = useRouter();
  const query = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api<{ items: AdminArticle[] }>("/api/admin/articles"),
    refetchOnWindowFocus: false,
  });
  const [editing, setEditing] = useState<AdminArticle | "new" | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const baseline = useRef("");
  const dirty = !!draft && JSON.stringify(draft) !== baseline.current;
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
  function open(article: AdminArticle | "new") {
    const value = makeDraft(article === "new" ? null : article);
    baseline.current = JSON.stringify(value);
    setDraft(value);
    setEditing(article);
    setError("");
    setMessage("");
  }
  function edit(patch: Partial<Draft>) {
    setDraft((value) => (value ? { ...value, ...patch } : value));
    setMessage("");
  }
  function section(index: number, patch: Partial<SectionDraft>) {
    if (draft)
      edit({
        sections: draft.sections.map((value, i) => (i === index ? { ...value, ...patch } : value)),
      });
  }
  function move(index: number, offset: number) {
    if (!draft) return;
    const sections = [...draft.sections];
    [sections[index], sections[index + offset]] = [sections[index + offset]!, sections[index]!];
    edit({ sections });
  }
  async function refresh() {
    await client.invalidateQueries({ queryKey: ["admin-articles"] });
    await router.invalidate();
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft || !editing || busy || uploading) return;
    setBusy(true);
    setError("");
    const input = {
      ...draft,
      sections: draft.sections.map((value) => ({
        ...(value.heading.trim() ? { heading: value.heading.trim() } : {}),
        paragraphs: value.paragraphs
          .split(/\n\s*\n/)
          .map((text) => text.trim())
          .filter(Boolean),
        bullets: value.bullets
          .split("\n")
          .map((text) => text.trim())
          .filter(Boolean),
      })),
    };
    try {
      await api(`/api/admin/articles${editing === "new" ? "" : `/${editing.id}`}`, {
        method: editing === "new" ? "POST" : "PUT",
        body: JSON.stringify(input),
      });
      setDraft(null);
      setEditing(null);
      setMessage("Článek je uložený.");
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    if (
      !editing ||
      editing === "new" ||
      !window.confirm("Načíst aktuální článek a zahodit vaše neuložené změny?")
    )
      return;
    setBusy(true);
    try {
      const latest = await api<{ items: AdminArticle[] }>("/api/admin/articles");
      const article = latest.items.find((item) => item.id === editing.id);
      if (!article) throw new Error("Článek byl smazán. Vraťte se na seznam.");
      open(article);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  async function remove(article: AdminArticle) {
    if (!window.confirm(`Smazat článek „${article.title}“?`)) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/articles/${article.id}?version=${article.version}`, {
        method: "DELETE",
        body: "{}",
      });
      setMessage("Článek je smazaný.");
      await refresh();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  if (draft && editing)
    return (
      <form onSubmit={save}>
        <div className="admin-page-title">
          <div>
            <p className="admin-eyebrow">Blog</p>
            <h1>{editing === "new" ? "Nový článek" : "Upravit článek"}</h1>
          </div>
          <div className="admin-image-actions">
            <button
              type="button"
              className="admin-btn"
              disabled={busy || uploading}
              onClick={() => {
                if (!dirty || window.confirm("Odejít bez uložení článku?")) {
                  setDraft(null);
                  setEditing(null);
                  setError("");
                }
              }}
            >
              <ArrowLeft size={16} /> Zpět na seznam
            </button>
            <button type="submit" className="admin-btn primary" disabled={busy || uploading}>
              <Save size={16} /> {busy ? "Ukládám…" : "Uložit článek"}
            </button>
          </div>
        </div>
        {error && (
          <Notice>
            {error}{" "}
            {editing !== "new" && (
              <button type="button" disabled={busy || uploading} onClick={reload}>
                Načíst aktuální článek
              </button>
            )}
          </Notice>
        )}
        <fieldset disabled={busy || uploading} className="admin-article-fields">
          <section className="admin-card admin-website-field">
            <label>
              Název článku
              <input
                value={draft.title}
                required
                minLength={2}
                maxLength={250}
                onChange={(event) => {
                  const title = event.target.value;
                  edit({
                    title,
                    ...(editing === "new" && (!draft.slug || draft.slug === slugify(draft.title))
                      ? { slug: slugify(title) }
                      : {}),
                  });
                }}
              />
            </label>
            <label>
              URL článku
              <input
                value={draft.slug}
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                minLength={2}
                maxLength={160}
                onChange={(event) => edit({ slug: event.target.value })}
              />
            </label>
            <p className="admin-description">
              /clanky/{draft.slug || "nazev-clanku"}
              {editing !== "new" && " · Změnou URL přestane původní odkaz fungovat."}
            </p>
            <div className="admin-article-meta">
              <label>
                Kategorie
                <input
                  value={draft.category}
                  required
                  maxLength={100}
                  onChange={(event) => edit({ category: event.target.value })}
                />
              </label>
              <label>
                Stav
                <select
                  value={draft.publication}
                  onChange={(event) => edit({ publication: event.target.value as Publication })}
                >
                  {Object.entries(publicationLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Datum aktualizace
                <input
                  type="date"
                  required
                  value={draft.updatedAt}
                  onChange={(event) => edit({ updatedAt: event.target.value })}
                />
              </label>
              <label>
                Minut čtení
                <input
                  type="number"
                  min={1}
                  max={120}
                  required
                  value={draft.readingMinutes}
                  onChange={(event) => edit({ readingMinutes: Number(event.target.value) })}
                />
              </label>
            </div>
            <label>
              Úvodní shrnutí
              <textarea
                rows={4}
                required
                maxLength={2000}
                value={draft.excerpt}
                onChange={(event) => edit({ excerpt: event.target.value })}
              />
            </label>
          </section>
          <section className="admin-card admin-website-field">
            <h2>Titulní fotografie</h2>
            {draft.image && (
              <>
                <img
                  className="admin-site-image-preview"
                  src={draft.image.src}
                  alt={draft.image.alt}
                />
                <label>
                  Popis fotografie
                  <input
                    required
                    maxLength={500}
                    value={draft.image.alt}
                    onChange={(event) =>
                      edit({ image: { src: draft.image!.src, alt: event.target.value } })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="admin-text-button"
                  onClick={() => edit({ image: undefined })}
                >
                  Odebrat fotografii
                </button>
              </>
            )}
            <ImagePicker
              media={media}
              onMediaChange={onMediaChange}
              onBusy={setUploading}
              onSelect={(src) => edit({ image: { src, alt: draft.image?.alt || draft.title } })}
            />
          </section>
          {draft.sections.map((value, index) => (
            <section className="admin-card admin-website-field" key={index}>
              <div className="admin-website-field-heading">
                <h2>Sekce {index + 1}</h2>
                <div className="admin-image-actions">
                  <button
                    type="button"
                    className="admin-btn"
                    aria-label={`Posunout sekci ${index + 1} nahoru`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    aria-label={`Posunout sekci ${index + 1} dolů`}
                    disabled={index === draft.sections.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-btn"
                    aria-label={`Odebrat sekci ${index + 1}`}
                    disabled={draft.sections.length === 1}
                    onClick={() => {
                      if (
                        (!value.heading && !value.paragraphs && !value.bullets) ||
                        window.confirm("Odebrat sekci včetně jejího obsahu?")
                      )
                        edit({ sections: draft.sections.filter((_, i) => i !== index) });
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <label>
                Nadpis sekce
                <input
                  value={value.heading}
                  maxLength={250}
                  onChange={(event) => section(index, { heading: event.target.value })}
                />
              </label>
              <label>
                Odstavce (oddělte prázdným řádkem)
                <textarea
                  value={value.paragraphs}
                  rows={8}
                  onChange={(event) => section(index, { paragraphs: event.target.value })}
                />
              </label>
              <label>
                Odrážky (jeden bod na řádek)
                <textarea
                  value={value.bullets}
                  rows={4}
                  onChange={(event) => section(index, { bullets: event.target.value })}
                />
              </label>
            </section>
          ))}
          <button
            type="button"
            className="admin-btn"
            disabled={draft.sections.length >= 50}
            onClick={() => edit({ sections: [...draft.sections, emptySection()] })}
          >
            <Plus size={16} /> Přidat sekci
          </button>
        </fieldset>
        <p className="admin-description">
          {uploading
            ? "Nahrávám fotografii…"
            : dirty
              ? "Máte neuložené změny."
              : "Koncepty a archivované články se návštěvníkům nezobrazují."}
        </p>
      </form>
    );
  return (
    <>
      <div className="admin-page-title">
        <div>
          <p className="admin-eyebrow">Blog</p>
          <h1>Články</h1>
        </div>
        <button className="admin-btn primary" onClick={() => open("new")} disabled={busy}>
          <Plus size={16} /> Přidat článek
        </button>
      </div>
      {error && <Notice>{error}</Notice>}
      {message && <Notice success>{message}</Notice>}
      {query.error && (
        <Notice>
          {errorMessage(query.error)} <button onClick={() => query.refetch()}>Zkusit znovu</button>
        </Notice>
      )}
      <div className="admin-article-meta">
        <label>
          Najít článek
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <label>
          Stav článku
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">Všechny stavy</option>
            {Object.entries(publicationLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {query.isPending ? (
        <div className="admin-loading">
          <Loader2 className="admin-spin" /> Načítám články…
        </div>
      ) : (
        <div className="admin-website-fields">
          {query.data?.items
            .filter(
              (article) =>
                (!filter || article.publication === filter) &&
                `${article.title} ${article.category}`
                  .toLocaleLowerCase("cs")
                  .includes(search.toLocaleLowerCase("cs")),
            )
            .map((article) => (
              <section key={article.id} className="admin-card admin-website-field">
                <div className="admin-website-field-heading">
                  <span>
                    {article.category} · {article.updatedAt}
                  </span>
                  <span className={`admin-badge ${article.publication}`}>
                    {publicationLabel[article.publication]}
                  </span>
                </div>
                <h2>{article.title}</h2>
                <p className="admin-description">{article.excerpt}</p>
                <div className="admin-image-actions">
                  <button className="admin-btn" disabled={busy} onClick={() => open(article)}>
                    Upravit článek
                  </button>
                  {article.publication === "published" && (
                    <a
                      className="admin-btn"
                      href={`/clanky/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Otevřít na webu
                    </a>
                  )}
                  <button
                    className="admin-btn"
                    disabled={busy}
                    onClick={() => void remove(article)}
                  >
                    <Trash2 size={16} /> Smazat
                  </button>
                </div>
              </section>
            ))}
        </div>
      )}
      {query.data?.items.length === 0 && (
        <div className="admin-empty">Zatím nemáte žádné články. Přidejte první článek.</div>
      )}
    </>
  );
}
