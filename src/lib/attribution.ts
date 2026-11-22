/**
 * Where a visitor came from (ad campaign, click ID, first page), attached only to a form
 * the visitor sends themselves. Kept in sessionStorage for this tab only — no cross-visit
 * tracking — so the agent can see which ad or post brought the enquiry.
 */
const KEY = "ppr-source";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type Source = Partial<Record<(typeof PARAMS)[number] | "click" | "landing" | "referrer", string>>;

function read(): Source | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Source) : null;
  } catch {
    return null;
  }
}

/** Call once on page load; the first landing of the visit wins, unless a new campaign arrives. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const next: Source = {};
  for (const p of PARAMS) {
    const v = url.searchParams.get(p);
    if (v) next[p] = v.slice(0, 120);
  }
  const fbclid = url.searchParams.get("fbclid");
  const gclid = url.searchParams.get("gclid") || url.searchParams.get("wbraid");
  if (fbclid) next.click = "Meta (fbclid)";
  else if (gclid) next.click = "Google Ads (gclid)";
  const isNewCampaign = Object.keys(next).length > 0;
  const current = read();
  if (current && !isNewCampaign) return;
  next.landing = url.pathname.slice(0, 120);
  const ref = document.referrer;
  if (ref && !ref.startsWith(window.location.origin)) {
    try {
      next.referrer = new URL(ref).hostname.slice(0, 120);
    } catch {
      /* ignore malformed referrer */
    }
  }
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: attribution is simply left out */
  }
}

/** One readable line for the lead, e.g. "facebook / paid / odhad-praha · Meta (fbclid) · vstup /prodej". */
export function attributionSummary(): string | null {
  if (typeof window === "undefined") return null;
  const s = read();
  if (!s) return null;
  const campaign = [s.utm_source, s.utm_medium, s.utm_campaign].filter(Boolean).join(" / ");
  const parts = [
    campaign,
    s.utm_content ? `reklama: ${s.utm_content}` : "",
    s.click ?? "",
    s.referrer ? `z webu ${s.referrer}` : "",
    s.landing ? `vstup ${s.landing}` : "",
  ].filter(Boolean);
  if (!campaign && !s.click && !s.referrer) parts.unshift("přímý vstup / vyhledávání");
  return parts.join(" · ").slice(0, 480) || null;
}
