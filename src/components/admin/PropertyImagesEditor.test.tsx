import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PropertyImage } from "@/data/types";
import { PropertyImagesEditor } from "./PropertyImagesEditor";

const images = [0, 1, 2].map((position) => ({
  src: `/assets/${position}.jpg`,
  alt: `Fotka ${position + 1}`,
  position,
}));
function Editor() {
  const [value, setValue] = useState<PropertyImage[]>(images);
  return <PropertyImagesEditor images={value} onChange={setValue} />;
}
beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 1),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  HTMLElement.prototype.setPointerCapture = vi.fn();
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    const index = this.dataset["photoIndex"];
    const left = index === undefined ? 0 : Number(index) * 200;
    const width = index === undefined ? 600 : 200;
    return {
      left,
      right: left + width,
      top: 100,
      bottom: 300,
      width,
      height: 200,
      x: left,
      y: 100,
      toJSON() {},
    };
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Photo ordering", () => {
  it("moves a photograph directly across multiple positions and makes it the cover", () => {
    render(<Editor />);
    const grip = screen.getByRole("button", { name: "Přetáhnout fotografii 3" });
    fireEvent.pointerDown(grip, { button: 0, clientX: 500, clientY: 200 });
    fireEvent.pointerMove(grip, { clientX: 100, clientY: 200 });
    expect(screen.getByText("Přesunout na 1. pozici")).toBeInTheDocument();
    fireEvent.pointerUp(grip, { clientX: 100, clientY: 200 });
    expect(screen.getByLabelText("Popis fotografie 1")).toHaveValue("Fotka 3");
    expect(screen.getByLabelText("Popis fotografie 2")).toHaveValue("Fotka 1");
    expect(screen.getByLabelText("Popis fotografie 3")).toHaveValue("Fotka 2");
    expect(screen.getByRole("status")).toHaveTextContent("z pozice 3 na pozici 1");
  });
  it("cancels a drag dropped outside the gallery or interrupted with Escape", () => {
    render(<Editor />);
    const grip = screen.getByRole("button", { name: "Přetáhnout fotografii 3" });
    fireEvent.pointerDown(grip, { button: 0, clientX: 500, clientY: 200 });
    fireEvent.pointerUp(grip, { clientX: 800, clientY: 200 });
    expect(screen.getByLabelText("Popis fotografie 1")).toHaveValue("Fotka 1");
    fireEvent.pointerDown(grip, { button: 0, clientX: 500, clientY: 200 });
    fireEvent.pointerMove(grip, { clientX: 100, clientY: 200 });
    fireEvent.keyDown(grip, { key: "Escape" });
    fireEvent.pointerUp(grip, { clientX: 100, clientY: 200 });
    expect(screen.getByLabelText("Popis fotografie 1")).toHaveValue("Fotka 1");
  });
});
