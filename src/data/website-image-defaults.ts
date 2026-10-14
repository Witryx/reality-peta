import hero from "@/assets/hero.jpg";
import coast from "@/assets/egypt-coast.jpg";
import kitchen from "@/assets/prop-kitchen.jpg";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import fullPortrait from "@/assets/petr-pavlat-full.png.asset.json";
import type { WebsiteImageKey } from "./website-images";

export const websiteImageDefaults: Record<WebsiteImageKey, string> = {
  "image.home": hero,
  "image.egypt": coast,
  "image.services": kitchen,
  "image.portrait": portrait.url,
  "image.fullPortrait": fullPortrait.url,
};
