import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";
import { useSiteConfig } from "@/lib/website-context";
import { track } from "@/lib/analytics";
import { SiteText } from "./SiteText";

/**
 * Phones only: call / WhatsApp always one tap away. Appears once the first section
 * (with its own buttons) has scrolled away and steps aside while the footer is visible.
 */
export function MobileContactBar() {
  const { phone, whatsapp } = useSiteConfig().contact;
  const { pathname } = useLocation();
  const [pastIntro, setPastIntro] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  useEffect(() => {
    const intro = document.querySelector("main > :first-child");
    const footer = document.querySelector(".site-footer");
    setPastIntro(false);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === intro) setPastIntro(!entry.isIntersecting);
        if (entry.target === footer) setFooterVisible(entry.isIntersecting);
      }
    });
    if (intro) observer.observe(intro);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname]);

  if (!phone && !whatsapp) return null;
  const shown = pastIntro && !footerVisible;
  return (
    <nav
      className={`mobile-contact-bar ${shown ? "is-shown" : ""}`}
      aria-label="Rychlý kontakt"
      aria-hidden={!shown}
    >
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="mobile-contact-call"
          tabIndex={shown ? 0 : -1}
          onClick={() => track("phone_click", { placement: "mobile_bar" })}
        >
          <Phone aria-hidden />
          <SiteText>{"Zavolat"}</SiteText>
        </a>
      )}
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-contact-whatsapp"
          tabIndex={shown ? 0 : -1}
          onClick={() => track("whatsapp_click", { placement: "mobile_bar" })}
        >
          <MessageCircle aria-hidden />
          <SiteText>{"WhatsApp"}</SiteText>
        </a>
      )}
    </nav>
  );
}
