import { tracking } from "@/config/site";
import { readConsent } from "./consent";

export type ConversionEvent =
  | "form_submit_contact"
  | "form_submit_valuation"
  | "property_inquiry"
  | "phone_click"
  | "email_click"
  | "whatsapp_click"
  | "guide_download";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Telefon do mezinárodního tvaru (+420…), jak ho chce Google. */
export function toE164(phone?: string | null) {
  const d = (phone || "").replace(/[^\d+]/g, "").replace(/^00/, "+");
  if (!d) return undefined;
  if (d.startsWith("+")) return d;
  return d.length === 9 ? `+420${d}` : undefined;
}

/**
 * Jediný bod pro měření. Konverze Google Ads se odešle vždy – bez souhlasu jen
 * jako anonymní signál bez cookies (pokročilý režim souhlasu). E-mail a telefon
 * (rozšířené konverze; gtag je před odesláním zahashuje) jdou jen se souhlasem
 * s marketingovými cookies. Ostatní nástroje (dataLayer, GA4, Meta) jen se souhlasem.
 */
export function track(
  event: ConversionEvent,
  params: Record<string, string | number | undefined> = {},
  user?: { email?: string | null; phone?: string | null },
) {
  if (typeof window === "undefined") return;
  const consent = readConsent();

  const label = tracking.googleAdsConversions[event];
  if (window.gtag && tracking.googleAdsId && label) {
    if (consent?.marketing && user) {
      const email = user.email?.trim().toLowerCase() || undefined;
      const phone_number = toE164(user.phone);
      if (email || phone_number) window.gtag("set", "user_data", { email, phone_number });
    }
    window.gtag("event", "conversion", { send_to: `${tracking.googleAdsId}/${label}` });
  }

  if (!consent || (!consent.analytics && !consent.marketing)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });

  if (consent.analytics && window.gtag && tracking.ga4Id) {
    window.gtag("event", event, params);
  }
  if (consent.marketing) {
    if (window.fbq && tracking.metaPixelId) {
      const metaMap: Partial<Record<ConversionEvent, string>> = {
        form_submit_contact: "Contact",
        form_submit_valuation: "Lead",
        property_inquiry: "Lead",
        guide_download: "CompleteRegistration",
        phone_click: "Contact",
        whatsapp_click: "Contact",
      };
      const m = metaMap[event];
      if (m) window.fbq("track", m, { content_name: event });
      else window.fbq("trackCustom", event);
    }
  }
}
