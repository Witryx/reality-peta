import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ElasticContactArrow } from "./ElasticContactArrow";

afterEach(() => vi.restoreAllMocks());

it("keeps the arrow static for reduced motion and stops deformation when the preference changes", () => {
  let update: () => void = () => {};
  const media = {
    matches: true,
    addEventListener: vi.fn((_event: string, listener: () => void) => {
      update = listener;
    }),
    removeEventListener: vi.fn(),
  };
  vi.spyOn(window, "matchMedia").mockReturnValue(media as unknown as MediaQueryList);
  const { container, unmount } = render(<ElasticContactArrow />);
  const restingPath = container.querySelector("path")!.getAttribute("d");
  expect(container.querySelector("animate")).toBeNull();
  act(() => {
    media.matches = false;
    update();
  });
  expect(container.querySelector("animate")).not.toBeNull();
  act(() => {
    media.matches = true;
    update();
  });
  expect(container.querySelector("animate")).toBeNull();
  expect(container.querySelector("path")).toHaveAttribute("d", restingPath);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledWith("change", update);
});
