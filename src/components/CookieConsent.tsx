import { SiteText } from "@/components/SiteText";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { readConsent, saveConsent } from "@/lib/consent";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/BrandLockup";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) setOpen(true);
    else {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
    }
    const onOpen = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setDetail(true);
      setOpen(true);
    };
    window.addEventListener("ppr-open-consent", onOpen);
    return () => window.removeEventListener("ppr-open-consent", onOpen);
  }, []);

  if (!open) return null;
  const done = (a: boolean, m: boolean) => {
    saveConsent(a, m);
    setOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cc-title"
      className={`fixed inset-x-3 bottom-3 z-50 md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md ${infoOpen ? "invisible" : ""}`}
    >
      <div className="reveal max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-lg border bg-card p-6 shadow-soft">
        <div className="mb-4 border-b pb-3">
          <BrandLockup compact />
        </div>
        <h2 id="cc-title" className="text-xl leading-snug">
          <SiteText>{"Pomozte mi dělat web užitečnější"}</SiteText>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          <SiteText>
            {
              "S vaším souhlasem zjistím, které nabídky a informace jsou pro vás užitečné. Nezbytné technologie potřebuji pro správné fungování webu. Analytiku a marketing zapnu až s vaším souhlasem. Volbu můžete kdykoli změnit."
            }
          </SiteText>
        </p>
        {detail && (
          <div className="mt-5 space-y-3 text-sm" aria-label="Kategorie cookies">
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input type="checkbox" checked disabled className="mt-1" />
              {<SiteText> </SiteText>}
              <span>
                <b>
                  <SiteText>{"Nezbytné"}</SiteText>
                </b>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  <SiteText>
                    {"Zajišťují správné fungování webu a uložení vaší volby. Jsou vždy aktivní."}
                  </SiteText>
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 accent-primary"
              />
              {<SiteText> </SiteText>}
              <span>
                <b>
                  <SiteText>{"Analytické"}</SiteText>
                </b>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "Pomáhají mi obecně zjistit návštěvnost a zájem o obsah. Zapnou se jen s vaším souhlasem."
                    }
                  </SiteText>
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-md border p-3">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 accent-primary"
              />
              {<SiteText> </SiteText>}
              <span>
                <b>
                  <SiteText>{"Marketingové a externí obsah"}</SiteText>
                </b>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  <SiteText>
                    {
                      "Umožní načíst Google Mapy, videa YouTube / Vimeo, virtuální prohlídky Matterport a měření reklam Google a Meta. Zapnou se jen s vaším souhlasem."
                    }
                  </SiteText>
                </span>
              </span>
            </label>
          </div>
        )}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button
            className="btn btn-primary h-auto min-h-11 w-full whitespace-normal !px-5 !py-2.5 leading-snug"
            onClick={() => done(true, true)}
          >
            <SiteText>{"Povolit vše"}</SiteText>
          </Button>
          <Button
            variant="outline"
            className="btn btn-outline h-auto min-h-11 w-full whitespace-normal !px-5 !py-2.5"
            onClick={() => done(false, false)}
          >
            <SiteText>{"Jen nezbytné"}</SiteText>
          </Button>
          {detail ? (
            <Button
              variant="outline"
              className="btn btn-outline h-auto min-h-11 w-full whitespace-normal !px-5 !py-2.5 sm:col-span-2"
              onClick={() => done(analytics, marketing)}
            >
              <SiteText>{"Uložit nastavení"}</SiteText>
            </Button>
          ) : (
            <Button
              variant="link"
              className="min-h-11 px-2 text-sm underline underline-offset-2"
              onClick={() => setDetail(true)}
            >
              <SiteText>{"Nastavení"}</SiteText>
            </Button>
          )}
          <Button
            variant="link"
            className="min-h-11 px-2 text-sm underline underline-offset-2"
            onClick={() => setInfoOpen(true)}
          >
            <Info aria-hidden />
            <SiteText>{" Více o cookies"}</SiteText>
          </Button>
        </div>
      </div>
      <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg p-5 sm:p-7">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="font-display text-2xl font-normal">
              <SiteText>{"Více o cookies"}</SiteText>
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              <SiteText>
                {"Stručně a srozumitelně: co tyto technologie dělají a co si můžete zvolit."}
              </SiteText>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-relaxed">
            <section>
              <h3 className="font-semibold">
                <SiteText>{"Co jsou cookies?"}</SiteText>
              </h3>
              <p className="mt-1 text-muted-foreground">
                <SiteText>
                  {
                    "Cookies jsou malé textové soubory nebo obdobné technologie, které web při návštěvě ukládá nebo čte ve vašem zařízení či prohlížeči."
                  }
                </SiteText>
              </p>
            </section>
            <section>
              <h3 className="font-semibold">
                <SiteText>{"K čemu slouží?"}</SiteText>
              </h3>
              <p className="mt-1 text-muted-foreground">
                <SiteText>
                  {
                    "Pomáhají webu správně fungovat, pamatovat si vaše nastavení, obecně měřit návštěvnost a zájem o obsah a podle uděleného souhlasu vyhodnocovat marketing a reklamy."
                  }
                </SiteText>
              </p>
            </section>
            <details className="rounded-md border p-3" open>
              <summary className="cursor-pointer font-semibold">
                <SiteText>{"Nezbytné"}</SiteText>
              </summary>
              <p className="mt-2 text-muted-foreground">
                <SiteText>
                  {
                    "Jsou potřeba pro fungování webu a uložení vaší volby. Jsou vždy aktivní a nevyžadují souhlas."
                  }
                </SiteText>
              </p>
            </details>
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer font-semibold">
                <SiteText>{"Analytické"}</SiteText>
              </summary>
              <p className="mt-2 text-muted-foreground">
                <SiteText>
                  {
                    "Pomáhají mi v obecné a anonymní podobě porozumět návštěvnosti a tomu, které informace lidi zajímají. Do udělení souhlasu jsou vypnuté."
                  }
                </SiteText>
              </p>
            </details>
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer font-semibold">
                <SiteText>{"Marketingové"}</SiteText>
              </summary>
              <p className="mt-2 text-muted-foreground">
                <SiteText>
                  {
                    "Pomáhají vyhodnotit účinnost reklam a zobrazovat relevantnější sdělení. Do udělení souhlasu jsou vypnuté."
                  }
                </SiteText>
              </p>
            </details>
            <section>
              <h3 className="font-semibold">
                <SiteText>{"Externí nástroje"}</SiteText>
              </h3>
              <p className="mt-1 text-muted-foreground">
                <SiteText>
                  {
                    "Po vašem souhlasu může web využít Google Analytics, Google Tag Manager, Google Ads nebo Meta Pixel. Marketingový souhlas také umožní načíst Google Mapy, YouTube / Vimeo a virtuální prohlídky Matterport. Jejich poskytovatelé pak mohou související údaje zpracovávat podle svých podmínek. Před souhlasem se tyto nástroje neaktivují."
                  }
                </SiteText>
              </p>
            </section>
            <section>
              <h3 className="font-semibold">
                <SiteText>{"Volbu máte pod kontrolou"}</SiteText>
              </h3>
              <p className="mt-1 text-muted-foreground">
                <SiteText>
                  {
                    "Souhlas můžete kdykoli změnit nebo odvolat přes odkaz „Nastavení cookies“ v patičce. Zavření tohoto okna vaši volbu nijak nemění."
                  }
                </SiteText>
              </p>
            </section>
            <p>
              <Link
                to="/ochrana-osobnich-udaju"
                className="font-medium underline underline-offset-2"
                onClick={() => setInfoOpen(false)}
              >
                <SiteText>{"Zásady ochrany osobních údajů"}</SiteText>
              </Link>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setInfoOpen(false)}
            className="mt-1 w-full sm:w-auto"
          >
            <SiteText>{"Zavřít informace"}</SiteText>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
