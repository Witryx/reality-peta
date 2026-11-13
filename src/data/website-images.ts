// Stable keys identify shared photographs independently of editable text.
export const websiteImages = [
  {
    key: "image.home",
    label: "Úvodní fotografie",
    groups: ["Úvodní stránka"],
    path: "/",
    alt: "Světlý pražský byt s výhledem na Pražský hrad",
  },
  {
    key: "image.egypt",
    label: "Egypt – terasa u Rudého moře",
    groups: ["Úvodní stránka", "Egypt", "Služby"],
    path: "/egypt",
    alt: "Terasa s pergolou a výhledem na Rudé moře v Hurghadě",
  },
  {
    key: "image.services",
    label: "Prezentace nemovitosti",
    groups: ["Služby"],
    path: "/sluzby",
    alt: "Interiér připravený k prodeji",
  },
  {
    key: "image.portrait",
    label: "Portrét – detail",
    groups: ["Kontakt"],
    path: "/kontakt",
    alt: "Petr Pavlát, realitní makléř",
  },
  {
    key: "image.helpBuyingRuska",
    label: "Pomoc s koupí – byt Ruská",
    groups: ["Reference"],
    path: "/reference",
    alt: "Byt v ulici Ruská v Praze, se kterým jsem klientům pomohl při koupi",
  },
] as const;
export type WebsiteImageKey = (typeof websiteImages)[number]["key"];
export const uploadImagePattern = /^\/uploads\/[a-f0-9-]{36}\.webp$/;
