import { tracking } from "@/config/site";
import { readConsent } from "./consent";

export type ConversionEvent =
  | "form_submit_contact"
  | "form_submit_valuation"
  | "property_inquiry"
  | "phone_click"
  | "email_click"
  | "whatsapp_click";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Jediný bod pro měření. Událost vždy jde do window.dataLayer (GTM si ji
 * převezme), a pokud je souhlas a nástroj nakonfigurovaný, i do GA4/Ads/Meta.
 * Nikdy neposílá osobní údaje (jméno, e-mail, telefon).
 */
export function track(event: ConversionEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (!consent || (!consent.analytics && !consent.marketing)) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });

  if (consent.analytics && window.gtag && tracking.ga4Id) {
    window.gtag("event", event, params);
  }
  if (consent.marketing) {
    const label = tracking.googleAdsConversions[event];
    if (window.gtag && tracking.googleAdsId && label) {
      window.gtag("event", "conversion", { send_to: `${tracking.googleAdsId}/${label}` });
    }
    if (window.fbq && tracking.metaPixelId) {
      const metaMap: Partial<Record<ConversionEvent, string>> = {
        form_submit_contact: "Contact",
        form_submit_valuation: "Lead",
        property_inquiry: "Lead",
      };
      const m = metaMap[event];
      if (m) window.fbq("track", m, { content_name: event });
      else window.fbq("trackCustom", event);
    }
  }
}
