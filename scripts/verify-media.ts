import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { Database } from "../src/server/database.server";
import { readStoredImage } from "../src/server/media-storage.server";

// Run through the runtime connection, so a deployment also verifies its restricted
// grants and the real PostgreSQL driver's bytea encoding. Nothing leaves this transaction.
export async function verifyHostedMedia(db: Database) {
  const image = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#ffffff" },
  })
    .webp()
    .toBuffer();
  await db.transaction(async (tx) => {
    const id = randomUUID();
    const filename = `${id}.webp`;
    await tx.query(
      "INSERT INTO media(id,filename,original_name,width,height,bytes) VALUES ($1,$2,'Deployment storage check',2,2,$3)",
      [id, filename, image.length],
    );
    await tx.query("INSERT INTO media_files(media_id,content) VALUES ($1,$2::bytea)", [id, image]);
    const stored = await readStoredImage(tx, id, filename);
    if (!stored || !image.equals(stored))
      throw Object.assign(new Error("Media storage round trip failed"), {
        code: "media-storage-check",
      });
    await tx.query("DELETE FROM media WHERE id=$1", [id]);
    const remaining = await tx.query("SELECT media_id FROM media_files WHERE media_id=$1", [id]);
    if (remaining.length)
      throw Object.assign(new Error("Media storage cleanup failed"), {
        code: "media-storage-check",
      });
  });
}
