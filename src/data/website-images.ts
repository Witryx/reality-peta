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
    label: "Pobřeží v Egyptě",
    groups: ["Úvodní stránka", "Egypt", "Služby"],
    path: "/egypt",
    alt: "Ilustrační pohled na bydlení u Rudého moře v Egyptě",
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
    groups: ["Úvodní stránka"],
    path: "/",
    alt: "Petr Pavlát, realitní makléř",
  },
  {
    key: "image.fullPortrait",
    label: "Portrét – celá postava",
    groups: ["O mně"],
    path: "/o-mne",
    alt: "Petr Pavlát, realitní makléř",
  },
] as const;
export type WebsiteImageKey = (typeof websiteImages)[number]["key"];
export const uploadImagePattern = /^\/uploads\/[a-f0-9-]{36}\.webp$/;
