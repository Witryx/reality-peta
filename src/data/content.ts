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
    note: "Stát za cenou se nemusí vyplatit. Společně zvážíme, co je pro vás výhodnější.",
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

/** UKÁZKOVÉ reference – nahradit skutečnými se souhlasem klientů. */
export const testimonials = [
  {
    name: "Jana a Martin",
    context: "Prodej bytu 3+1, Praha 3",
    text: "Petr nám vysvětlil každý krok a byl vždy k zastižení. Prodej proběhl rychleji, než jsme čekali, a bez jediného stresu.",
    isDemo: true,
  },
  {
    name: "Tomáš K.",
    context: "Koupě domu, Praha-západ",
    text: "Oceňuji, že nám nic netlačil. Upozornil i na věci, které by nám jiný makléř raději zamlčel.",
    isDemo: true,
  },
  {
    name: "Eva S.",
    context: "Pronájem bytu, Praha 7",
    text: "Lidský přístup a profesionální výsledek. Nájemníka jsme měli do dvou týdnů.",
    isDemo: true,
  },
];

/** Homepage signpost: the visitor picks a situation and sees how Petr helps. */
export const situations = [
  {
    slug: "prodej",
    label: "Prodávám",
    title: "Prodej, u kterého víte, co přijde dál.",
    text: "Nastavíme reálnou cenu podle skutečných prodejů v okolí, připravím prezentaci, povedu prohlídky i vyjednávání. Vy máte vždy přehled, co se děje.",
  },
  {
    slug: "koupe",
    label: "Kupuji",
    title: "Koupě bez unáhlených rozhodnutí.",
    text: "Pomohu s výběrem, prověřím nemovitost i smlouvy a vyjednám podmínky. Rozhodnutí zůstává vždy na vás.",
  },
  {
    slug: "oboji",
    label: "Prodávám i kupuji",
    title: "Prodej a koupě v jednom plánu.",
    text: "Sladíme termíny tak, abyste nezůstali bez bydlení a zbytečně neplatili dvakrát. Obojí hlídám já, vy máte jeden kontakt.",
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
    title: "Dědictví v klidu a bez spěchu.",
    text: "Probereme, co s nemovitostí dává smysl – prodat, pronajmout, nebo ji ponechat. A co s každou možností souvisí.",
  },
  {
    slug: "podil",
    label: "Spoluvlastnický podíl",
    title: "Spoluvlastnický podíl má svá specifika.",
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
    title: "Apartmán u Rudého moře.",
    text: "Koupě v Hurghadě v češtině, s ověřením právního stavu nemovitosti a právním servisem. Provedu vás celým procesem.",
  },
] as const;
