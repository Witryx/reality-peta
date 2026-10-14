import { SiteImage } from "@/components/SiteImage";
import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import kitchen from "@/assets/prop-kitchen.jpg";
import { pageHead, websiteValues } from "@/lib/seo";
import { ProcessList, SectionHead, ServicesGrid } from "@/components/Sections";
import { EgyptSection } from "@/components/EgyptSection";

export const Route = createFileRoute("/sluzby")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "Služby – prodej, koupě, pronájem, odhad",
        description:
          "Kompletní realitní servis: prodej, koupě, pronájem, odhad ceny, homestaging, marketing a právní i hypoteční služby.",
        path: "/sluzby",
      },
      websiteValues(matches),
    ),
  component: Page,
});

function Page() {
  return (
    <>
      <section className="container-page py-16 md:py-24">
        <SectionHead
          eyebrow="Služby napříč Českem"
          title="Vše kolem vašeho bydlení na jednom místě"
          intro="Ať prodáváte, kupujete, pronajímáte nebo hledáte cestu v náročné životní situaci, nejprve vás vyslechnu. Společně vybereme postup, který dává smysl právě vám."
        />
        <ServicesGrid />
      </section>
      <EgyptSection />
      <section className="container-page grid gap-10 pb-20 md:grid-cols-2 md:items-center">
        <SiteImage
          imageKey="image.services"
          src={kitchen}
          alt="Interiér připravený k prodeji"
          loading="lazy"
          width={1200}
          height={912}
          className="aspect-[4/3] w-full rounded-lg object-cover"
        />
        <div>
          <h2 className="text-4xl">
            <SiteText>{"Prezentace, která prodává"}</SiteText>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            <SiteText>
              {
                "Kvalitní fotografie, video a virtuální prohlídka dnes rozhodují o tom, kdo přijde na prohlídku. Proto každou nemovitost připravím tak, aby vynikla – bez přehánění a bez klišé."
              }
            </SiteText>
          </p>
          <Link to="/odhad-ceny" className="btn btn-primary mt-8">
            <SiteText>{"Nezávazný odhad ceny"}</SiteText>
          </Link>
        </div>
      </section>
      <section className="bg-ink py-20 text-ink-foreground md:py-28">
        <div className="container-page [&_.eyebrow]:text-ink-foreground/60 [&_p]:text-ink-foreground/75">
          <SectionHead eyebrow="Jak pracuji" title="Proces prodeje" />
          <ProcessList />
        </div>
      </section>
    </>
  );
}
