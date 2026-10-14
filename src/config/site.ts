/**
 * Centrální konfigurace webu. Prázdné hodnoty ("") se na webu zobrazí jako
 * zřetelný placeholder „doplnit“ – nic se nevymýšlí. Později lze tyto údaje
 * přesunout do administrace (tabulka site_settings).
 */
export const site = {
  name: "Petr Pavlát reality",
  claim: "Bydlení v pohodě. U nás i u moře.",
  domain: "petrpavlat-reality.cz",
  /** Absolutní URL produkčního webu – doplnit až po připojení domény. */
  url: import.meta.env.VITE_SITE_URL || "",
  agentName: "Petr Pavlát",
  region: "Celé Česko · zázemí v Praze a okolí",
  footerRegion: "Zázemí v Česku a Egyptě, se sídlem v Praze a Hurghadě",
  contact: {
    phone: "+420 607 008 995",
    email: "petr.pavlat@stelar-reality.cz",
    whatsapp: "420607008995",
    egyptPhone: "+20 10 35448132",
    egyptWhatsapp: "201035448132",
    address: "",
    ico: "",
  },
  social: {
    instagram: "https://www.instagram.com/petr.pavlat_reality/",
    facebook: "",
    linkedin: "",
  },
  googleReviews: { rating: "4,7", profileUrl: "https://share.google/3ERvci4sNYmAwJnEp" },
  partnerUrls: ["", "", "https://www.egyptskoceskareality.cz/"],
  partners: ["STELAR reality", "STELAR Advisory", "Egyptsko-Česká Reality"],
};

/**
 * Měřicí a reklamní nástroje. Načtou se pouze po souhlasu v cookie liště
 * a pouze pokud je ID vyplněné. Žádná reálná ID nejsou zatím vložena.
 */
export const tracking = {
  gtmId: "", // GTM-XXXXXXX
  ga4Id: "", // G-XXXXXXXXXX
  metaPixelId: "", // 15–16místné číslo
  googleAdsId: "", // AW-XXXXXXXXX
  /** Mapování událostí na štítky konverzí Google Ads (AW-ID/label). */
  googleAdsConversions: {
    form_submit_contact: "",
    form_submit_valuation: "",
    property_inquiry: "",
  } as Record<string, string>,
};

export const nav = [
  { to: "/nabidka", label: "Nabídka" },
  { to: "/sluzby", label: "Služby" },
  { to: "/egypt", label: "Egypt" },
  { to: "/o-mne", label: "O mně" },
  { to: "/reference", label: "Reference" },
  { to: "/clanky", label: "Články" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

// Editable defaults and validation remain together in this configuration module.
export const editableSiteFields = [
  {
    key: "site.agentName",
    label: "Jméno makléře",
    default: site.agentName,
    group: "Identita",
    kind: "text",
    max: 120,
  },
  {
    key: "site.name",
    label: "Název webu",
    default: site.name,
    group: "Identita",
    kind: "text",
    max: 150,
  },
  {
    key: "site.claim",
    label: "Slogan pod logem",
    default: site.claim,
    group: "Identita",
    kind: "text",
    max: 300,
  },
  {
    key: "site.region",
    label: "Působnost makléře",
    default: site.region,
    group: "Identita",
    kind: "text",
    max: 300,
  },
  {
    key: "site.footerRegion",
    label: "Působnost v patičce",
    default: site.footerRegion,
    group: "Identita",
    kind: "text",
    max: 500,
  },
  ...Object.entries(site.contact).map(([key, value]) => ({
    key: `site.contact.${key}`,
    default: value,
    group: "Kontakty a odkazy",
    label: (
      {
        phone: "Český telefon",
        email: "Kontaktní e-mail",
        whatsapp: "WhatsApp Česko (jen číslice s předvolbou)",
        egyptPhone: "Egyptský telefon",
        egyptWhatsapp: "WhatsApp Egypt (jen číslice s předvolbou)",
        address: "Adresa",
        ico: "IČO",
      } as Record<string, string>
    )[key]!,
    kind:
      key === "email"
        ? "email"
        : key.toLowerCase().includes("whatsapp")
          ? "whatsapp"
          : key.toLowerCase().includes("phone")
            ? "phone"
            : "text",
    max:
      key === "email"
        ? 255
        : key.toLowerCase().includes("whatsapp")
          ? 15
          : key.toLowerCase().includes("phone")
            ? 40
            : 500,
  })),
  ...Object.entries(site.social).map(([key, value]) => ({
    key: `site.social.${key}`,
    default: value,
    group: "Kontakty a odkazy",
    label: `Odkaz na ${key}`,
    kind: "url",
    max: 2048,
  })),
  {
    key: "site.googleReviews.profileUrl",
    label: "Odkaz na Google profil",
    default: site.googleReviews.profileUrl,
    group: "Kontakty a odkazy",
    kind: "url",
    max: 2048,
  },
  {
    key: "site.googleReviews.rating",
    label: "Google hodnocení (např. 4,7)",
    default: site.googleReviews.rating,
    group: "Reference",
    kind: "rating",
    max: 3,
  },
  ...site.partners.map((name, index) => ({
    key: `site.partners.${index}`,
    label: `Partner ${index + 1}`,
    default: name,
    group: "Partneři",
    kind: "text",
    max: 150,
  })),
];

export function validateSiteOverrides(values: Record<string, string>): string | null {
  for (const field of editableSiteFields) {
    const value = values[field.key];
    if (value === undefined) continue;
    if (value.length > field.max) return `${field.label}: maximálně ${field.max} znaků.`;
    if (["site.name", "site.agentName"].includes(field.key) && value.trim().length < 2)
      return `${field.label}: vyplňte alespoň 2 znaky.`;
    if (!value) continue;
    if (field.kind === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Zadejte platný kontaktní e-mail.";
    if (field.kind === "phone" && !/^[+\d\s()-]+$/.test(value))
      return `${field.label}: zadejte platné číslo.`;
    if (field.kind === "whatsapp" && !/^\d{7,15}$/.test(value))
      return `${field.label}: použijte 7–15 číslic včetně předvolby.`;
    if (field.kind === "rating" && !/^(?:[0-4](?:[,.]\d)?|5(?:[,.]0)?)$/.test(value))
      return "Google hodnocení musí být mezi 0 a 5.";
    if (field.kind === "url") {
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.username || url.password)
          return `${field.label}: použijte HTTPS adresu.`;
      } catch {
        return `${field.label}: zadejte platnou HTTPS adresu.`;
      }
    }
  }
  return null;
}
export function resolveSiteConfig(values: Record<string, string>): typeof site {
  const result = {
    ...site,
    contact: { ...site.contact },
    social: { ...site.social },
    googleReviews: { ...site.googleReviews },
    partners: [...site.partners],
  };
  for (const field of editableSiteFields) {
    const value = values[field.key];
    if (value === undefined) continue;
    const path = field.key.split(".").slice(1);
    let target: Record<string, unknown> = result;
    for (const part of path.slice(0, -1)) target = target[part] as Record<string, unknown>;
    target[path.at(-1)!] = value;
  }
  return result;
}
