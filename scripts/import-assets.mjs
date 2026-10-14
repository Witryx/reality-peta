import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
const origin = process.env.ASSET_ORIGIN;
if (!origin || !/^https:\/\//.test(origin)) {
  console.error(
    "Nastavte ASSET_ORIGIN na HTTPS URL původního webu, nebo vložte původní PNG do public/brand (názvy viz src/assets/*.asset.json).",
  );
  process.exit(1);
}
await mkdir("public/brand", { recursive: true });
let failed = false;
for (const file of (await readdir("src/assets")).filter((f) => f.endsWith(".asset.json"))) {
  const pointer = JSON.parse(await readFile(`src/assets/${file}`, "utf8"));
  try {
    const response = await fetch(new URL(pointer.url, origin), {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("image/png"))
      throw new Error("Origin neposkytl PNG.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a")
      throw new Error("Neplatný PNG soubor.");
    const filename = pointer.original_filename;
    if (!/^[a-zA-Z0-9_.-]+\.png$/.test(filename)) throw new Error("Neplatný název.");
    await writeFile(`public/brand/${filename}`, bytes);
    console.log(`Uloženo: ${filename}`);
  } catch (e) {
    failed = true;
    console.error(`${pointer.original_filename}: ${e.message}`);
  }
}
if (failed) process.exitCode = 1;
