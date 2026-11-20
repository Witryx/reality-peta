import { SiteText } from "@/components/SiteText";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, Compass, KeyRound, Scale } from "lucide-react";
import { pageHead, websiteValues } from "@/lib/seo";
import { ValuationSection } from "@/components/Sections";

export const Route = createFileRoute("/clanky/prvni-odhad-zdarma")({
  head: ({ matches }) =>
    pageHead(
      {
        title: "První odhad ceny nemovitosti zdarma",
        description:
          "Dědíte, potřebujete podklad pro notáře, nebo jen chcete vědět, na čem jste? Získejte reálnou tržní cenu své nemovitosti. První odhad zdarma a bez závazků.",
        path: "/clanky/prvni-odhad-zdarma",
        type: "article",
      },
      websiteValues(matches),
    ),
  component: FreeValuationArticle,
});

const situations = [
  {
    icon: KeyRound,
    title: "Dědíte nemovitost",
    text: "Dědictví přináší spoustu otázek a málokdy je na ně čas. Reálná cena Vám pomůže rozhodnout se v klidu, zda si nemovitost nechat, pronajmout, nebo prodat. A pokud dědíte s dalšími členy rodiny, společné číslo usnadní férovou dohodu.",
  },
  {
    icon: Scale,
    title: "Potřebujete podklad pro notáře",
    text: "V dědickém řízení notář potřebuje znát hodnotu majetku. Pokud se dědicové na hodnotě shodnou, znalecký posudek často není potřeba a jako podklad poslouží odborný odhad tržní ceny. Připravím ho tak, abyste s ním mohli rovnou za notářem.",
  },
  {
    icon: Compass,
    title: "Chcete mít jasno",
    text: "Nechystáte se hned prodávat, ale chcete vědět, na čem jste? I to je dobrý důvod. Ať plánujete prodej, refinancování, nebo jen sledujete trh, ode mě získáte reálnou představu o hodnotě své nemovitosti.",
  },
];

const steps = [
  {
    title: "Ozvete se",
    text: "Vyplníte krátký formulář níže, nebo mi rovnou zavoláte. Stačí adresa a základní údaje o nemovitosti.",
  },
  {
    title: "Prověřím trh",
    text: "Porovnám Vaši nemovitost se skutečně prodanými nemovitostmi v okolí a zohledním její stav, dispozici i polohu.",
  },
  {
    title: "Dostanete reálnou cenu",
    text: "Výsledek Vám srozumitelně vysvětlím, včetně toho, co cenu zvyšuje a co ji naopak snižuje.",
  },
];

function FreeValuationArticle() {
  return (
    <article className="free-valuation">
      <header className="fv-hero">
        <div className="container-page fv-hero-grid">
          <div>
            <nav aria-label="Drobečková navigace" className="fv-crumbs">
              <Link to="/clanky">
                <SiteText>{"Články"}</SiteText>
              </Link>
              <span aria-hidden> / </span>
              <span>
                <SiteText>{"Odhad ceny"}</SiteText>
              </span>
            </nav>
            <p className="eyebrow fv-eyebrow">
              <SiteText>{"Nabídka pro nové klienty"}</SiteText>
            </p>
            <h1 className="fv-title">
              <SiteText>{"Za kolik by se Vaše nemovitost opravdu prodala?"}</SiteText>
            </h1>
            <p className="fv-lead">
              <SiteText>
                {
                  "Inzertní ceny na portálech často neodpovídají tomu, za kolik se nemovitosti skutečně prodávají. Já Vám řeknu reálnou tržní cenu, opřenou o skutečné prodeje ve Vaší lokalitě. První odhad máte ode mě zcela zdarma."
                }
              </SiteText>
            </p>
            <div className="fv-hero-actions">
              <a href="#odhad" className="btn btn-primary h-auto">
                <SiteText>{"Chci odhad zdarma"}</SiteText>
                <ArrowDown className="size-4" aria-hidden />
              </a>
              <span className="fv-hero-note">
                <SiteText>{"Bez závazků. Bez tlaku na prodej."}</SiteText>
              </span>
            </div>
          </div>
          <div className="fv-badge" aria-hidden>
            <span className="fv-badge-top">
              <SiteText>{"1. odhad"}</SiteText>
            </span>
            <span className="fv-badge-main">
              <SiteText>{"ZDARMA"}</SiteText>
            </span>
            <span className="fv-badge-bottom">
              <SiteText>{"byt · dům · pozemek"}</SiteText>
            </span>
          </div>
        </div>
      </header>

      <section className="container-page fv-section" aria-labelledby="fv-when">
        <p className="eyebrow">
          <SiteText>{"Kdy se Vám odhad hodí"}</SiteText>
        </p>
        <h2 id="fv-when" className="fv-h2">
          <SiteText>{"Tři situace, ve kterých se vyplatí znát přesné číslo"}</SiteText>
        </h2>
        <div className="fv-cards">
          {
            <SiteText>
              {situations.map(({ icon: Icon, title, text }) => (
                <div key={title} className="fv-card">
                  <span className="fv-card-icon">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="fv-card-title">{<SiteText>{title}</SiteText>}</h3>
                  <p className="fv-card-text">{<SiteText>{text}</SiteText>}</p>
                </div>
              ))}
            </SiteText>
          }
        </div>
      </section>

      <section className="fv-steps-band" aria-labelledby="fv-how">
        <div className="container-page fv-section">
          <p className="eyebrow">
            <SiteText>{"Jak to probíhá"}</SiteText>
          </p>
          <h2 id="fv-how" className="fv-h2">
            <SiteText>{"Žádné odhady od stolu. Reálná data z Vaší lokality."}</SiteText>
          </h2>
          <ol className="fv-steps">
            {
              <SiteText>
                {steps.map(({ title, text }, i) => (
                  <li key={title} className="fv-step">
                    <span className="fv-step-no">
                      {<SiteText>{String(i + 1).padStart(2, "0")}</SiteText>}
                    </span>
                    <h3 className="fv-card-title">{<SiteText>{title}</SiteText>}</h3>
                    <p className="fv-card-text">{<SiteText>{text}</SiteText>}</p>
                  </li>
                ))}
              </SiteText>
            }
          </ol>
          <aside className="fv-note">
            <strong>
              <SiteText>{"Dobré vědět"}</SiteText>
            </strong>
            <p>
              <SiteText>
                {
                  "Můj odhad vychází ze znalosti trhu a skutečných prodejů. Nejde o znalecký posudek. Pokud ho budete potřebovat, například při sporu mezi dědici nebo pro banku, poradím Vám, jak postupovat."
                }
              </SiteText>
            </p>
          </aside>
        </div>
      </section>

      <ValuationSection defaultMessage="Mám zájem o první odhad ceny nemovitosti zdarma." />
    </article>
  );
}
