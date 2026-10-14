import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import type { Database } from "./database.server";

export const storedImageLimit = 4_000_000;
export function imageStorage(env: NodeJS.ProcessEnv = process.env): "database" | "disk" {
  if (env["MEDIA_STORAGE"] === "database") return "database";
  // A Vercel instance's filesystem cannot persist uploads across requests/deployments.
  if (env["VERCEL"] === "1") return "database";
  return "disk";
}
const directory = () => path.resolve(process.env["UPLOAD_DIR"] || "uploads");
export async function writeImageFile(filename: string, content: Buffer) {
  await mkdir(directory(), { recursive: true });
  await writeFile(path.join(directory(), filename), content);
}
export async function removeImageFile(filename: string) {
  if (process.env["VERCEL"] === "1") return;
  await unlink(path.join(directory(), filename)).catch(() => {});
}
export async function readStoredImage(
  db: Database,
  mediaId: string,
  filename: string,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const [ready] = await db.query<{ table_name: string | null }>(
    "SELECT to_regclass('public.media_files')::text AS table_name",
  );
  if (ready?.table_name) {
    const [file] = await db.query<{ content: Uint8Array }>(
      "SELECT content FROM media_files WHERE media_id=$1",
      [mediaId],
    );
    if (file) return new Uint8Array(file.content);
  }
  if (process.env["VERCEL"] === "1") return null;
  try {
    return new Uint8Array(await readFile(path.join(directory(), filename)));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT")
      return null;
    throw error;
  }
}
