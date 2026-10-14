import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ConsentEmbed } from "./ConsentEmbed";
import { saveConsent } from "@/lib/consent";

afterEach(() => localStorage.clear());
it("loads and removes the map only with marketing consent", () => {
  const { container } = render(
    <ConsentEmbed
      src="https://www.google.com/maps?q=Praha&output=embed"
      title="Google Mapy – Praha"
      kind="map"
    />,
  );
  expect(container.querySelector("iframe")).toBeNull();
  act(() => {
    saveConsent(true, false);
  });
  expect(container.querySelector("iframe")).toBeNull();
  act(() => {
    saveConsent(false, true);
  });
  expect(screen.getByTitle("Google Mapy – Praha")).toHaveAttribute(
    "src",
    "https://www.google.com/maps?q=Praha&output=embed",
  );
  act(() => {
    saveConsent(false, false);
  });
  expect(container.querySelector("iframe")).toBeNull();
});
