import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { Phone, Mail, MessageCircle, Facebook, Instagram, Linkedin } from "lucide-react";
import { site } from "@/config/site";
import { track } from "@/lib/analytics";
import { Button } from "./ui/button";

export function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded bg-placeholder px-2 py-0.5 text-xs font-medium text-accent-foreground"
      title="Údaj zatím není vyplněn"
    >
      <SiteText>{children}</SiteText>
    </span>
  );
}

export function ContactLinks({ className = "" }: { className?: string }) {
  const site = useSiteConfig();

  const { phone, email, whatsapp } = site.contact;
  const row = "flex items-center gap-3 py-3 border-b";
  return (
    <ul className={className}>
      <li className={row}>
        <Phone className="size-4 text-accent" aria-hidden />
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            onClick={() => track("phone_click")}
            className="hover:underline"
          >
            <SiteText>{phone}</SiteText>
          </a>
        ) : (
          <Placeholder>
            <SiteText>{"Telefon – doplnit"}</SiteText>
          </Placeholder>
        )}
      </li>
      <li className={row}>
        <Mail className="size-4 text-accent" aria-hidden />
        {email ? (
          <a
            href={`mailto:${email}`}
            onClick={() => track("email_click")}
            className="hover:underline"
          >
            <SiteText>{email}</SiteText>
          </a>
        ) : (
          <Placeholder>
            <SiteText>{"E-mail – doplnit"}</SiteText>
          </Placeholder>
        )}
      </li>
      <li className={row}>
        <MessageCircle className="size-4 text-accent" aria-hidden />
        {whatsapp ? (
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click")}
            className="hover:underline"
          >
            <SiteText>{"WhatsApp"}</SiteText>
          </a>
        ) : (
          <Placeholder>
            <SiteText>{"WhatsApp – doplnit"}</SiteText>
          </Placeholder>
        )}
      </li>
    </ul>
  );
}

export function SocialLinks() {
  const site = useSiteConfig();

  const items = Object.entries(site.social) as [string, string][];
  const labels: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
  };
  return (
    <ul className="flex flex-wrap gap-4 text-sm">
      {items.map(([k, url]) => (
        <li key={k}>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              <SiteText>{labels[k]}</SiteText>
            </a>
          ) : (
            <span className="opacity-60">
              <SiteText>{labels[k]}</SiteText>
              {<SiteText> </SiteText>}
              <span className="text-xs">
                <SiteText>{"(doplnit)"}</SiteText>
              </span>
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4.2A8 8 0 1 1 20 11.5Z" />
      <path d="M9 7.5c-.8 0-1 1-.8 1.8.7 2.8 3 5 5.6 5.6.8.2 1.7-.3 1.7-1l-2-1-1 .8c-1.5-.7-2.3-1.5-3-3l.8-1-1-2.2Z" />
    </svg>
  );
}

export function SocialIcons({ attention = false }: { attention?: boolean }) {
  const site = useSiteConfig();

  const items = [
    { label: "Facebook", url: site.social.facebook, Icon: Facebook },
    { label: "Instagram", url: site.social.instagram, Icon: Instagram },
    { label: "LinkedIn", url: site.social.linkedin, Icon: Linkedin },
    {
      label: "WhatsApp",
      url: site.contact.whatsapp ? `https://wa.me/${site.contact.whatsapp}` : "",
      Icon: WhatsAppIcon,
    },
  ];
  return (
    <ul
      className={`flex gap-2 ${attention ? "social-attention" : ""}`}
      aria-label={`Sociální sítě ${site.name}`}
    >
      {
        <SiteText>
          {items.map(({ label, url, Icon }) => (
            <li key={label}>
              {
                <SiteText>
                  {url ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      className="social-icon text-current"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} – ${site.name}`}
                        title={`${label} – ${site.name}`}
                        onClick={() => {
                          if (label === "WhatsApp") track("whatsapp_click");
                        }}
                      >
                        <Icon />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled
                      className="social-icon text-current opacity-50"
                      aria-label={`${label} – odkaz doplníme`}
                      title={`${label} – odkaz na profil ${site.name} doplníme`}
                    >
                      <Icon />
                    </Button>
                  )}
                </SiteText>
              }
            </li>
          ))}
        </SiteText>
      }
    </ul>
  );
}

export function HeroContactHint() {
  return (
    <div className="hero-contact-hint contact-attention-active">
      <SocialIcons attention />
      <p className="social-note text-sm text-accent">
        <svg viewBox="0 0 78 44" fill="none" aria-hidden="true">
          <path
            pathLength="1"
            d="M74 8 C48 2 62 38 14 28 C9 27 5 24 3 22 M3 22 L13 21 M3 22 L9 31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>
          <SiteText>{"I tady mě můžete"}</SiteText>
          <br />
          <SiteText>{"kontaktovat"}</SiteText>
        </span>
      </p>
    </div>
  );
}
