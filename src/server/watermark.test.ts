import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  applyWatermark,
  preparePublicPhoto,
  requestedWidth,
  toListingFrame,
  watermarkSide,
} from "./watermark.server";

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
      await sharp({ create: { width: 200, height: 140, channels: 3, background: "#777" } })
        .webp()
        .toBuffer(),
    );
    expect(await applyWatermark(thumb)).toBe(thumb);
  });

  it("frames every listing photo as 4:3", async () => {
    const make = async (width: number, height: number) =>
      new Uint8Array(
        await sharp({ create: { width, height, channels: 3, background: "#777" } })
          .webp()
          .toBuffer(),
      );
    for (const [width, height] of [
      [1600, 900],
      [1200, 1000],
      [900, 1200],
      [1200, 900],
    ]) {
      const framed = await toListingFrame(await make(width, height));
      const meta = await sharp(framed).metadata();
      expect(Math.abs(meta.width! / meta.height! - 4 / 3)).toBeLessThan(0.01);
    }
  });

  it("prepares small marked card photos and accepts only known widths", async () => {
    expect(requestedWidth("960")).toBe(960);
    expect(requestedWidth("123")).toBeNull();
    expect(requestedWidth(null)).toBeNull();
    const photo = new Uint8Array(
      await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "#777" } })
        .webp()
        .toBuffer(),
    );
    const card = await preparePublicPhoto(photo, { listing: true, side: "right", width: 480 });
    const meta = await sharp(card).metadata();
    expect(meta.width).toBe(480);
    expect(meta.height).toBe(360);
  });
});
