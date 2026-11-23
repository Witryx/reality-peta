import { useEffect } from "react";
import { tracking } from "@/config/site";
import { CONSENT_EVENT, readConsent, type ConsentState } from "@/lib/consent";

function addScript(id: string, src?: string, inline?: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  if (src) {
    s.async = true;
    s.src = src;
  }
  if (inline) s.text = inline;
  document.head.appendChild(s);
}

let adsReady = false;
let ga4Ready = false;

/**
 * Značka Google Ads se načte vždy, ale v režimu souhlasu „zamítnuto“: bez souhlasu
 * neukládá cookies ani osobní údaje, posílá jen anonymní signál bez cookies
 * (pokročilý režim souhlasu Google). Ostatní nástroje (GA4, GTM, Meta) až po souhlasu.
 */
function apply(c: ConsentState | null) {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
  if (tracking.googleAdsId) {
    addScript("gtag", `https://www.googletagmanager.com/gtag/js?id=${tracking.googleAdsId}`);
    if (!adsReady) {
      adsReady = true;
      window.gtag("js", new Date());
      window.gtag("config", tracking.googleAdsId, { allow_enhanced_conversions: true });
    }
  }
  if (!c) return;

  const g = c.marketing ? "granted" : "denied";
  window.gtag("consent", "update", {
    analytics_storage: c.analytics ? "granted" : "denied",
    ad_storage: g,
    ad_user_data: g,
    ad_personalization: g,
  });

  if ((c.analytics || c.marketing) && tracking.gtmId) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    addScript("gtm", `https://www.googletagmanager.com/gtm.js?id=${tracking.gtmId}`);
  }
  if (c.analytics && tracking.ga4Id && !ga4Ready) {
    ga4Ready = true;
    addScript("gtag", `https://www.googletagmanager.com/gtag/js?id=${tracking.ga4Id}`);
    window.gtag("js", new Date());
    window.gtag("config", tracking.ga4Id);
  }
  if (c.marketing && tracking.metaPixelId) {
    addScript(
      "meta-pixel",
      undefined,
      `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${tracking.metaPixelId}');fbq('track','PageView');`,
    );
  }
  if (!c.marketing && window.fbq) window.fbq("consent", "revoke");
}

export function TrackingScripts() {
  useEffect(() => {
    apply(readConsent());
    const on = (e: Event) => apply((e as CustomEvent<ConsentState>).detail);
    window.addEventListener(CONSENT_EVENT, on);
    return () => window.removeEventListener(CONSENT_EVENT, on);
  }, []);
  return null;
}
