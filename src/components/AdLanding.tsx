import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Download, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { track, type ConversionEvent } from "@/lib/analytics";
import { attributionSummary } from "@/lib/attribution";
import { useSiteConfig } from "@/lib/website-context";
import { SiteText } from "./SiteText";
import { GoogleRating } from "./GoogleRating";
import { Button } from "./ui/button";

/**
 * Landing pages for paid ads: one goal, no main menu, a short two-step form.
 * Step 1 asks the easy question (what / where), step 2 the contact. Every lead goes
 * through /api/leads like all other forms, with the campaign attached.
 */

type Choice = { value: string; label: string };
type Lead = {
  kind: "valuation" | "contact";
  property_type?: string;
  property_location?: string;
  message?: string;
};

const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 9;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function StepForm({
  question,
  choices,
  secondLabel,
  secondPlaceholder,
  submitLabel,
  event,
  build,
  doneTitle,
  doneCopy,
}: {
  question: string;
  choices: Choice[];
  secondLabel: string;
  secondPlaceholder: string;
  submitLabel: string;
  event: ConversionEvent;
  build: (choice: string, second: string) => Lead;
  doneTitle: string;
  doneCopy: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [choice, setChoice] = useState("");
  const [second, setSecond] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (name.length < 2) return setError("Vyplňte prosím jméno.");
    if (!phoneOk(phone)) return setError("Zadejte prosím telefon, ať Vám můžu rovnou zavolat.");
    if (!emailOk(email)) return setError("Zadejte prosím platný e-mail.");
    if (fd.get("consent") !== "on")
      return setError("Pro odeslání je nutný souhlas se zpracováním údajů.");
    setError("");
    setSending(true);
    try {
      await api("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          ...build(choice, second),
          name,
          email,
          phone,
          attribution: attributionSummary(),
          consent: true,
          website: fd.get("website") || "",
        }),
      });
      track(event, { placement: "landing" }, { email, phone });
      setStep(3);
    } catch {
      setError("Odeslání se nepovedlo. Zkuste to prosím znovu, nebo mi rovnou zavolejte.");
    } finally {
      setSending(false);
    }
  }

  if (step === 3)
    return (
      <div role="status" className="rounded-lg border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-10 text-accent" aria-hidden />
        <h3 className="mt-4 font-display text-2xl">
          <SiteText>{doneTitle}</SiteText>
        </h3>
        <p className="mt-3 text-muted-foreground">
          <SiteText>{doneCopy}</SiteText>
        </p>
      </div>
    );

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm md:p-8">
      <p className="eyebrow">
        <SiteText>{step === 1 ? "Krok 1 ze 2" : "Krok 2 ze 2"}</SiteText>
      </p>
      {step === 1 ? (
        <div className="mt-4 grid gap-5">
          <p className="font-display text-2xl">
            <SiteText>{question}</SiteText>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {choices.map((c) => (
              <button
                type="button"
                key={c.value}
                aria-pressed={choice === c.value}
                onClick={() => setChoice(c.value)}
                className={`rounded-md border px-4 py-3 text-left transition-colors ${
                  choice === c.value
                    ? "border-accent bg-accent/10 font-medium"
                    : "hover:border-foreground/40"
                }`}
              >
                <SiteText>{c.label}</SiteText>
              </button>
            ))}
          </div>
          <label className="grid gap-1.5 text-sm font-medium">
            <SiteText>{secondLabel}</SiteText>
            <input
              className="field"
              value={second}
              onChange={(e) => setSecond(e.target.value)}
              placeholder={secondPlaceholder}
              maxLength={200}
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="button"
            variant="valuation"
            className="btn h-auto !py-3"
            onClick={() => {
              if (!choice) return setError("Vyberte prosím jednu z možností.");
              if (second.trim().length < 2) return setError("Doplňte prosím i druhý údaj.");
              setError("");
              setStep(2);
            }}
          >
            <SiteText>{"Pokračovat"}</SiteText> <ArrowUpRight aria-hidden />
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-4 grid gap-4">
          <div className="sr-only" aria-hidden="true">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <p className="font-display text-2xl">
            <SiteText>{"Kam se Vám mám ozvat?"}</SiteText>
          </p>
          <label className="grid gap-1.5 text-sm font-medium">
            <SiteText>{"Jméno a příjmení *"}</SiteText>
            <input className="field" name="name" autoComplete="name" maxLength={120} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <SiteText>{"Telefon *"}</SiteText>
            <input className="field" name="phone" type="tel" autoComplete="tel" maxLength={40} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            <SiteText>{"E-mail *"}</SiteText>
            <input
              className="field"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={255}
            />
          </label>
          <label className="flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" name="consent" className="mt-1" />
            <span>
              <SiteText>
                {"Souhlasím se zpracováním osobních údajů za účelem vyřízení dotazu dle "}
              </SiteText>
              <Link to="/ochrana-osobnich-udaju" className="underline">
                <SiteText>{"zásad ochrany osobních údajů"}</SiteText>
              </Link>
              .
            </span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="valuation" className="btn h-auto !py-3" disabled={sending}>
            <SiteText>{sending ? "Odesílám…" : submitLabel}</SiteText> <ArrowUpRight aria-hidden />
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => setStep(1)}
          >
            <SiteText>{"Zpět"}</SiteText>
          </button>
        </form>
      )}
    </div>
  );
}

function Points({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 grid gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <SiteText>{item}</SiteText>
        </li>
      ))}
    </ul>
  );
}

function Steps({ items }: { items: [string, string][] }) {
  return (
    <ol className="grid gap-6 md:grid-cols-3">
      {items.map(([title, text], i) => (
        <li key={title} className="rounded-lg border bg-card p-6">
          <p className="font-display text-3xl text-accent">{i + 1}</p>
          <p className="mt-2 font-medium">
            <SiteText>{title}</SiteText>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <SiteText>{text}</SiteText>
          </p>
        </li>
      ))}
    </ol>
  );
}

/** Free guide for owners who are not ready yet: name + e-mail, then the PDF. */
export function GuideOffer() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const href = "/pruvodce/5-chyb-pri-prodeji.pdf";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (name.length < 2 || !emailOk(email)) return setError("Vyplňte prosím jméno a e-mail.");
    if (fd.get("consent") !== "on")
      return setError("Pro odeslání je nutný souhlas se zpracováním údajů.");
    try {
      await api("/api/leads", {
        method: "POST",
        body: JSON.stringify({
          kind: "contact",
          name,
          email,
          phone: null,
          message: "Stáhl(a) si průvodce „5 chyb majitele při prodeji“.",
          attribution: attributionSummary(),
          consent: true,
          website: fd.get("website") || "",
        }),
      });
      track("guide_download", { placement: "landing" }, { email });
      setDone(true);
    } catch {
      setError("Odeslání se nepovedlo. Zkuste to prosím znovu.");
    }
  }
  return (
    <section className="border-y bg-surface py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">
            <SiteText>{"Ještě se nerozhodujete?"}</SiteText>
          </p>
          <h2 className="mt-4 text-3xl leading-tight md:text-4xl">
            <SiteText>{"5 chyb, které majitele při prodeji stojí nejvíc peněz"}</SiteText>
          </h2>
          <p className="mt-4 text-muted-foreground">
            <SiteText>
              {
                "Krátký průvodce zdarma. Za deset minut budete vědět, čemu se vyhnout dřív, než nemovitost nabídnete."
              }
            </SiteText>
          </p>
        </div>
        {done ? (
          <div role="status" className="rounded-lg border bg-card p-8 text-center">
            <p className="font-display text-2xl">
              <SiteText>{"Děkuji, průvodce je Váš."}</SiteText>
            </p>
            <Button asChild variant="valuation" className="btn mt-6 h-auto !py-3">
              <a
                href={href}
                download
                onClick={() => track("guide_download", { placement: "file" })}
              >
                <Download aria-hidden /> <SiteText>{"Stáhnout průvodce (PDF)"}</SiteText>
              </a>
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-4 rounded-lg border bg-card p-6">
            <div className="sr-only" aria-hidden="true">
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <input className="field" name="name" placeholder="Jméno" autoComplete="name" />
            <input
              className="field"
              name="email"
              type="email"
              placeholder="E-mail"
              autoComplete="email"
            />
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input type="checkbox" name="consent" className="mt-1" />
              <span>
                <SiteText>{"Souhlasím se zpracováním osobních údajů dle "}</SiteText>
                <Link to="/ochrana-osobnich-udaju" className="underline">
                  <SiteText>{"zásad ochrany osobních údajů"}</SiteText>
                </Link>
                .
              </span>
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="valuation" className="btn h-auto !py-3">
              <SiteText>{"Poslat průvodce zdarma"}</SiteText>
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

export function SellerLanding() {
  return (
    <>
      <section className="py-14 md:py-20">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              <SiteText>{"Řešíte změnu bydlení?"}</SiteText>
            </p>
            <h1 className="mt-5 text-4xl leading-tight md:text-5xl">
              <SiteText>{"Za kolik reálně prodáte svůj byt nebo dům?"}</SiteText>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Odhad postavím na skutečných prodejích ve Vašem okolí, ne na inzerátech. Nezávazně, diskrétně a pro nové klienty zdarma."
                }
              </SiteText>
            </p>
            <Points
              items={[
                "Ozvu se Vám ještě týž den, osobně",
                "Reálná cena, ne líbivé číslo",
                "Bez závazků a bez nátlaku",
              ]}
            />
            <div className="mt-10 max-w-md">
              <GoogleRating />
            </div>
          </div>
          <StepForm
            question="Co chcete ocenit?"
            choices={[
              { value: "Byt", label: "Byt" },
              { value: "Dům", label: "Dům" },
              { value: "Pozemek", label: "Pozemek" },
              { value: "Jiné", label: "Jiné" },
            ]}
            secondLabel="Kde se nemovitost nachází?"
            secondPlaceholder="např. Praha 4, Brno-střed"
            submitLabel="Chci odhad zdarma"
            event="form_submit_valuation"
            build={(type, place) => ({
              kind: "valuation",
              property_type: type,
              property_location: place,
              message: "Odhad z reklamní stránky.",
            })}
            doneTitle="Děkuji, máte to u mě."
            doneCopy="Ozvu se Vám osobně ještě dnes, nejpozději další pracovní den."
          />
        </div>
      </section>
      <section className="pb-16 pt-6">
        <div className="container-page">
          <h2 className="mb-8 text-3xl">
            <SiteText>{"Jak to probíhá"}</SiteText>
          </h2>
          <Steps
            items={[
              ["Krátký telefonát", "Doptám se na pár detailů o nemovitosti a Vašem záměru."],
              ["Odhad podle reálných prodejů", "Porovnám skutečně prodané nemovitosti v okolí."],
              ["Vy se rozhodnete", "Dostanete reálnou cenu a doporučení. Co dál, je jen na Vás."],
            ]}
          />
        </div>
      </section>
      <GuideOffer />
    </>
  );
}

export function EgyptLanding() {
  const { egyptWhatsapp, whatsapp } = useSiteConfig().contact;
  const wa = egyptWhatsapp || whatsapp;
  return (
    <>
      <section className="py-14 md:py-20">
        <div className="container-page grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow">
              <SiteText>{"Hurghada · Egypt"}</SiteText>
            </p>
            <h1 className="mt-5 text-4xl leading-tight md:text-5xl">
              <SiteText>{"Vlastní byt u Rudého moře od 1,15 mil. Kč"}</SiteText>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              <SiteText>
                {
                  "Zrekonstruované a zařízené byty v centru Hurghady, kde se žije a všude dojdete pěšky."
                }
              </SiteText>
            </p>
            <Points
              items={[
                "Celý proces v češtině, včetně právníka",
                "V ceně právní servis i provize",
                "Připraveno k nastěhování, správa bytu v době Vaší nepřítomnosti",
              ]}
            />
            {wa && (
              <Button asChild variant="outline" className="btn mt-8 h-auto !py-3">
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track("whatsapp_click", { placement: "landing_egypt" })}
                >
                  <MessageCircle aria-hidden /> <SiteText>{"Napsat přes WhatsApp"}</SiteText>
                </a>
              </Button>
            )}
          </div>
          <EgyptAlertForm />
        </div>
      </section>
      <section className="pb-16 pt-6">
        <div className="container-page">
          <h2 className="mb-8 text-3xl">
            <SiteText>{"Jak koupě probíhá"}</SiteText>
          </h2>
          <Steps
            items={[
              ["Videohovor", "Probereme, co hledáte, a pošlu Vám vybrané byty."],
              ["Prohlídka na místě nebo online", "Byt Vám ukážu osobně, nebo přes video."],
              [
                "Právní kontrola a klíče",
                "Ověříme právní stav, podepíšeme a pomůžu s přepisem energií.",
              ],
            ]}
          />
          <p className="mt-10">
            <Link to="/egypt" className="underline">
              <SiteText>{"Prohlédnout aktuální byty v Hurghadě"}</SiteText>
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

/** "Send me new flats by the sea": a lead plus a wish list, used on the ad page and /egypt. */
export function EgyptAlertForm() {
  return (
    <StepForm
      question="Jaký byt u moře hledáte?"
      choices={[
        { value: "1+kk / 2+kk", label: "1+kk / 2+kk" },
        { value: "3+kk", label: "3+kk" },
        { value: "Větší", label: "Větší" },
        { value: "Zatím nevím", label: "Zatím nevím" },
      ]}
      secondLabel="Váš rozpočet"
      secondPlaceholder="např. do 2,5 mil. Kč"
      submitLabel="Poslat mi vhodné byty"
      event="form_submit_contact"
      build={(size, budget) => ({
        kind: "contact",
        property_location: "Hurghada",
        message: `Egypt – pošlete mi vhodné byty. Velikost: ${size}. Rozpočet: ${budget}.`,
      })}
      doneTitle="Děkuji, vybírám pro Vás."
      doneCopy="Ozvu se Vám s vhodnými byty osobně, zpravidla ještě dnes."
    />
  );
}
