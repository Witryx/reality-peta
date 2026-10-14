import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { SectionHead, Testimonials } from "@/components/Sections";

export const Route = createFileRoute("/reference")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Reference klientů",
        description:
          "Zkušenosti klientů s prodejem, koupí a pronájmem nemovitostí s makléřem Petrem Pavlátem.",
        path: "/reference",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <div className="container-page py-16 md:py-24">
      <SectionHead eyebrow="Reference" title="Spokojení klienti jsou moje nejlepší vizitka" />
      <Testimonials />
      <div className="mt-16">
        <Link to="/nabidka" search={{ stav: "sold" }} className="btn btn-outline">
          <SiteText>{"Prodané nemovitosti"}</SiteText>
        </Link>
      </div>
    </div>
  );
}
