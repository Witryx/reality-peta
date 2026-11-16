/** Obsah sekcí – připraven pro pozdější správu v administraci. */
export const services = [
  {
    slug: "prodej",
    title: "Prodej nemovitosti",
    text: "Od reálné ceny až po předání klíčů. Srozumitelně, osobně a bez zbytečného tlaku.",
    detail:
      "Společně stanovíme cenu, časový plán a způsob prezentace. Postarám se o zájemce, vyjednávání a koordinaci smluv i předání.",
  },
  {
    slug: "koupe",
    title: "Koupě",
    text: "Domov, který vám bude sedět. Pomohu s výběrem, prověřením i vyjednáváním.",
    detail:
      "Probereme vaše potřeby a rozpočet, projdeme dostupné možnosti i rizika. Rozhodnutí zůstává vždy na vás, bez tlaku na rychlou koupi.",
  },
  {
    slug: "pronajem",
    title: "Pronájem",
    text: "Spolehlivý nájemník, jasná smlouva a klidnější správa vašeho majetku.",
    detail:
      "Připravím nabídku, koordinuji prohlídky a pomohu prověřit zájemce. Ve spolupráci s právníkem zajistíme smlouvu a předávací protokol.",
  },
  {
    slug: "odhad",
    title: "Odhad a využití majetku",
    text: "Kolik má nemovitost hodnotu a jaké možnosti vám může otevřít?",
    detail:
      "Odhad vychází ze skutečných prodejů v konkrétní lokalitě. Probereme prodej, pronájem i další využití majetku, včetně nákladů a rizik, bez slibů zaručeného zhodnocení.",
  },
  {
    slug: "homestaging",
    title: "Prezentace a marketing",
    text: "Fotografie, video a promyšlená příprava. Nemovitost ukážeme pravdivě a kvalitně.",
    detail:
      "Navrhnu úpravy, které mají smysl. Kvalitní fotografie, virtuální prohlídka a cílená prezentace pomohou oslovit relevantní zájemce.",
  },
  {
    slug: "pravni-hypoteka",
    title: "Právní a hypoteční servis",
    text: "Odborníci, jasné smlouvy a bezpečný postup při zásadním životním rozhodnutí.",
    detail:
      "Ve spolupráci s advokáty a hypotečními specialisty projdeme financování, úschovu i převod. Podmínky a související náklady si vysvětlíme předem.",
  },
];

export const processSteps = [
  {
    title: "Nezávazná schůzka",
    text: "Poznáme se, prohlédnu nemovitost a probereme vaše představy i časový plán.",
  },
  {
    title: "Cena a strategie",
    text: "Připravím analýzu trhu a navrhnu cenu i způsob prodeje, který dává smysl.",
    note: "Někdy se vyplatí prodat o něco níž, mít peníze v ruce a koupit to, co dává smysl. Měsíce čekání na vysněnou cenu Vás od cíle spíš vzdalují. Spočítáme si, co se Vám vyplatí víc.",
  },
  {
    title: "Příprava a prezentace",
    text: "Homestaging, fotografie, video a texty. Nemovitost ukážeme v nejlepším světle.",
  },
  {
    title: "Prohlídky a vyjednávání",
    text: "Prověřím zájemce, vedu prohlídky a vyjednám nejlepší podmínky.",
  },
  {
    title: "Smlouvy a předání",
    text: "Právní servis, úschova kupní ceny, převod na katastru a předání klíčů.",
  },
];

/** Skutečné reference klientů (jen se souhlasem). */
export const testimonials = [
  {
    name: "Dan K.",
    context: "Koupě bytu pro rodinu",
    text: "Pan Pavlát jedná rychle, dovedl značně stlačit prodejní cenu, a tak jsme díky němu nakonec koupili byt v lepší lokalitě, než jsme původně zamýšleli.",
    isDemo: false,
  },
  {
    name: "Vera A.",
    context: "Koupě nemovitosti v zahraničí",
    text: "Během pár dnů našel naši vysněnou nemovitost v zahraničí a zajistil veškerý právní předpis. Děkujeme za profesionální přístup.",
    isDemo: false,
  },
  {
    name: "Qido K.",
    context: "Prodej bytu za 14 dní",
    text: "Kvalitní pomoc s prodejem a řešením všech náležitostí spojených s prodejem nemovitosti, rychlé a férové jednání, mohu vřele doporučit. Prodávat sám a nervovat se s tím za to určitě nestojí.",
    isDemo: false,
  },
];

/** Homepage signpost: the visitor picks a situation and sees how Petr helps. */
export const situations = [
  {
    slug: "prodej",
    label: "Prodávám",
    title: "Nejvíc peněz se často ztratí hned na začátku.",
    text: "Špatně nastavenou cenou, ne při vyjednávání. Nastavíme ji podle skutečných prodejů v okolí, připravím prezentaci, povedu prohlídky i vyjednávání. Vy máte vždy přehled, co se děje.",
  },
  {
    slug: "koupe",
    label: "Kupuji",
    title: "Co Vám prodávající neřekne.",
    text: "Prověřím nemovitost, list vlastnictví i smlouvy a upozorním Vás i na to, co v inzerátu nenajdete. Rozhodnutí zůstává vždy na Vás.",
  },
  {
    slug: "oboji",
    label: "Prodávám i kupuji",
    title: "Nejdřív prodat, nebo koupit?",
    text: "Na pořadí může záviset víc peněz, než čekáte. Sladíme termíny tak, abyste nezůstali bez bydlení a zbytečně neplatili dvakrát. Obojí hlídám já, vy máte jeden kontakt.",
  },
  {
    slug: "najem",
    label: "Pronajímám",
    title: "Spolehlivý nájemník a jasná smlouva.",
    text: "Připravím nabídku, prověřím zájemce a s právníkem nachystáme smlouvu i předávací protokol. Klidnější správa vašeho majetku.",
  },
  {
    slug: "dedictvi",
    label: "Dědím",
    title: "Zdědili jste nemovitost?",
    text: "Prodat, pronajmout, nebo nechat? Každá možnost má jiné daně i náklady. Projdeme je v klidu, než se rozhodnete.",
  },
  {
    slug: "podil",
    label: "Spoluvlastnický podíl",
    title: "Podíl jde prodat, i když se ostatní nedohodnou.",
    text: "S prodejem podílů mám zkušenost. Řeknu vám otevřeně, jaké máte možnosti a co od nich můžete čekat.",
  },
  {
    slug: "exekuce",
    label: "Exekuce nebo dluhy",
    title: "Diskrétně a bez hodnocení.",
    text: "Řeknu vám na rovinu, co se dá ještě udělat a jaký postup dává smysl. Čím dřív se ozvete, tím víc možností obvykle zbývá.",
  },
  {
    slug: "egypt",
    label: "Apartmán v Egyptě",
    title: "Krásný byt u moře od 1,15 milionu.",
    text: "4,5 hodiny letu od Prahy. Koupě v Hurghadě v češtině, s ověřením právního stavu nemovitosti a právním servisem. Provedu vás celým procesem.",
  },
] as const;
