import { describe, expect, it } from "vitest";
import { normalizeVideoUrl, propertyMap } from "./property-media";

describe("property media", () => {
  it.each([
    "https://www.youtube.com/watch?v=M7lc1UVf-VE&feature=share",
    "https://youtu.be/M7lc1UVf-VE?si=sharing",
    "https://www.youtube.com/shorts/M7lc1UVf-VE",
    "https://www.youtube.com/live/M7lc1UVf-VE",
    "https://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1",
    "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE",
  ])("normalizes sharing and player URLs: %s", (input) => {
    expect(normalizeVideoUrl(input)).toBe("https://www.youtube-nocookie.com/embed/M7lc1UVf-VE");
  });
  it.each([
    "https://youtube.com.evil.test/watch?v=M7lc1UVf-VE",
    "javascript:alert(1)",
    "http://youtu.be/M7lc1UVf-VE",
    "https://user:password@youtu.be/M7lc1UVf-VE",
    "https://youtu.be/short-id",
    "https://youtu.be:8000/M7lc1UVf-VE",
  ])("rejects unsafe or malformed links: %s", (input) =>
    expect(normalizeVideoUrl(input)).toBeNull(),
  );
  it("preserves Vimeo players and empty optional inputs", () => {
    expect(normalizeVideoUrl("https://player.vimeo.com/video/123456789?h=abc")).toBe(
      "https://player.vimeo.com/video/123456789?h=abc",
    );
    expect(normalizeVideoUrl(" ")).toBe("");
  });
  it("uses a complete coordinate pair, including zero, before an address", () => {
    const map = propertyMap({ location: { city: "Praha", district: "", lat: 0, lng: 0 } });
    expect(new URL(map.embedUrl).searchParams.get("q")).toBe("0,0");
    expect(new URL(map.externalUrl).searchParams.get("api")).toBe("1");
    expect(map.precise).toBe(true);
  });
  it("falls back to an address with the correct country and reports missing locations", () => {
    const map = propertyMap({
      market: "egypt",
      location: { city: "Hurghada", district: "", street: "El Kawther", lat: 27 },
    });
    expect(new URL(map.embedUrl).searchParams.get("q")).toBe("El Kawther, Hurghada, Egypt");
    expect(map.precise).toBe(false);
    expect(propertyMap({ location: { city: "", district: "" } }).available).toBe(false);
  });
});
