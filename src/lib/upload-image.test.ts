import { afterEach, expect, it, vi } from "vitest";
import { prepareImageUpload, uploadImage, uploadBodyLimit } from "./upload-image";
import { api } from "./api";
vi.mock("./api", () => ({ api: vi.fn() }));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("uploads a small source unchanged and preserves its original filename", async () => {
  const file = new File(["small"], "byt s balkonem.png", { type: "image/png" });
  vi.mocked(api).mockResolvedValue({ src: "/uploads/photo.webp" });
  expect(await prepareImageUpload(file)).toBe(file);
  await uploadImage(file);
  expect(api).toHaveBeenCalledWith(
    "/api/admin/media?name=byt%20s%20balkonem.png",
    expect.objectContaining({
      method: "POST",
      body: file,
      headers: { "Content-Type": "image/png" },
    }),
  );
});
it("rejects oversized sources before decoding", async () => {
  await expect(
    prepareImageUpload(new File([new Uint8Array(12 * 1024 * 1024 + 1)], "large.jpg")),
  ).rejects.toThrow("12 MB");
});
it("resizes large photos and lowers quality until the request fits Vercel", async () => {
  const revoke = vi.fn();
  vi.stubGlobal("URL", { createObjectURL: () => "blob:test", revokeObjectURL: revoke });
  vi.stubGlobal(
    "Image",
    class {
      src = "";
      naturalWidth = 6000;
      naturalHeight = 4000;
      decode = () => Promise.resolve();
    },
  );
  const drawImage = vi.fn();
  const qualities: number[] = [];
  const compressed = new Blob([new Uint8Array(1000)], { type: "image/webp" });
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({ drawImage }),
    toBlob: (done: (value: Blob) => void, _type: string, quality: number) => {
      qualities.push(quality);
      done(qualities.length === 1 ? new Blob([new Uint8Array(uploadBodyLimit + 1)]) : compressed);
    },
  };
  vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);
  const result = await prepareImageUpload(
    new File([new Uint8Array(uploadBodyLimit + 1)], "large.jpg", { type: "image/jpeg" }),
  );
  expect(result).toBe(compressed);
  expect(canvas).toMatchObject({ width: 2400, height: 1600 });
  expect(qualities).toEqual([0.85, 0.72]);
  expect(drawImage).toHaveBeenCalledOnce();
  expect(revoke).toHaveBeenCalledWith("blob:test");
});
