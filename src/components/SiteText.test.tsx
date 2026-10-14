import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SiteText } from "./SiteText";
import { WebsiteContentContext } from "@/lib/website-context";
import { copyKey, resolveCopy } from "@/lib/site-copy";
import catalog from "@/data/website-catalog.json";
import { ContactLinks, SocialIcons } from "./ContactLinks";
import { resolveSiteConfig, site, validateSiteOverrides } from "@/config/site";

describe("website copy", () => {
  it("applies contact configuration to rendered links without mutating the defaults", () => {
    const values = {
      "site.contact.email": "novy@example.cz",
      "site.contact.phone": "+420 123 456 789",
      "site.social.facebook": "https://www.facebook.com/test",
    };
    render(
      <WebsiteContentContext.Provider value={values}>
        <ContactLinks />
        <SocialIcons />
      </WebsiteContentContext.Provider>,
    );
    expect(screen.getByRole("link", { name: "novy@example.cz" })).toHaveAttribute(
      "href",
      "mailto:novy@example.cz",
    );
    expect(screen.getByRole("link", { name: "+420 123 456 789" })).toHaveAttribute(
      "href",
      "tel:+420123456789",
    );
    expect(screen.getByRole("link", { name: /Facebook –/ })).toHaveAttribute(
      "href",
      "https://www.facebook.com/test",
    );
    expect(resolveSiteConfig(values).contact.email).toBe("novy@example.cz");
    expect(site.contact.email).not.toBe("novy@example.cz");
    expect(validateSiteOverrides({ "site.social.facebook": "javascript:alert(1)" })).not.toBeNull();
    expect(validateSiteOverrides({ "site.contact.whatsapp": "abc" })).not.toBeNull();
  });
  it("keeps defaults and preserves inline spaces while replacing registered copy", () => {
    expect(resolveCopy({}, " text ")).toBe(" text ");
    expect(resolveCopy({ [copyKey("text")]: "nový text" }, " text ")).toBe(" nový text ");
    expect(new Set(catalog.map((entry) => entry.key)).size).toBe(catalog.length);
    for (const entry of catalog) expect(copyKey(entry.default)).toBe(entry.key);
  });
  it("renders new public text with the provider and leaves element structure unchanged", () => {
    render(
      <WebsiteContentContext.Provider value={{ [copyKey("Původní nadpis")]: "Váš nový domov" }}>
        <h1>
          <SiteText>Původní nadpis</SiteText>
        </h1>
        <SiteText>
          <a href="/kontakt">Kontakt</a>
        </SiteText>
      </WebsiteContentContext.Provider>,
    );
    expect(screen.getByRole("heading", { name: "Váš nový domov" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/kontakt");
  });
  it("escapes saved HTML as text during SSR", () => {
    const html = renderToStaticMarkup(
      <WebsiteContentContext.Provider value={{ [copyKey("Text")]: '<script>alert("x")</script>' }}>
        <SiteText>Text</SiteText>
      </WebsiteContentContext.Provider>,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
