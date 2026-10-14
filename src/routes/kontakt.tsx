import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { SectionHead } from "@/components/Sections";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, SocialLinks } from "@/components/ContactLinks";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import { site } from "@/config/site";
import { BrandImage } from "@/components/BrandImage";

export const Route = createFileRoute("/kontakt")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Kontakt",
        description:
          "Kontaktujte realitního makléře Petra Pavláta – telefon, e-mail, WhatsApp nebo kontaktní formulář.",
        path: "/kontakt",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  const site = useSiteConfig();

  return (
    <div className="container-page grid gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <SectionHead
          eyebrow="Kontakt"
          title="Napište mi, nebo rovnou zavolejte"
          intro="Odpovídám osobně, obvykle ještě týž den."
        />
        <div className="mt-8 flex items-center gap-5">
          <div className="size-24 shrink-0 overflow-hidden rounded-full bg-surface">
            <BrandImage
              asset={portrait}
              alt="Petr Pavlát"
              width={96}
              height={96}
              className="size-full object-cover object-top"
            />
          </div>
          <div>
            <p className="font-display text-2xl">
              <SiteText>{site.agentName}</SiteText>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <SiteText>{"Realitní makléř · "}</SiteText>
              <SiteText>{site.region}</SiteText>
            </p>
          </div>
        </div>
        <ContactLinks className="mt-10" />
        <div className="mt-8">
          <SocialLinks />
        </div>
      </div>
      <LeadForm kind="contact" submitLabel="Odeslat zprávu" />
    </div>
  );
}
