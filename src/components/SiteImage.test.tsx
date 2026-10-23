import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { WebsiteContentContext } from "@/lib/website-context";
import { SiteImage } from "./SiteImage";
import { BrandImage } from "./BrandImage";

it("hides explicitly removed photos without placeholders and restores the originals", () => {
  function Images({ values }: { values: Record<string, string> }) {
    return (
      <WebsiteContentContext.Provider value={values}>
        <SiteImage imageKey="image.home" src="/original.jpg" alt="Úvodní fotografie" />
        <BrandImage
          imageKey="image.portrait"
          asset={{ url: "/portrait.png", original_filename: "portrait.png" }}
          alt="Portrét"
        />
      </WebsiteContentContext.Provider>
    );
  }
  const { rerender, container } = render(<Images values={{}} />);
  expect(screen.getAllByRole("img")).toHaveLength(2);
  rerender(<Images values={{ "image.home": "", "image.portrait": "" }} />);
  expect(container).toBeEmptyDOMElement();
  rerender(<Images values={{}} />);
  expect(screen.getByRole("img", { name: "Úvodní fotografie" })).toHaveAttribute(
    "src",
    "/original.jpg",
  );
  expect(screen.getByRole("img", { name: "Portrét" })).toHaveAttribute("src", "/portrait.png");
});

it("preserves the placeholder for a missing original brand asset", () => {
  render(
    <BrandImage
      imageKey="image.portrait"
      asset={{ url: "", original_filename: "portrait.png" }}
      alt="Portrét"
    />,
  );
  expect(screen.getByRole("img", { name: "Portrét" })).toHaveTextContent("Portrét k doplnění");
});
