import { useSiteConfig } from "@/lib/website-context";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Globe2,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { today } from "@/lib/dates";
import { site } from "@/config/site";
import { BrandLockup } from "@/components/BrandLockup";
import { formatPrice, statusLabel, type Property, type PropertyImage } from "@/data/types";
import {
  leadKindLabel,
  leadStatusLabel,
  publicationLabel,
  type AdminProperty,
  type Lead,
  type Media,
} from "@/data/admin";
import { PropertyEditor } from "./PropertyEditor";
import { WebsiteEditor } from "./WebsiteEditor";
import { ArticlesEditor } from "./ArticlesEditor";
import { WebsiteImagesEditor } from "./WebsiteImagesEditor";
import { useDialogFocus } from "./useDialogFocus";
import "./admin.css";

type Admin = { id: string; name: string; email: string };
type Page =
  | "overview"
  | "properties"
  | "leads"
  | "media"
  | "website"
  | "websiteImages"
  | "articles"
  | "settings";
const pages = [
  { id: "overview", label: "Přehled", icon: LayoutDashboard },
  { id: "properties", label: "Nemovitosti", icon: Building2 },
  { id: "leads", label: "Poptávky", icon: Mail },
  { id: "media", label: "Fotografie", icon: ImagePlus },
  { id: "articles", label: "Články", icon: FileText },
  { id: "websiteImages", label: "Fotky webu", icon: ImagePlus },
  { id: "website", label: "Texty webu", icon: FileText },
  { id: "settings", label: "Nastavení", icon: Settings },
] as const;
export const date = (v: string) =>
  new Date(v).toLocaleDateString("cs-CZ", { day: "numeric", month: "short", year: "numeric" });
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : "Operace se nepodařila.";
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function Notice({ children, success = false }: { children: ReactNode; success?: boolean }) {
  return (
    <div
      className={`admin-notice ${success ? "is-success" : ""}`}
      role={success ? "status" : "alert"}
    >
      {children}
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <Building2 size={34} strokeWidth={1.3} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-page-title">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}
function Login({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      onSuccess();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-login">
      <a href="/" className="admin-login-brand">
        <BrandLockup compact />
      </a>
      <div className="admin-login-card">
        <p className="admin-eyebrow">Váš pracovní prostor</p>
        <h1>Vítejte zpátky.</h1>
        <p>Nabídky, klienti a vše důležité na jednom místě.</p>
        <form onSubmit={submit}>
          <label>
            E-mail
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Heslo
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              maxLength={200}
            />
          </label>
          {error && <Notice>{error}</Notice>}
          <button className="admin-btn primary" disabled={busy}>
            {busy ? <Loader2 className="admin-spin" size={18} /> : <ArrowRight size={18} />}{" "}
            Přihlásit se
          </button>
        </form>
        <p className="admin-login-help">
          <ShieldCheck size={15} /> Přístup pouze pro správce webu.
        </p>
      </div>
      <a href="/" className="admin-back">
        <ArrowLeft size={16} /> Zpět na web
      </a>
    </div>
  );
}

export function AdminPanel() {
  const site = useSiteConfig();

  const query = useQueryClient();
  const session = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => api<{ admin: Admin }>("/api/admin/session"),
    retry: false,
    staleTime: 60_000,
  });
  const [page, setPage] = useState<Page>("overview");
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState<AdminProperty | "new" | null>(null);
  const [notice, setNotice] = useState("");
  const [contentDirty, setContentDirty] = useState(false);
  const enabled = Boolean(session.data);
  const properties = useQuery({
    queryKey: ["admin-properties"],
    queryFn: () => api<{ items: AdminProperty[] }>("/api/admin/properties"),
    enabled,
  });
  const leads = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => api<{ items: Lead[] }>("/api/admin/leads"),
    enabled,
  });
  const media = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => api<{ items: Media[] }>("/api/admin/media"),
    enabled,
  });
  const authError = [properties.error, leads.error, media.error].some(
    (e) => e instanceof ApiError && e.status === 401,
  );
  useEffect(() => {
    if (authError) void query.resetQueries({ queryKey: ["admin-session"] });
  }, [authError, query]);
  async function refresh() {
    await Promise.all([
      query.invalidateQueries({ queryKey: ["admin-properties"] }),
      query.invalidateQueries({ queryKey: ["admin-leads"] }),
      query.invalidateQueries({ queryKey: ["admin-media"] }),
    ]);
  }
  async function logout() {
    if (contentDirty && !window.confirm("Odhlásit se bez uložení změn?")) return;
    try {
      await api("/api/admin/logout", { method: "POST", body: "{}" });
      await query.resetQueries({ queryKey: ["admin-session"] });
      query.removeQueries({ predicate: (q) => q.queryKey[0] !== "admin-session" });
    } catch (e) {
      setNotice(errorMessage(e));
    }
  }
  if (session.isPending)
    return (
      <div className="admin-loading">
        <Loader2 className="admin-spin" /> Načítám pracovní prostor…
      </div>
    );
  if (!session.data)
    return (
      <div className="admin-root">
        {session.error instanceof ApiError && session.error.status !== 401 ? (
          <div className="admin-setup">
            <Notice>{session.error.message}</Notice>
            <p>
              Pro první spuštění nastavte databázi, spusťte migraci a vytvořte správce. Podrobný
              postup je v README.md.
            </p>
            <button className="admin-btn" onClick={() => session.refetch()}>
              Zkusit znovu
            </button>
          </div>
        ) : (
          <Login onSuccess={() => query.invalidateQueries({ queryKey: ["admin-session"] })} />
        )}
      </div>
    );
  const all = properties.data?.items ?? [];
  const inquiries = leads.data?.items ?? [];
  const newLeads = inquiries.filter((l) => l.status === "new").length;
  return (
    <div className="admin-root">
      <aside className={`admin-sidebar ${menu ? "open" : ""}`}>
        <a href="/admin" className="admin-brand">
          <BrandLockup compact />
        </a>
        <p className="admin-nav-label">PRACOVNÍ PROSTOR</p>
        <nav aria-label="Administrace">
          {pages.map((p) => (
            <button
              key={p.id}
              className={page === p.id ? "active" : ""}
              aria-current={page === p.id ? "page" : undefined}
              onClick={() => {
                if (page === p.id && !editing) {
                  setMenu(false);
                  return;
                }
                if (
                  (editing || contentDirty) &&
                  !window.confirm("Odejít z editoru? Neuložené změny se ztratí.")
                )
                  return;
                setPage(p.id);
                setEditing(null);
                setMenu(false);
                setNotice("");
                setContentDirty(false);
              }}
            >
              <p.icon size={19} />
              {p.label}
              {p.id === "leads" && newLeads > 0 && (
                <span className="admin-nav-count">{newLeads}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <Globe2 size={18} /> Otevřít web <ExternalLink size={13} />
          </a>
          <div className="admin-account">
            <span className="admin-avatar">{session.data.admin.name.slice(0, 1)}</span>
            <div>
              {session.data.admin.name}
              <small>Administrátor</small>
            </div>
            <button onClick={logout} aria-label="Odhlásit se">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="admin-scrim"
          aria-label="Zavřít navigaci"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            aria-label="Otevřít navigaci"
            onClick={() => setMenu(!menu)}
          >
            <Menu size={22} />
          </button>
          <span>
            Pracovní prostor{" "}
            <span className="admin-breadcrumb">/ {pages.find((p) => p.id === page)?.label}</span>
          </span>
          <span className="admin-topbar-status">
            <span /> Vlastní správa webu
          </span>
        </header>
        <div className="admin-content">
          {notice && <Notice success>{notice}</Notice>}
          {[properties.error, leads.error, media.error]
            .filter(Boolean)
            .slice(0, 1)
            .map((e, i) => (
              <Notice key={i}>
                {errorMessage(e)} <button onClick={refresh}>Zkusit znovu</button>
              </Notice>
            ))}
          {properties.isPending || leads.isPending ? (
            <div className="admin-loading">
              <Loader2 className="admin-spin" /> Načítám data…
            </div>
          ) : editing ? (
            <PropertyEditor
              initial={editing === "new" ? null : editing}
              media={media.data?.items ?? []}
              onCancel={() => {
                setEditing(null);
              }}
              onSaved={async () => {
                setEditing(null);
                await refresh();
                setNotice("Nabídka je uložená.");
              }}
              onMediaChange={refresh}
            />
          ) : (
            <>
              {page === "overview" && (
                <Overview
                  properties={all}
                  leads={inquiries}
                  admin={session.data.admin}
                  onNew={() => {
                    setPage("properties");
                    setEditing("new");
                  }}
                  onPage={setPage}
                  onEdit={setEditing}
                />
              )}
              {page === "properties" && (
                <Properties
                  items={all}
                  onNew={() => setEditing("new")}
                  onEdit={setEditing}
                  refresh={refresh}
                />
              )}
              {page === "leads" && <Leads items={inquiries} refresh={refresh} />}
              {page === "website" && <WebsiteEditor onDirty={setContentDirty} />}
              {page === "articles" && (
                <ArticlesEditor
                  media={media.data?.items ?? []}
                  onMediaChange={refresh}
                  onDirty={setContentDirty}
                />
              )}
              {page === "websiteImages" && (
                <WebsiteImagesEditor
                  media={media.data?.items ?? []}
                  onMediaChange={refresh}
                  onDirty={setContentDirty}
                />
              )}
              {page === "media" && (
                <MediaLibrary items={media.data?.items ?? []} refresh={refresh} />
              )}
              {page === "settings" && (
                <AdminSettings
                  admin={session.data.admin}
                  onPasswordChange={() => {
                    void query.resetQueries({ queryKey: ["admin-session"] });
                  }}
                />
              )}
            </>
          )}
          <footer className="admin-footer">
            {site.name}
            <span>Váš web. Vaše data.</span>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Overview({
  properties,
  leads,
  admin,
  onNew,
  onPage,
  onEdit,
}: {
  properties: AdminProperty[];
  leads: Lead[];
  admin: Admin;
  onNew: () => void;
  onPage: (p: Page) => void;
  onEdit: (p: AdminProperty) => void;
}) {
  const published = properties.filter((p) => p.publication === "published");
  const active = published.filter((p) => p.status === "active");
  const newLeads = leads.filter((l) => l.status === "new");
  return (
    <>
      <PageTitle eyebrow="Vše pod kontrolou" title={`Dobrý den, ${admin.name.split(" ")[0]}.`}>
        <button className="admin-btn primary" onClick={onNew}>
          <Plus size={18} /> Přidat nemovitost
        </button>
      </PageTitle>
      <div className="admin-welcome">
        <div>
          <p className="admin-eyebrow">Prostor pro další příběhy</p>
          <h2>
            Každý domov začíná
            <br />
            dobře vedenou nabídkou.
          </h2>
          <p>
            {newLeads.length
              ? `Máte ${newLeads.length} nových poptávek, které čekají na odpověď.`
              : "Připravte nabídku, přidejte fotografie a spojte se s novými zájemci."}
          </p>
          <button onClick={() => onPage("leads")}>
            Přejít na poptávky <ArrowRight size={16} />
          </button>
        </div>
        <div className="admin-house-art" aria-hidden="true">
          <div className="art-house">
            <i />
            <i />
            <i />
          </div>
          <div className="art-line" />
          <span>BYDLENÍ V POHODĚ.</span>
        </div>
      </div>
      <div className="admin-stats">
        {[
          {
            label: "Celkem nemovitostí",
            value: properties.length,
            note: `${properties.filter((p) => p.publication === "draft").length} rozepsaných konceptů`,
            icon: Building2,
          },
          {
            label: "Aktivních nabídek",
            value: active.length,
            note: `${published.filter((p) => p.status === "reserved").length} rezervovaných`,
            icon: Globe2,
          },
          {
            label: "Nových poptávek",
            value: newLeads.length,
            note: "Čekají na první kontakt",
            icon: Mail,
          },
          {
            label: "Uzavřených prodejů",
            value: published.filter((p) => p.status === "sold").length,
            note: "Zveřejněné prodané nabídky",
            icon: Check,
          },
        ].map((s) => (
          <div className="admin-stat" key={s.label}>
            <p>
              {s.label}
              <s.icon size={18} />
            </p>
            <strong>{s.value.toString().padStart(2, "0")}</strong>
            <small>{s.note}</small>
          </div>
        ))}
      </div>
      <div className="admin-overview-grid">
        <section className="admin-card">
          <div className="admin-card-heading">
            <h2>Poslední nabídky</h2>
            <button onClick={() => onPage("properties")}>
              Všechny <ArrowRight size={15} />
            </button>
          </div>
          {properties.length ? (
            properties.slice(0, 4).map((p) => (
              <button className="admin-property-row" key={p.id} onClick={() => onEdit(p)}>
                <PropertyThumb property={p} />
                <span>
                  <strong>{p.title}</strong>
                  <small>
                    {p.location.city || "Lokalita k doplnění"} · {p.area} m²
                  </small>
                </span>
                <span className={`admin-badge ${p.publication}`}>
                  {publicationLabel[p.publication]}
                </span>
              </button>
            ))
          ) : (
            <Empty
              title="Vaše první nabídka"
              description="Přidejte nemovitost a začněte připravovat její prezentaci."
            >
              <button className="admin-btn" onClick={onNew}>
                <Plus size={16} /> Přidat nabídku
              </button>
            </Empty>
          )}
        </section>
        <section className="admin-card">
          <div className="admin-card-heading">
            <h2>Nové poptávky</h2>
            <button onClick={() => onPage("leads")}>
              Všechny <ArrowRight size={15} />
            </button>
          </div>
          {newLeads.length ? (
            newLeads.slice(0, 4).map((l) => (
              <button className="admin-lead-row" key={l.id} onClick={() => onPage("leads")}>
                <span className="admin-avatar">{l.name.slice(0, 1)}</span>
                <span>
                  <strong>{l.name}</strong>
                  <small>
                    {leadKindLabel[l.kind]} · {date(l.created_at)}
                  </small>
                </span>
                <span className="admin-new-dot" />
              </button>
            ))
          ) : (
            <Empty
              title="Máte čistý stůl"
              description="Nové zprávy z formulářů se automaticky objeví tady."
            />
          )}
        </section>
      </div>
    </>
  );
}
function PropertyThumb({ property }: { property: Property }) {
  return property.images[0] ? (
    <img className="admin-property-thumb" src={property.images[0].src} alt="" />
  ) : (
    <span className="admin-property-thumb placeholder">
      <Building2 size={24} />
    </span>
  );
}
function Properties({
  items,
  onNew,
  onEdit,
  refresh,
}: {
  items: AdminProperty[];
  onNew: () => void;
  onEdit: (p: AdminProperty) => void;
  refresh: () => Promise<void>;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [market, setMarket] = useState("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const filtered = items.filter(
    (p) =>
      (filter === "all" || p.publication === filter) &&
      (market === "all" || (p.market ?? "cz") === market) &&
      `${p.title} ${p.location.city} ${p.slug}`.toLowerCase().includes(search.toLowerCase()),
  );
  const shown = filtered.slice((page - 1) * 10, page * 10);
  async function duplicate(p: AdminProperty) {
    setBusy(p.id);
    setError("");
    try {
      const copy = await api<AdminProperty>("/api/admin/properties", {
        method: "POST",
        body: JSON.stringify({
          ...p,
          title: `${p.title} – kopie`.slice(0, 200),
          slug: `${p.slug.slice(0, 175)}-kopie-${Date.now()}`,
          publication: "draft",
          featured: false,
          version: undefined,
        }),
      });
      await refresh();
      onEdit(copy);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  async function remove(p: AdminProperty) {
    if (
      !window.confirm(
        `Trvale smazat „${p.title}“? Fotografie zůstanou v knihovně. Nabídku můžete také archivovat v editoru.`,
      )
    )
      return;
    setBusy(p.id);
    setError("");
    try {
      await api(`/api/admin/properties/${p.id}?version=${p.version}`, {
        method: "DELETE",
        body: "{}",
      });
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <PageTitle eyebrow="Portfolio" title="Nemovitosti">
        <button className="admin-btn primary" onClick={onNew}>
          <Plus size={18} /> Přidat nemovitost
        </button>
      </PageTitle>
      <div className="admin-tabs">
        {["all", "published", "draft", "archived"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            key={f}
          >
            {f === "all" ? "Všechny nabídky" : publicationLabel[f as keyof typeof publicationLabel]}{" "}
            <span>{items.filter((p) => f === "all" || p.publication === f).length}</span>
          </button>
        ))}
      </div>
      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Hledat název, lokalitu nebo URL…"
            aria-label="Hledat nemovitosti"
          />
        </label>
        <select
          aria-label="Trh"
          value={market}
          onChange={(e) => {
            setMarket(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Všechny trhy</option>
          <option value="cz">Česko</option>
          <option value="egypt">Egypt</option>
        </select>
      </div>
      {error && <Notice>{error}</Notice>}
      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nemovitost</th>
              <th>Cena</th>
              <th>Stav</th>
              <th>Publikace</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>
                  <button className="admin-property-link" onClick={() => onEdit(p)}>
                    <PropertyThumb property={p} />
                    <span>
                      <strong>{p.title}</strong>
                      <small>
                        {p.market === "egypt" ? "Egypt" : "Česko"} ·{" "}
                        {p.location.city || "Bez lokality"} · {p.area} m²
                      </small>
                    </span>
                  </button>
                </td>
                <td className="admin-price">{formatPrice(p)}</td>
                <td>
                  <span className={`admin-badge ${p.status}`}>{statusLabel[p.status]}</span>
                </td>
                <td>
                  <span className={`admin-badge ${p.publication}`}>
                    {publicationLabel[p.publication]}
                  </span>
                  {p.publication === "published" && p.publishedAt > today() && (
                    <small>Od {date(p.publishedAt)}</small>
                  )}
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button onClick={() => onEdit(p)}>Upravit</button>
                    <button
                      disabled={busy === p.id}
                      onClick={() => duplicate(p)}
                      aria-label={`Duplikovat ${p.title}`}
                      title="Duplikovat"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      disabled={busy === p.id}
                      onClick={() => remove(p)}
                      aria-label={`Smazat ${p.title}`}
                      title="Smazat"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!shown.length && (
          <Empty
            title="Žádné nabídky"
            description={
              items.length
                ? "Zkuste upravit vyhledávání nebo filtry."
                : "Začněte první nemovitostí. Koncept zůstane skrytý návštěvníkům webu."
            }
          />
        )}
      </div>
      <Pagination page={page} count={filtered.length} size={10} onChange={setPage} />
    </>
  );
}
function Pagination({
  page,
  count,
  size,
  onChange,
}: {
  page: number;
  count: number;
  size: number;
  onChange: (n: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / size));
  return (
    <div className="admin-pagination">
      <span>
        {count
          ? `${(page - 1) * size + 1}–${Math.min(page * size, count)} z ${count}`
          : "0 záznamů"}
      </span>
      <div>
        <button
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Předchozí stránka"
        >
          <ChevronLeft size={17} />
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Další stránka"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

function Leads({ items, refresh }: { items: Lead[]; refresh: () => Promise<void> }) {
  const [selected, setSelected] = useState<Lead | null>(null);
  const [status, setStatus] = useState<Lead["status"]>("new");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const filtered = items.filter(
    (l) =>
      (filter === "all" || l.status === filter) &&
      `${l.name} ${l.email} ${l.phone ?? ""} ${l.property_slug ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  useDialogFocus(Boolean(selected), () => setSelected(null));
  function select(l: Lead) {
    setSelected(l);
    setNotes(l.notes);
    setStatus(l.status);
    setError("");
    setSaved(false);
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      const updated = await api<Lead>(`/api/admin/leads/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status,
          notes,
          updated_at: new Date(selected.updated_at).toISOString(),
        }),
      });
      setSelected(updated);
      setSaved(true);
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (
      !selected ||
      !window.confirm(`Trvale smazat poptávku od ${selected.name} včetně osobních údajů?`)
    )
      return;
    setBusy(true);
    try {
      await api(`/api/admin/leads/${selected.id}`, { method: "DELETE", body: "{}" });
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  function csv() {
    const escape = (s: unknown) =>
      `"${String(s ?? "")
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`;
    const rows = [
      ["Jméno", "E-mail", "Telefon", "Typ", "Stav", "Nemovitost", "Zpráva", "Poznámky", "Datum"],
      ...filtered.map((l) => [
        l.name,
        l.email,
        l.phone,
        leadKindLabel[l.kind],
        leadStatusLabel[l.status],
        l.property_slug,
        l.message,
        l.notes,
        date(l.created_at),
      ]),
    ];
    download(
      "poptavky.csv",
      "\ufeff" + rows.map((r) => r.map(escape).join(";")).join("\r\n"),
      "text/csv;charset=utf-8",
    );
  }
  return (
    <>
      <PageTitle eyebrow="Vztahy s klienty" title="Poptávky">
        <button className="admin-btn" onClick={csv}>
          <ArrowDownToLine size={17} /> Export CSV
        </button>
      </PageTitle>
      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            aria-label="Hledat poptávky"
            placeholder="Hledat klienta nebo nemovitost…"
          />
        </label>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Stav poptávky"
        >
          <option value="all">Všechny stavy</option>
          {Object.entries(leadStatusLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Klient</th>
              <th>Typ poptávky</th>
              <th>Stav</th>
              <th>Přijato</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.slice((page - 1) * 12, page * 12).map((l) => (
              <tr key={l.id}>
                <td>
                  <button className="admin-property-link" onClick={() => select(l)}>
                    <span className="admin-avatar">{l.name[0]}</span>
                    <span>
                      <strong>{l.name}</strong>
                      <small>{l.email}</small>
                    </span>
                  </button>
                </td>
                <td>{leadKindLabel[l.kind]}</td>
                <td>
                  <span className={`admin-badge ${l.status}`}>{leadStatusLabel[l.status]}</span>
                </td>
                <td>{date(l.created_at)}</td>
                <td>
                  <button className="admin-text-button" onClick={() => select(l)}>
                    Otevřít <ArrowRight size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <Empty
            title="Zatím žádné poptávky"
            description="Zprávy z kontaktního formuláře, odhadů ceny i nabídek najdete zde."
          />
        )}
      </div>
      <Pagination page={page} count={filtered.length} size={12} onChange={setPage} />
      {selected && (
        <div
          className="admin-dialog-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section
            className="admin-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Poptávka ${selected.name}`}
          >
            <button
              className="admin-dialog-close"
              onClick={() => setSelected(null)}
              aria-label="Zavřít"
            >
              <X size={22} />
            </button>
            <p className="admin-eyebrow">
              {leadKindLabel[selected.kind]} · {date(selected.created_at)}
            </p>
            <h2>{selected.name}</h2>
            <div className="admin-lead-contact">
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
              {selected.phone && (
                <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}>{selected.phone}</a>
              )}
            </div>
            {selected.property_slug && (
              <a
                className="admin-text-button"
                href={`/nabidka/${encodeURIComponent(selected.property_slug)}`}
                target="_blank"
                rel="noreferrer"
              >
                {selected.property_slug} <ExternalLink size={14} />
              </a>
            )}
            {selected.property_location && (
              <p>
                {selected.property_type} · {selected.property_location}{" "}
                {selected.property_size && `· ${selected.property_size} m²`}
              </p>
            )}
            <p className="admin-message">{selected.message || "Bez další zprávy."}</p>
            <label>
              Stav poptávky
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as Lead["status"]);
                  setSaved(false);
                }}
              >
                {Object.entries(leadStatusLabel).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Interní poznámky
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setSaved(false);
                }}
                rows={5}
                maxLength={10000}
                placeholder="Co jste s klientem domluvili…"
              />
            </label>
            {error && <Notice>{error}</Notice>}
            {saved && <Notice success>Poptávka je uložená.</Notice>}
            <div className="admin-dialog-actions">
              <button className="admin-btn danger" disabled={busy} onClick={remove}>
                <Trash2 size={16} /> Smazat
              </button>
              <button className="admin-btn primary" disabled={busy} onClick={save}>
                {busy ? "Ukládám…" : "Uložit změny"}
              </button>
            </div>
            <small>Souhlas se zpracováním údajů byl udělen při odeslání formuláře.</small>
          </section>
        </div>
      )}
    </>
  );
}

export async function uploadImages(
  files: FileList | File[],
  onProgress?: (text: string) => void,
): Promise<PropertyImage[]> {
  const images: PropertyImage[] = [];
  for (const [index, file] of Array.from(files).entries()) {
    if (file.size > 12 * 1024 * 1024) throw new Error(`${file.name}: maximální velikost je 12 MB.`);
    onProgress?.(`Nahrávám ${index + 1} z ${files.length}…`);
    const result = await api<{ src: string }>(
      `/api/admin/media?name=${encodeURIComponent(file.name)}`,
      { method: "POST", body: file, headers: { "Content-Type": "application/octet-stream" } },
    );
    images.push({ src: result.src, alt: file.name.replace(/\.[^.]+$/, ""), position: index });
  }
  return images;
}
function MediaLibrary({ items, refresh }: { items: Media[]; refresh: () => Promise<void> }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    setBusy("Nahrávám…");
    try {
      await uploadImages(files, setBusy);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      await refresh();
      setBusy("");
    }
  }
  async function remove(m: Media) {
    if (!window.confirm(`Smazat fotografii „${m.original_name}“ z úložiště?`)) return;
    setError("");
    try {
      await api(`/api/admin/media/${m.id}`, { method: "DELETE", body: "{}" });
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <PageTitle eyebrow="Vlastní úložiště" title="Fotografie">
        <label className="admin-btn primary admin-upload-label">
          <Plus size={17} /> {busy || "Nahrát fotografie"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={Boolean(busy)}
            onChange={(e) => {
              void upload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </PageTitle>
      <p className="admin-description">
        JPG, PNG, WebP nebo AVIF do 12 MB. Fotografie se automaticky zmenší a uloží jako WebP bez
        původních metadat.
      </p>
      {error && <Notice>{error}</Notice>}
      <div className="admin-media-grid">
        {items.map((m) => (
          <div className="admin-card admin-media-card" key={m.id}>
            <img src={`/uploads/${m.filename}`} alt={m.original_name} loading="lazy" />
            <div>
              <strong>{m.original_name}</strong>
              <small>
                {m.width} × {m.height} · {(m.bytes / 1024).toFixed(0)} KB
              </small>
              <button className="admin-text-button" onClick={() => remove(m)}>
                <Trash2 size={14} /> Smazat
              </button>
            </div>
          </div>
        ))}
      </div>
      {!items.length && (
        <div className="admin-card">
          <Empty
            title="Prostor pro vaše fotografie"
            description="Nahrajte fotky zde nebo přímo v editoru nemovitosti."
          />
        </div>
      )}
    </>
  );
}
function AdminSettings({
  admin,
  onPasswordChange,
}: {
  admin: Admin;
  onPasswordChange: () => void;
}) {
  const site = useSiteConfig();

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const audit = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () =>
      api<{ items: { id: string; action: string; created_at: string; admin_name: string }[] }>(
        "/api/admin/audit",
      ),
  });
  async function password(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError("");
    if (fd.get("next") !== fd.get("confirm")) {
      setError("Nová hesla se neshodují.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/admin/password", {
        method: "POST",
        body: JSON.stringify({ current: fd.get("current"), next: fd.get("next") }),
      });
      onPasswordChange();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  async function exportData() {
    setError("");
    try {
      const data = await api("/api/admin/export");
      download(`reality-${today()}.json`, JSON.stringify(data, null, 2), "application/json");
    } catch (e) {
      setError(errorMessage(e));
    }
  }
  return (
    <>
      <PageTitle eyebrow="Vlastní provoz" title="Nastavení" />
      {error && <Notice>{error}</Notice>}
      <div className="admin-settings-grid">
        <section className="admin-card admin-settings-card">
          <h2>Váš účet</h2>
          <p>
            {admin.name} · {admin.email}
          </p>
          <form onSubmit={password}>
            <label>
              Současné heslo
              <input
                type="password"
                name="current"
                autoComplete="current-password"
                required
                maxLength={200}
              />
            </label>
            <label>
              Nové heslo
              <input
                type="password"
                name="next"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={200}
              />
            </label>
            <label>
              Nové heslo znovu
              <input
                type="password"
                name="confirm"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={200}
              />
            </label>
            <small>Alespoň 12 znaků. Po změně se všechna přihlášení tohoto účtu ukončí.</small>
            <button className="admin-btn primary" disabled={busy}>
              {busy ? "Ukládám…" : "Změnit heslo"}
            </button>
          </form>
        </section>
        <div>
          <section className="admin-card admin-settings-card">
            <h2>Vaše data patří vám</h2>
            <p>
              Stáhněte nabídky, poptávky a seznam fotografií do JSON. Samotné soubory fotografií
              jsou součástí zálohy serveru.
            </p>
            <button className="admin-btn" onClick={exportData}>
              <ArrowDownToLine size={17} /> Exportovat data
            </button>
          </section>
          <section className="admin-card admin-settings-card">
            <h2>Údaje webu</h2>
            <p>
              Texty, kontakty, sociální odkazy a partnery upravíte v části Texty webu. Měřicí ID a
              produkční adresa se spravují v konfiguraci při nasazení.
            </p>
            <dl>
              <dt>Web</dt>
              <dd>{site.url || "Produkční URL zatím není nastavená"}</dd>
              <dt>Kontakt</dt>
              <dd>{site.contact.email}</dd>
              <dt>Úložiště</dt>
              <dd>Vlastní server · PostgreSQL · lokální fotografie</dd>
            </dl>
          </section>
        </div>
      </div>
      <section className="admin-card">
        <div className="admin-card-heading">
          <h2>Poslední aktivita</h2>
          <ShieldCheck size={18} />
        </div>
        {audit.error && <Notice>{errorMessage(audit.error)}</Notice>}
        <div className="admin-audit">
          {audit.data?.items.slice(0, 20).map((a) => (
            <div key={a.id}>
              <span>{a.admin_name || "Správce"}</span>
              <span>
                {(
                  {
                    "admin.login": "Přihlášení",
                    "website.update": "Úprava textů webu",
                    "admin.password": "Změna hesla",
                    "property.create": "Přidání nabídky",
                    "property.update": "Úprava nabídky",
                    "property.delete": "Smazání nabídky",
                    "lead.update": "Úprava poptávky",
                    "lead.delete": "Smazání poptávky",
                    "media.delete": "Smazání fotografie",
                  } as Record<string, string>
                )[a.action] || a.action}
              </span>
              <small>{date(a.created_at)}</small>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
