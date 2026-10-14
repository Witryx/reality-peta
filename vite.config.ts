import { defineConfig, normalizePath, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// Preserve asset-pointer imports while serving originals from our own host.
function brandAssets(): Plugin {
  return {
    name: "local-brand-assets",
    enforce: "pre",
    resolveId(source, importer) {
      if (!source.endsWith(".asset.json")) return;
      const filename = source.startsWith("@/")
        ? path.resolve("src", source.slice(2))
        : path.resolve(importer ? path.dirname(importer) : ".", source);
      return `\0local-brand:${filename}.js`;
    },
    load(id) {
      if (!id.startsWith("\0local-brand:")) return;
      const pointerFile = id.slice("\0local-brand:".length, -3);
      this.addWatchFile(pointerFile);
      const pointer = JSON.parse(readFileSync(pointerFile, "utf8"));
      const filename = path.basename(pointer.original_filename);
      const publicRoot = path.resolve("public");
      const candidates = [
        path.join(publicRoot, "brand", filename),
        path.join(path.dirname(pointerFile), filename),
        path.join(publicRoot, "assets", filename),
        path.join(publicRoot, filename),
      ];
      candidates.forEach((candidate) => this.addWatchFile(candidate));
      const original = candidates.find((candidate) => existsSync(candidate));
      if (!original) return `export default ${JSON.stringify({ ...pointer, url: "" })}`;
      const relative = path.relative(publicRoot, original);
      if (!relative.startsWith("..") && !path.isAbsolute(relative)) {
        return `export default ${JSON.stringify({ ...pointer, url: `/${normalizePath(relative)}` })}`;
      }
      // Originals beside their pointers join Vite's asset graph, including hashed build URLs.
      return `import url from ${JSON.stringify(`${normalizePath(original)}?url`)};
        export default { ...${JSON.stringify({ ...pointer, url: "" })}, url };`;
    },
  };
}

export default defineConfig({
  plugins: [
    brandAssets(),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    // Detect Vercel during hosted builds; keep the Node server for self-hosting.
    nitro({ defaultPreset: "node-server" }),
    react(),
  ],
  server: { host: "127.0.0.1", port: 3000 },
});
