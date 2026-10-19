// Rebuild the sharing card from supplied originals: node scripts/generate-social-preview.mjs
import sharp from "sharp";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

function original(filename) {
  const source = ["public/brand", "src/assets", "public/assets", "public"]
    .map((directory) => new URL(`../${directory}/${filename}`, import.meta.url))
    .find((candidate) => existsSync(candidate));
  if (!source) throw new Error(`Missing original: ${filename}`);
  return fileURLToPath(source);
}

const photo = await sharp(original("hero.jpg"))
  .resize(514, 630, { fit: "cover", position: "left" })
  .png()
  .toBuffer();
const portrait = await sharp(original("petr-pavlat-portrait.png"))
  .resize({ height: 570 })
  .png()
  .toBuffer();
const logo = await sharp(original("petr-pavlat-logo.png")).resize({ height: 70 }).png().toBuffer();
const lettering = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect x="686" width="514" height="630" fill="#253f37" opacity=".12"/>
  <path d="M0 0H726Q670 290 726 630H0Z" fill="#f9f7f2"/>
  <g fill="#253f37">
    <text x="155" y="102" font-family="Arial, sans-serif" font-size="20" letter-spacing="2">PRODEJ · KOUPĚ · PRONÁJEM</text>
    <text x="60" y="285" font-family="Georgia, serif" font-size="76" letter-spacing="-2">Petr Pavlát</text>
    <text x="64" y="332" font-family="Arial, sans-serif" font-size="30" letter-spacing="5">reality</text>
    <path d="M64 382H132" stroke="#b98b56" stroke-width="3"/>
    <text x="60" y="451" font-family="Georgia, serif" font-size="39">Bydlení v pohodě.</text>
    <text x="60" y="502" font-family="Georgia, serif" font-size="39">U nás i u moře.</text>
  </g>
</svg>`);

await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#f9f7f2" } })
  .composite([
    { input: photo, left: 686, top: 0 },
    { input: lettering, left: 0, top: 0 },
    { input: logo, left: 64, top: 54 },
    { input: portrait, left: 740, top: 60 },
  ])
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(fileURLToPath(new URL("../public/social-preview-v1.jpg", import.meta.url)));
