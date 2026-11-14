import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { MessageCircle, Phone, X } from "lucide-react";
import { useSiteConfig } from "@/lib/website-context";
import { track } from "@/lib/analytics";
import { SiteText } from "./SiteText";

const HIDDEN_KEY = "contact-fab-hidden";

/**
 * Phones only: a small round phone button at the side instead of a full-width bar.
 * A tap opens Call / WhatsApp; the little cross hides it for the rest of the visit.
 * Appears once the first section (with its own buttons) has scrolled away and steps
 * aside while the footer is visible.
 */
export function MobileContactBar() {
  const { phone, whatsapp } = useSiteConfig().contact;
  const { pathname } = useLocation();
  const [pastIntro, setPastIntro] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      /* storage unavailable: the button simply stays available */
    }
  }, []);

  useEffect(() => {
    const intro = document.querySelector("main > :first-child");
    const footer = document.querySelector(".site-footer");
    setPastIntro(false);
    setOpen(false);
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

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".contact-fab")) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  if (!phone && !whatsapp) return null;
  const shown = pastIntro && !footerVisible && !dismissed;
  const hide = () => {
    setDismissed(true);
    setOpen(false);
    try {
      sessionStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <nav
      className={`contact-fab ${shown ? "is-shown" : ""} ${open ? "is-open" : ""}`}
      aria-label="Rychlý kontakt"
      aria-hidden={!shown}
    >
      <div className="contact-fab-menu" id="contact-fab-menu">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="contact-fab-call"
            tabIndex={shown && open ? 0 : -1}
            onClick={() => track("phone_click", { placement: "mobile_fab" })}
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
            className="contact-fab-whatsapp"
            tabIndex={shown && open ? 0 : -1}
            onClick={() => track("whatsapp_click", { placement: "mobile_fab" })}
          >
            <MessageCircle aria-hidden />
            <SiteText>{"WhatsApp"}</SiteText>
          </a>
        )}
      </div>
      <button
        type="button"
        className="contact-fab-main"
        aria-expanded={open}
        aria-controls="contact-fab-menu"
        aria-label={open ? "Zavřít kontakt" : "Kontaktovat Petra"}
        tabIndex={shown ? 0 : -1}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X aria-hidden /> : <Phone aria-hidden />}
      </button>
      {!open && (
        <button
          type="button"
          className="contact-fab-hide"
          aria-label="Skrýt tlačítko kontaktu"
          tabIndex={shown ? 0 : -1}
          onClick={hide}
        >
          <X aria-hidden />
        </button>
      )}
    </nav>
  );
}
