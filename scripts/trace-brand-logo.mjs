// Derive the decorative outline from the original brand PNG, without redesigning it.
// Run again after replacing the logo: node scripts/trace-brand-logo.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = [
  "../public/brand/petr-pavlat-logo.png",
  "../src/assets/petr-pavlat-logo.png",
  "../public/assets/petr-pavlat-logo.png",
  "../public/petr-pavlat-logo.png",
]
  .map((path) => new URL(path, import.meta.url))
  .find((path) => existsSync(path));
if (!source) throw new Error("Original logo is missing");
const { data, info } = await sharp(fileURLToPath(source))
  .resize({ width: 240 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const solid = (x, y) =>
  x >= 0 &&
  y >= 0 &&
  x < width &&
  y < height &&
  data[(y * width + x) * channels + channels - 1] >= 128;
const edges = new Map();
const key = (x, y) => y * (width + 1) + x;
const add = (x, y, nx, ny) => {
  const start = key(x, y);
  if (!edges.has(start)) edges.set(start, []);
  edges.get(start).push(key(nx, ny));
};
for (let y = 0; y < height; y++)
  for (let x = 0; x < width; x++) {
    if (!solid(x, y)) continue;
    if (!solid(x, y - 1)) add(x, y, x + 1, y);
    if (!solid(x + 1, y)) add(x + 1, y, x + 1, y + 1);
    if (!solid(x, y + 1)) add(x + 1, y + 1, x, y + 1);
    if (!solid(x - 1, y)) add(x, y + 1, x, y);
  }
const point = (value) => [value % (width + 1), Math.floor(value / (width + 1))];
function simplify(points) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points.at(-1);
  const length = Math.hypot(bx - ax, by - ay);
  let farthest = 0,
    distance = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y] = points[i];
    const d = length
      ? Math.abs((by - ay) * x - (bx - ax) * y + bx * ay - by * ax) / length
      : Math.hypot(x - ax, y - ay);
    if (d > distance) {
      distance = d;
      farthest = i;
    }
  }
  if (distance <= 1.2) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, farthest + 1)).slice(0, -1),
    ...simplify(points.slice(farthest)),
  ];
}
const paths = [];
while (edges.size) {
  const start = edges.keys().next().value;
  const points = [];
  let current = start;
  do {
    points.push(point(current));
    const next = edges.get(current);
    if (!next?.length) throw new Error("Open logo contour");
    const previous = current;
    current = next.pop();
    if (!next.length) edges.delete(previous);
  } while (current !== start);
  if (points.length < 40) continue;
  points.push(points[0]);
  const contour = simplify(points);
  paths.push(`M${contour.map(([x, y]) => `${x} ${y}`).join("L")}Z`);
}
if (!paths.length) throw new Error("No logo outline found");
await writeFile(
  new URL("../src/assets/petr-pavlat-logo-outline.json", import.meta.url),
  JSON.stringify({ width, height, paths }, null, 2) + "\n",
);
console.log(`Traced ${paths.length} contours from the original logo (${width} × ${height}).`);
