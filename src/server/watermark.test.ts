import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { applyWatermark, watermarkSide } from "./watermark.server";

describe("watermark", () => {
  it("marks listings and site photos, not portraits", () => {
    expect(watermarkSide([{ kind: "listing", key: null }])).toBe("right");
    expect(watermarkSide([{ kind: "website", key: "image.egypt" }])).toBe("right");
    expect(watermarkSide([{ kind: "website", key: "image.home" }])).toBe("left");
    expect(watermarkSide([{ kind: "website", key: "image.portrait" }])).toBeNull();
    expect(watermarkSide([])).toBeNull();
  });

  it("stamps large photos and leaves thumbnails alone", async () => {
    const photo = new Uint8Array(
      await sharp({ create: { width: 1200, height: 800, channels: 3, background: "#777" } })
        .webp()
        .toBuffer(),
    );
    const stamped = await applyWatermark(photo);
    expect(stamped).not.toEqual(photo);
    expect((await sharp(stamped).metadata()).width).toBe(1200);
    const thumb = new Uint8Array(
      await sharp({ create: { width: 200, height: 150, channels: 3, background: "#777" } })
        .webp()
        .toBuffer(),
    );
    expect(await applyWatermark(thumb)).toBe(thumb);
  });
});
