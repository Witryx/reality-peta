import hero from "@/assets/hero.jpg";
import kitchen from "@/assets/prop-kitchen.jpg";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import type { WebsiteImageKey } from "./website-images";

/** Terrace above the Red Sea from Petr's Hurghada listing (served watermarked from media). */
export const egyptPhoto = "/uploads/f8869695-40a9-4a58-8040-ff5ebe3de37b.webp?w=1600";

export const websiteImageDefaults: Record<WebsiteImageKey, string> = {
  "image.home": hero,
  "image.egypt": egyptPhoto,
  "image.services": kitchen,
  "image.portrait": portrait.url,
  // Photo is uploaded in admin (Fotky webu); until then the section shows text only.
  "image.helpBuyingRuska": "",
};
