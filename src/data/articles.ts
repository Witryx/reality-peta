/**
 * Informační články pro klienty. Jde o statický datový soubor se stejnou
 * architekturou jako `properties.ts`: později lze obsah přesunout do
 * databáze/administrace bez zásahu do UI. Obsah je obecné upozornění,
 * nenahrazuje daňové ani právní poradenství.
 */

export type ArticleSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingMinutes: number;
  updatedAt: string; // ISO datum
  sections: ArticleSection[];
};

const articles: Article[] = [
  {
    slug: "dan-z-nemovitosti",
    title: "Daň z nemovitosti: co by měl každý vlastník vědět",
    category: "Daně",
    excerpt:
      "Kdo daň platí, kdy ji řešit a co se v posledních letech změnilo. Přehled povinností, na které majitelé nejčastěji zapomínají.",
    readingMinutes: 6,
    updatedAt: "2026-10-01",
    sections: [
      {
        paragraphs: [
          "Daň z nemovitostí je místní daň, kterou platí vlastník pozemku, bytu nebo domu. Vzniká dnem, kdy se vlastnictví zapíše do katastru nemovitostí — daň přitom platí ten, kdo vlastníkem byl k 1. lednu daného roku. Pokud tedy nemovitost během roku prodáte, daň za celý rok patří stále prodávajícímu.",
          "Daň se přiznává na finančním úřadě: daňové přiznání se podává do 31. března a daň se platí do 31. května. Nový vlastník tedy obvykle poprvé řeší daň až v roce následujícím po nákupu.",
        ],
      },
      {
        heading: "Co se změnilo",
        paragraphs: [
          "Od roku 2024 se daň z nemovitostí výrazně zvedla — základní sazba se zvýšila na 1,5násobek a zanikla většina dosavadních slev (například sleva na manžela nebo na vyhrazené technické vybavení domů). Od roku 2025 se pro bytové jednotky a jednotky v rodinných domech používají také nové, zvýšené průměrné ceny, ze kterých se daň počítá.",
        ],
      },
      {
        heading: "Na co si dávat pozor",
        bullets: [
          "Stavební úpravy (nová terasa, garáž, nadstandard) zpravidla mění zápočet plochy — je potřeba podat nové přiznání.",
          "Zapomenuté přiznání znamená penále. Pokud si nejste jistí, zeptejte se daňového poradce nebo finančního úřadu.",
          "Zálohu i konkrétní výši daně si vždy ověřte u příslušného finančního úřadu — v tomto článku nejsou žádná konkrétní čísla, ty se mění.",
        ],
      },
      {
        paragraphs: [
          "Jde o obecné informace, nikoli daňové poradenství. U konkrétní nemovitosti vždy doporučuji ověřit výši daně aktuálně.",
        ],
      },
    ],
  },
  {
    slug: "pnb-predani-nemovitosti",
    title: "PNB — protokol o předání a převodu nemovitosti: co nepodcenit",
    category: "Prodej a předání",
    excerpt:
      "Protokol o předání je dokument, který chrání obě strany. Co má obsahovat a jaké povinnosti má majitel při předání nemovitosti.",
    readingMinutes: 7,
    updatedAt: "2026-10-01",
    sections: [
      {
        heading: "Co je to PNB",
        paragraphs: [
          "PNB (protokol o předání a převodu nemovitosti) je dokument, kterým se nemovitost fakticky předává z rukou do rukou. Zapisuje se do něj den předání, stavy měřidel, počet předaných klíčů, stav vybavení i případné dohody o drobných nedostatcích.",
          "Pro kupujícího je PNB důkazem, kdy nemovitost převzal a v jakém stavu. Pro prodávajícího zase určuje okamžik, kdy přecházejí nebezpečí náhodné zkázy i povinnosti k dodavatelům energií. Podepisuje se obvykle v den předání, tedy po vstupu kupní ceny do úschovy a po prohlídce.",
        ],
      },
      {
        heading: "Povinnosti majitele před a při předání",
        bullets: [
          "Odhlásit a přepsat energie — elektřinu, plyn i vodu. Dodavatelům je potřeba nahlásit stavy měřidel a ukončení smluv; k tomu se nejlépe vystaví jednoduchá plná moc.",
          "Připravit stavy měřidel — nasnímat aktuální stavy elektroměrů, plynu i vody přímo k datu předání.",
          "Předat kompletní dokumentaci — prohlašovací dokumenty, povolení ke stavbě a kolaudace, servisní zprávy (krbová kachna, klimatizace, rekuperace), servisní smlouvy a klíče.",
          "V bytě ve společném vlastnictví včas hlásit změnu vlastníka správci domu (SVJ/MD) a řešit úschovu — doporučuji nechat si notářsky potvrzenou schůzi účtů, případně zpracovat ČORECH.",
          "Předat nemovitost uklizenou a bez osobních věcí — dohody o tom, co zůstává (osazení, kuchyňská linka, spotřebiče), by měly být v kupní smlouvě, ne jen v jednání.",
        ],
      },
      {
        heading: "Na co si dávat pozor",
        bullets: [
          "Nezaplacené energie ani zálohy prodávajícího nezastihnou — přesto energie ihned po předání odhlaste.",
          "Vady, které se zanedbaly v PNB, se pak hůře řeší — proto je v protokolu zmiňovat otevřeně.",
          "Den předání je i den přechodu povinností — jasně sjednoťte, od kdy na koho přechází pojistka nemovitosti.",
        ],
      },
      {
        paragraphs: [
          "PNB je drobný dokument, který ale ušetří spoustu sporů. Připravím ho klientům jako součást kompletního servisní a právního balíčku.",
        ],
      },
    ],
  },
  {
    slug: "urokove-sazby-hypoteky",
    title: "Úrokové sazby a hypotéky: jak se v nich zorientovat",
    category: "Hypotéky",
    excerpt:
      "Jak úroková sazba ovlivňuje vaši splátku, proč se nesčítají jablka a hrušky u fixace a na co si dát pozor před podpisem hypoteční smlouvy.",
    readingMinutes: 6,
    updatedAt: "2026-10-01",
    sections: [
      {
        heading: "Sazba a splátka jdou ruku v ruce",
        paragraphs: [
          "Výše úrokové sazby je jeden z hlavních faktorů, kolik za hypotéku zaplatíte. I malý rozdíl v sazbě se na 30 let úvěru projeví statitisíce korun. Proto se vyplatí hypotéku řešit v momentě, kdy je na to vhodné na trhu — a hlavně když je to řešitelné pro vaši rodinnou situaci.",
        ],
      },
      {
        heading: "Fixace a refinancování",
        paragraphs: [
          "Fixace je doba, po kterou je sazba zafixovaná — obvykle 3 až 10 let. Před koncem fixace se vyplatí hypotéku řešit s předstihem: přejít k jiné bance nebo si refinancovat sazbu u současné. Banky bývají ochotné vyjít vstříc hlavně tehdy, když klient přichází s konkurenční nabídkou.",
        ],
      },
      {
        heading: "Na co si dávat pozor",
        bullets: [
          "Nesrovnávejte jen úrokovou sazbu, ale celé RPSN — v něm jsou i poplatky a platební podmínky.",
          "Dávejte si pozor na propagační sazby — často platí jen krátkou dobu nebo za specifických podmínek.",
          "Mějte v hlavě rezervu — splátka se počítá podle aktuálních sazeb, které se mění. Nejbližší sazbu i podmínky zjistíte u banky nebo u hypotečního poradce.",
          "Před podpisem se ujistěte, že rozumíte sankcím za předčasnou splatnost — dnes už se to často dá řešit přepočtem nebo překlopením do nové fixace.",
        ],
      },
      {
        paragraphs: [
          "Aktuální sazby se neustále mění — v tomto článku nejsou žádná konkrétní čísla, ta vždy ověřte u banky nebo hypotečního poradce. K hypotečnímu poradenství mám dlouholeté zázemí, rád vás nasměruju.",
        ],
      },
    ],
  },
  {
    slug: "bezpecne-predani-penez",
    title: "Jak bezpečně převést peníze při prodeji nemovitosti",
    category: "Prodej a předání",
    excerpt:
      "Hotovost, převod z ruky do ruky, úschova u notáře — jaké riziky nese každá varianta a proč je pro obě strany nejbezpečnější úschova.",
    readingMinutes: 5,
    updatedAt: "2026-10-01",
    sections: [
      {
        heading: "Největší transakce si zaslouží největší péči",
        paragraphs: [
          "Koupě nemovitosti je pro většinu lidí největší finanční transakce v životě. Přesto se stále občas setkávám s pokusy o převod peněz „z ruky do ruky“ nebo o vklad hotovosti, který nemá žádné doklady. I proto doporučuji každou platbu při prodeji nemovitosti jednoznačně zdokumentovat.",
        ],
      },
      {
        heading: "Úschova — pojistka pro obě strany",
        paragraphs: [
          "Nejbezpečnější variantou je úschova kupní ceny u notáře, advokáta nebo v bance. Peníze se z úschovy uvolní až po splnění sjednaných podmínek — typicky po vkladu vlastnického práva do katastru. Kupující tak není vystaven riziku, že peníze pošle, ale nemovitost nedostane. Prodávající má jistotu, že peníze jsou zajištěné a dostane je hned po zapsání do katastru.",
        ],
      },
      {
        heading: "Na co si dávat pozor",
        bullets: [
          "Hotovost — nikdy nepřenášejte bez dokladů. Počítejte s tím, že banky mohou u neobvyklých transakcí klást otázky, a občané mají povinnost doložit původ peněz.",
          "Kupní cena musí být v smlouvě zapsaná pravdivě — umělé snížení ceny kvůli dani přináší problémy oběma stranám.",
          "Zjištěné dluhy — nechte prověřit, zda na nemovitosti nevisí exekuce, věcná břemena — katastr je veřejný a dá se dohledat.",
          "Prodej s čerpáním hypotéky — sjednejte termíny tak, aby peníze z banky a z vlastních zdrojů přicházely k datu vkladu.",
        ],
      },
    ],
  },
  {
    slug: "energeticky-stitek",
    title: "Energetický štítek: povinnost, která se při prodeji řeší",
    category: "Vlastnictví",
    excerpt:
      "Energetický štítek se při prodeji i pronájmu vyžaduje. Kdo ho musí mít, kolik stojí a jaké sankce za chybějící dokument hrozí.",
    readingMinutes: 4,
    updatedAt: "2026-10-01",
    sections: [
      {
        heading: "Kdy je štítek potřeba",
        paragraphs: [
          "Při prodeji nebo pronájmu bytu, domu či nebytového prostoru je prodávající či pronajímatel povinen předat zájemci energetický štítek a uvést energetickou třídu v inzerátu. V praxi to znamená, že štítek potřebujete dřív, než vydáte inzerát — ne až po podpisu smlouvy.",
        ],
      },
      {
        heading: "Na co si dávat pozor",
        bullets: [
          "Povinnost doložit štítek se týká i starších domů — věk stavby neosvobozuje.",
          "V inzerátu i v smlouvě musí být uvedená energetická třída — zvláště u pronájmů se na to kontrola stavebních úřadů často zaměřuje.",
          "Penále za chybějící štítek sahá až k částkám v řádech statisíců korun — vždy se konkrétní výše a podmínky ověřte.",
          "Kvalitní štítek nechte zpracovat odborníkem — levné „papírové“ štítky bez prohlídky nemovitosti mohou být nesprávné.",
        ],
      },
      {
        paragraphs: [
          "Energetický štítek vypracovává energetický specialista na základě prohlídky nebo dokumentace. Doporučuji ho řešit v úvodu prodeje, ne až na poslední chvíli.",
        ],
      },
    ],
  },
];

export async function listArticles(): Promise<Article[]> {
  return [...articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  return articles.find((a) => a.slug === slug);
}
