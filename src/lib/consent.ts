export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  /** Kdy návštěvník volbu učinil (ISO). */
  decidedAt: string;
  /** Verze textu lišty – při změně textu zvýšit, lišta se zobrazí znovu. */
  version: number;
};

export const CONSENT_VERSION = 4;
const KEY = "ppr-consent";
export const CONSENT_EVENT = "ppr-consent-change";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as ConsentState;
    return c.version === CONSENT_VERSION ? c : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing: boolean) {
  const c: ConsentState = {
    necessary: true,
    analytics,
    marketing,
    decidedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
  return c;
}

export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent("ppr-open-consent"));
}
