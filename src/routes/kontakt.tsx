import { useSiteConfig, useWebsiteImageHidden } from "@/lib/website-context";
import { SiteText } from "@/components/SiteText";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead, websiteValues } from "@/lib/seo";
import { SectionHead } from "@/components/Sections";
import { LeadForm } from "@/components/LeadForm";
import { ContactLinks, SocialLinks } from "@/components/ContactLinks";
import portrait from "@/assets/petr-pavlat-portrait.png.asset.json";
import { BrandImage } from "@/components/BrandImage";
import { site as staticSite } from "@/config/site";

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
  const hidden = useWebsiteImageHidden("image.portrait");

  return (
    <div className="container-page grid items-start gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.2fr]">
      <div>
        <SectionHead
          eyebrow="Kontakt"
          title="Napište mi, nebo rovnou zavolejte"
          intro="Odpovídám osobně, obvykle ještě týž den."
        />
        <div
          className={`mt-8 grid items-center gap-5 sm:gap-6 ${hidden ? "" : "grid-cols-[7rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)]"}`}
        >
          {!hidden && (
            <div className="flex aspect-[4/5] items-end justify-center overflow-hidden rounded-lg bg-surface">
              <BrandImage
                asset={portrait}
                imageKey="image.portrait"
                alt="Petr Pavlát, realitní makléř"
                width={1439}
                height={1825}
                className="h-[95%] w-full object-contain object-bottom"
              />
            </div>
          )}
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
        <div className="mt-10 grid gap-6 rounded-lg border bg-card p-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow">
              <SiteText>{"Kancelář"}</SiteText>
            </p>
            <p className="mt-3 font-medium">
              <SiteText>{staticSite.office.name}</SiteText>
            </p>
            <p className="text-sm text-muted-foreground">
              {staticSite.office.street}
              <br />
              {staticSite.office.city}
            </p>
            <a
              href={staticSite.office.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm underline"
            >
              <SiteText>{"Otevřít v Google Mapách"}</SiteText>
            </a>
          </div>
          <div>
            <p className="eyebrow">
              <SiteText>{"Kdy mě zastihnete"}</SiteText>
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {staticSite.hours.map((h) => (
                <div key={h.days} className="contents">
                  <dt className="font-medium">{h.days}</dt>
                  <dd className="text-muted-foreground">{h.time}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">
              <SiteText>{"Schůzky v kanceláři po domluvě."}</SiteText>
            </p>
          </div>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            <SiteText>{"Sídlo společnosti: "}</SiteText>
            {staticSite.company.seat}
          </p>
        </div>
        <div className="mt-8">
          <SocialLinks />
        </div>
      </div>
      <LeadForm kind="contact" submitLabel="Odeslat zprávu" />
    </div>
  );
}
