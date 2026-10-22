import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PropertyGallery } from "./PropertyGallery";

const p = {
  title: "Byt v Karlíně",
  images: [
    { src: "/assets/second.jpg", alt: "Druhá fotografie", position: 1 },
    { src: "/assets/first.jpg", alt: "První fotografie", position: 0 },
  ],
};
beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
});
describe("Property gallery", () => {
  it("recognizes cached portrait images without leaving loading feedback over the photo", () => {
    const complete = vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    const width = vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(900);
    const height = vi
      .spyOn(HTMLImageElement.prototype, "naturalHeight", "get")
      .mockReturnValue(1200);
    try {
      render(<PropertyGallery p={p} />);
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("img", { name: "První fotografie" })).toHaveAttribute(
        "data-orientation",
        "portrait",
      );
    } finally {
      complete.mockRestore();
      width.mockRestore();
      height.mockRestore();
    }
  });
  it("opens a large side preview and returns focus to the selected photo when closed", async () => {
    render(<PropertyGallery p={p} />);
    const preview = screen.getByRole("button", { name: "Otevřít fotografii 2" });
    fireEvent.click(preview);
    expect(
      within(screen.getByRole("dialog")).getByRole("img", { name: "Druhá fotografie" }),
    ).toHaveAttribute("src", "/assets/second.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Zavřít fotogalerii" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Zvětšit fotografii 2" })).toHaveFocus(),
    );
  });
  it("sorts photographs, shows loading feedback and switches by arrows, thumbnails and keyboard", () => {
    render(<PropertyGallery p={p} />);
    const gallery = screen.getByRole("region", { name: "Fotografie nemovitosti" });
    expect(screen.getByRole("img", { name: "První fotografie" })).toHaveAttribute(
      "src",
      "/assets/first.jpg",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Načítám fotografii");
    fireEvent.load(screen.getByRole("img", { name: "První fotografie" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Další fotografie" }));
    expect(screen.getByRole("img", { name: "Druhá fotografie" })).toHaveAttribute(
      "data-direction",
      "1",
    );
    expect(screen.getByRole("button", { name: "Zobrazit fotografii 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    fireEvent.keyDown(gallery, { key: "ArrowLeft" });
    expect(screen.getByRole("img", { name: "První fotografie" })).toHaveAttribute(
      "data-direction",
      "-1",
    );
    fireEvent.click(screen.getByRole("button", { name: "Předchozí fotografie" }));
    expect(screen.getByRole("img", { name: "Druhá fotografie" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zobrazit fotografii 1" }));
    expect(screen.getByRole("dialog", { name: p.title })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zavřít fotogalerii" }));
    fireEvent.click(screen.getByRole("button", { name: "Zvětšit" }));
    const dialog = screen.getByRole("dialog", { name: p.title });
    expect(within(dialog).getByRole("img", { name: "První fotografie" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Další fotografie" }));
    expect(within(dialog).getByRole("img", { name: "Druhá fotografie" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Zavřít fotogalerii" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("opens the clicked photograph and restores focus when closed", async () => {
    render(<PropertyGallery p={p} />);
    fireEvent.click(screen.getByRole("img", { name: "První fotografie" }));
    const dialog = screen.getByRole("dialog", { name: p.title });
    expect(within(dialog).getByRole("img", { name: "První fotografie" })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Zavřít fotogalerii" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Zvětšit fotografii 1" })).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Zobrazit fotografii 2" }));
    expect(
      within(screen.getByRole("dialog")).getByRole("img", { name: "Druhá fotografie" }),
    ).toBeInTheDocument();
  });
  it("changes photos on swipe without opening the lightbox and still opens on the next tap", () => {
    render(<PropertyGallery p={p} />);
    const stage = screen.getByRole("button", { name: "Zvětšit fotografii 1" });
    stage.setPointerCapture = vi.fn();
    // jsdom has no PointerEvent constructor; a MouseEvent supplies the gesture coordinates.
    fireEvent(stage, new MouseEvent("pointerdown", { bubbles: true, clientX: 200, clientY: 80 }));
    fireEvent(stage, new MouseEvent("pointerup", { bubbles: true, clientX: 100, clientY: 80 }));
    fireEvent.click(stage);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Druhá fotografie" })).toBeInTheDocument();
    fireEvent(stage, new MouseEvent("pointerdown", { bubbles: true, clientX: 100, clientY: 80 }));
    fireEvent(stage, new MouseEvent("pointerup", { bubbles: true, clientX: 100, clientY: 80 }));
    fireEvent.click(stage);
    expect(screen.getByRole("dialog", { name: p.title })).toBeInTheDocument();
  });
  it("handles empty galleries, a single photograph and failed loads", () => {
    const { rerender } = render(<PropertyGallery p={{ ...p, images: [] }} />);
    expect(screen.getByText("Fotografii připravujeme")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    rerender(<PropertyGallery p={{ ...p, images: [p.images[0]!] }} />);
    expect(screen.queryByRole("button", { name: "Další fotografie" })).not.toBeInTheDocument();
    fireEvent.error(screen.getByRole("img", { name: "Druhá fotografie" }));
    expect(screen.getByText("Fotografii se nepodařilo načíst.")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
  it("opens all photos in an overview and returns to the selected full photograph", () => {
    const images = Array.from({ length: 10 }, (_, i) => ({
      src: `/assets/photo-${i + 1}.jpg`,
      alt: `Fotografie ${i + 1}`,
      position: i,
    }));
    render(<PropertyGallery p={{ ...p, images }} />);
    fireEvent.click(screen.getByRole("button", { name: "Zobrazit všechny" }));
    const dialog = screen.getByRole("dialog", { name: p.title });
    expect(within(dialog).getAllByRole("button", { name: /^Otevřít fotografii/ })).toHaveLength(10);
    fireEvent.click(within(dialog).getByRole("button", { name: "Otevřít fotografii 10" }));
    expect(within(dialog).getByRole("img", { name: "Fotografie 10" })).toHaveAttribute(
      "src",
      "/assets/photo-10.jpg",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Přehled fotografií" }));
    expect(within(dialog).getByRole("button", { name: "Otevřít fotografii 10" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "Otevřít fotografii 1" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Zavřít fotogalerii" }));
    expect(screen.getByRole("button", { name: "Zobrazit fotografii 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.queryByText("Fotografie 1")).not.toBeInTheDocument();
  });
});
