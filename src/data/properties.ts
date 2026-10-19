import hero from "@/assets/hero.jpg";
import exterior from "@/assets/prop-exterior.jpg";
import kitchen from "@/assets/prop-kitchen.jpg";
import house from "@/assets/prop-house.jpg";
import egyptApartment from "@/assets/egypt-apartment.jpg";
import egyptVilla from "@/assets/egypt-villa.jpg";
import egyptResort from "@/assets/egypt-resort.jpg";
import type { Property, PropertyStatus } from "./types";
import { createServerFn } from "@tanstack/react-start";

/**
 * Vývojová ukázková data pouze při chybějící databázi.
 * Připojená databáze i produkce čtou vlastní publikované nabídky.
 */
const demo: Property[] = [
  {
    id: "demo-1",
    slug: "byt-3kk-praha-vinohrady-manesova",
    title: "Světlý byt 3+kk s balkonem a výhledem na Hrad",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    disposition: "3+kk",
    location: { city: "Praha 2", district: "Vinohrady", street: "Mánesova" },
    price: 12_490_000,
    area: 92,
    floor: "4. NP z 5",
    ownership: "Osobní",
    condition: "Po kompletní rekonstrukci",
    energyClass: "C",
    building: "Cihlová, secesní dům",
    perex: "Vzdušný byt v secesním domě s původními prvky, balkonem a výhledem přes střechy Prahy.",
    description: [
      "Byt se nachází ve čtvrtém patře pečlivě udržovaného secesního domu v klidné části Vinohrad. Vysoké stropy, velká okna a dubová parketa v klasickém vzoru dávají interiéru světlo a klid.",
      "Obývací pokoj s kuchyní tvoří přirozené centrum bytu a navazuje na balkon s výhledem na Pražský hrad. Dvě samostatné ložnice jsou orientované do tichého vnitrobloku.",
      "Rekonstrukce proběhla s respektem k původnímu charakteru domu – zachovány byly štukové prvky a kastlová okna, rozvody, koupelna i kuchyně jsou nové.",
      "V docházkové vzdálenosti je náměstí Míru, parky Riegrovy sady a Havlíčkovy sady, metro A i tramvajové spoje.",
    ],
    features: ["Balkon", "Výtah", "Sklepní kóje", "Nová kuchyň", "Původní parkety", "Kastlová okna", "Videotelefon"],
    images: [
      { src: hero, alt: "Obývací pokoj s balkonem a výhledem na Pražský hrad", position: 0 },
      { src: kitchen, alt: "Kuchyň s ostrůvkem a dubovými skříňkami", position: 1 },
      { src: exterior, alt: "Secesní fasáda domu na Vinohradech", position: 2 },
    ],
    videoUrl: "",
    matterportUrl: "",
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-09-20",
    isDemo: true,
  },
  {
    id: "demo-2",
    slug: "rodinny-dum-5kk-cernosice",
    title: "Moderní rodinný dům 5+kk se zahradou",
    status: "reserved",
    offerType: "sale",
    propertyType: "dům",
    disposition: "5+kk",
    location: { city: "Černošice", district: "Praha-západ" },
    price: 18_900_000,
    area: 168,
    landArea: 820,
    ownership: "Osobní",
    condition: "Novostavba",
    energyClass: "A",
    perex: "Dřevostavba s velkoryse prosklenou obytnou částí a jihozápadní zahradou.",
    description: [
      "Dům v klidné rezidenční části Černošic spojuje moderní architekturu s přírodními materiály. Obytná část s kuchyní se otevírá na terasu a zahradu.",
      "V patře jsou čtyři ložnice, dvě koupelny a pracovna. Tepelné čerpadlo a rekuperace zajišťují nízké provozní náklady.",
    ],
    features: ["Zahrada", "Terasa", "Tepelné čerpadlo", "Rekuperace", "2 parkovací stání"],
    images: [
      { src: house, alt: "Moderní dřevěný rodinný dům se zahradou při západu slunce", position: 0 },
      { src: kitchen, alt: "Kuchyň v rodinném domě", position: 1 },
    ],
    featured: true,
    sortOrder: 2,
    publishedAt: "2026-09-05",
    isDemo: true,
  },
  {
    id: "demo-3",
    slug: "byt-2kk-praha-holesovice",
    title: "Byt 2+kk v cihlovém domě u Letné",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    disposition: "2+kk",
    location: { city: "Praha 7", district: "Holešovice" },
    price: 7_950_000,
    area: 58,
    floor: "2. NP z 6",
    ownership: "Osobní",
    condition: "Velmi dobrý",
    energyClass: "D",
    perex: "Praktický byt s novou kuchyní, pár minut od Letenských sadů.",
    description: [
      "Útulný byt s orientací do klidné ulice, ideální pro jednotlivce či pár. Kuchyňská linka je nová, koupelna s oknem.",
    ],
    features: ["Výtah", "Sklep", "Nová kuchyň"],
    images: [
      { src: kitchen, alt: "Světlá kuchyň v bytě 2+kk", position: 0 },
      { src: exterior, alt: "Činžovní dům", position: 1 },
    ],
    featured: false,
    sortOrder: 3,
    publishedAt: "2026-08-28",
    isDemo: true,
  },
  {
    id: "demo-4",
    slug: "byt-4-1-praha-vinohrady-sold",
    title: "Reprezentativní byt 4+1 na Vinohradech",
    status: "sold",
    offerType: "sale",
    propertyType: "byt",
    disposition: "4+1",
    location: { city: "Praha 2", district: "Vinohrady" },
    price: null,
    area: 124,
    floor: "3. NP z 5",
    ownership: "Osobní",
    condition: "Původní stav",
    energyClass: "E",
    perex: "Prodáno během tří týdnů od spuštění inzerce.",
    description: ["Velkorysý byt v činžovním domě, prodán nad odhadní cenou."],
    features: ["Balkon", "Sklep"],
    images: [
      { src: exterior, alt: "Secesní dům na Vinohradech", position: 0 },
      { src: hero, alt: "Interiér bytu", position: 1 },
    ],
    featured: false,
    sortOrder: 4,
    publishedAt: "2026-06-12",
    isDemo: true,
  },
  {
    id: "demo-5",
    slug: "domci-4kk-praha-veznimost",
    title: "Rodinný dům 4+kk s zahradou na okraji Prahy",
    status: "active",
    offerType: "sale",
    propertyType: "dům",
    disposition: "4+kk",
    location: { city: "Praha 21", district: "Újezd nad Lesy" },
    price: 11_990_000,
    area: 140,
    landArea: 500,
    ownership: "Osobní",
    condition: "Udržovaný",
    energyClass: "C",
    building: "Cihlový dům z roku 2005",
    perex: "Rodinný dům s dvouúrovňovou zahradou a garáží, ticho na okraji Prahy.",
    description: [
      "Dům s dispozicí 4+kk nabízí obytnou část s kuchyní a jídelnou, čtyři pokoje a dvě koupelny, garáž i sklep.",
      "Zahrada o pěti stech metrech je udržovaná, s terasou, pergolou a vzrostlými stromy.",
    ],
    features: ["Zahrada", "Garáž", "Sklep", "Terasa", "2 koupelny"],
    images: [
      { src: house, alt: "Rodinný dům s zahradou", position: 0 },
      { src: kitchen, alt: "Kuchyně v domě", position: 1 },
    ],
    featured: false,
    sortOrder: 5,
    publishedAt: "2026-10-02",
    isDemo: true,
  },
  {
    id: "demo-6",
    slug: "byt-1-1-praha-smichov-najem",
    title: "Byt 1+1 na pronájem na Smíchově",
    status: "active",
    offerType: "rent",
    propertyType: "byt",
    disposition: "1+1",
    location: { city: "Praha 5", district: "Smíchov", street: "Nádražní" },
    price: 22_500,
    area: 38,
    floor: "3. NP z 6",
    ownership: "Vlastnický",
    condition: "Po rekonstrukci",
    energyClass: "D",
    building: "Cihlový dům",
    perex: "Nově zrekonstruovaný byt na pronájem, kousek od Andělu i Tropické zahrady.",
    description: [
      "Zrekonstruovaný byt s novou kuchyní a koupelnou. Ideální pro jednotlivce nebo pár.",
      "Dobrá doprava — metro B, tramvaj i vlak na Smíchovském nádraží.",
    ],
    features: ["Výtah", "Nová koupelna", "Kuchyňská linka"],
    images: [
      { src: kitchen, alt: "Kuchyně bytu na pronájem", position: 0 },
      { src: exterior, alt: "Dům s bytem na pronájem", position: 1 },
    ],
    featured: false,
    sortOrder: 6,
    publishedAt: "2026-10-06",
    isDemo: true,
  },
  {
    id: "demo-7",
    slug: "meho-dum-na-preprodukci",
    title: "Prostorný dům 6+1 s pozemkem 1500 m²",
    status: "active",
    offerType: "sale",
    propertyType: "dům",
    disposition: "6+1",
    location: { city: "Kladno", district: "Kladno" },
    price: 9_450_000,
    area: 210,
    landArea: 1500,
    ownership: "Osobní",
    condition: "Před rekonstrukcí",
    energyClass: "G",
    building: "Cihlová stavba",
    perex: "Velký dům s velkým pozemkem, ideální pro rekonstrukci dle vlastních představ.",
    description: [
      "Dům s dispozicí 6+1 nabízí velký obytný prostor, který je po vyklizení připraven na rekonstrukci.",
      "Pozemek o 1500 m² umožňuje zahradu, dílnu či bazén. Vhodný pro rodinu nebo jako investice.",
    ],
    features: ["Velký pozemek", "Sklep", "Garáž", "Klidná lokalita"],
    images: [
      { src: exterior, alt: "Dům s pozemkem", position: 0 },
      { src: house, alt: "Zahrada domu", position: 1 },
    ],
    featured: false,
    sortOrder: 7,
    publishedAt: "2026-10-07",
    isDemo: true,
  },
];

const egyptImages = {
  apartment: { src: egyptApartment, alt: "Obývací pokoj apartmánu s výhledem na Rudé moře" },
  villa: { src: egyptVilla, alt: "Vila s privátním bazénem a palmami u Rudého moře" },
  resort: { src: egyptResort, alt: "Nový rezort s bazénem přímo u pláže" },
};

/**
 * Vývojové egyptské nabídky. Vlastní nabídky používají stejný model.
 */
const egyptDemo: Property[] = [
  {
    id: "egypt-demo-1",
    slug: "egypt-apartman-2kk-hurghada-vyhled-na-more",
    title: "Apartmán 2+kk s výhledem na Rudé moře",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    market: "egypt",
    disposition: "2+kk",
    location: { city: "Hurghada", district: "Sakkala" },
    price: 4_290_000,
    area: 68,
    floor: "5. NP z 8",
    ownership: "Vlastnictví dle egyptského práva",
    condition: "Novostavba",
    energyClass: "—",
    building: "Rezort s bazénem a recepí",
    perex: "Světlý apartmán s terasou a výhledem na moře, kousek od centra Hurghady.",
    description: [
      "Apartmán v novém rezortu se společným bazénem a veškerou občanskou vybaveností. Obývací pokoj s kuchyní otevírá terasu s výhledem na moře.",
      "Součástí je správa nemovitosti a možnost pronájmu přes provozovatele rezortu.",
    ],
    features: ["Terasa s výhledem na moře", "Bazén v rezortu", "Recepce", "Správa nemovitosti"],
    images: [
      { ...egyptImages.apartment, position: 0 },
      { ...egyptImages.resort, position: 1 },
    ],
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-10-01",
    isDemo: true,
  },
  {
    id: "egypt-demo-2",
    slug: "egypt-vila-s-bazenem-sahl-hasheesh",
    title: "Vila s privátním bazénem u Rudého moře",
    status: "reserved",
    offerType: "sale",
    propertyType: "dům",
    market: "egypt",
    disposition: "4+kk",
    location: { city: "Sahl Hasheesh", district: "Při Hurghadě" },
    price: 16_900_000,
    area: 220,
    landArea: 600,
    ownership: "Vlastnictví dle egyptského práva",
    condition: "Novostavba",
    energyClass: "—",
    perex: "Samostatná vila s bazénem, zahradou a výhledem na zátoku v prestižní lokalitě.",
    description: [
      "Dvoupodlažní vila s prostornou obytnou částí, čtyřmi ložnicemi a krytou terasou. Privátní bazén a zahrada jsou orientované k západu slunce nad mořem.",
      "V rámci komunity s hlídanou vstupem, restaurací a přístupem k pláži.",
    ],
    features: ["Privátní bazén", "Zahrada", "Hlídaná komunita", "Přístup k pláži"],
    images: [
      { ...egyptImages.villa, position: 0 },
      { ...egyptImages.apartment, position: 1 },
    ],
    featured: true,
    sortOrder: 2,
    publishedAt: "2026-09-18",
    isDemo: true,
  },
  {
    id: "egypt-demo-3",
    slug: "egypt-byt-v-rezortu-u-plaze-makadi",
    title: "Nový byt v rezortu přímo u pláže",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    market: "egypt",
    disposition: "1+kk",
    location: { city: "Makadi Bay", district: "Při Hurghadě" },
    price: 2_890_000,
    area: 46,
    floor: "2. NP z 4",
    ownership: "Vlastnictví dle egyptského práva",
    condition: "Novostavba",
    energyClass: "—",
    perex: "Kompaktní byt kousek od pláže, vhodný pro vlastní pobyt i pronájem.",
    description: [
      "Funkční dispozice 1+kk s balkonem do rezortní zahrady. Rezort nabízí bazény, restauraci a přímý přístup k pláži.",
      "Prodej probíhá ve spolupráci s egyptským partnerem, právní režim projdeme předem.",
    ],
    features: ["Balkon", "Bazény rezortu", "Přímý přístup k pláži", "Možnost pronájmu"],
    images: [
      { ...egyptImages.resort, position: 0 },
      { ...egyptImages.apartment, position: 1 },
    ],
    featured: false,
    sortOrder: 3,
    publishedAt: "2026-09-02",
    isDemo: true,
  },
  {
    id: "egypt-demo-4",
    slug: "egypt-apartman-3kk-el-gouna",
    title: "Apartmán 3+kk s terasou v El Gouně",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    market: "egypt",
    disposition: "3+kk",
    location: { city: "El Gouna", district: "Při Hurghadě" },
    price: 9_800_000,
    area: 110,
    floor: "1. NP z 3",
    ownership: "Vlastnictví dle egyptského práva",
    condition: "Novostavba",
    energyClass: "—",
    building: "Rezidentní komunita u laguny",
    perex: "Prostorný apartmán v El Gouně s terasou u laguny a plnou občanskou vybaveností.",
    description: [
      "El Gouna je plánované město s marinou, školou, nemocnicí a golfovým hřištěm. Apartmán stojí v první linii u laguny.",
      "Součástí je společný bazén, zahrada a správa nemovitosti včetně možnosti pronájmu.",
    ],
    features: ["Terasa u laguny", "Bazén v komunitě", "Správa nemovitosti", "Golf a marina v okolí"],
    images: [
      { ...egyptImages.apartment, position: 0 },
      { ...egyptImages.villa, position: 1 },
    ],
    featured: false,
    sortOrder: 4,
    publishedAt: "2026-10-04",
    isDemo: true,
  },
  {
    id: "egypt-demo-5",
    slug: "egypt-duplex-u-more-makadi",
    title: "Duplex 2+1 s výhledem na pláž v Makadi Bay",
    status: "active",
    offerType: "sale",
    propertyType: "byt",
    market: "egypt",
    disposition: "2+1",
    location: { city: "Makadi Bay", district: "Při Hurghadě" },
    price: 5_150_000,
    area: 74,
    floor: "2. NP z 3",
    ownership: "Vlastnictví dle egyptského práva",
    condition: "Novostavba",
    energyClass: "—",
    building: "Rezort s bazénem",
    perex: "Dvoupodlažní duplex v rezortu s bazény a přímým přístupem k pláži.",
    description: [
      "Duplex s obývací částí a kuchyní v přízemí, ložnicemi a koupelnou v patře. Z pokoje vede balkon s výhledem na moře.",
      "Rezort má několik bazénů, restauraci a přímý vstup na pláž. Právní režim projdeme předem s partnerem na místě.",
    ],
    features: ["Balkon s výhledem", "Bazény rezortu", "Přímý přístup k pláži", "Restaurace v rezortu"],
    images: [
      { ...egyptImages.resort, position: 0 },
      { ...egyptImages.apartment, position: 1 },
    ],
    featured: false,
    sortOrder: 5,
    publishedAt: "2026-10-05",
    isDemo: true,
  },
];

const readProperties = createServerFn({ method: "GET" }).handler(async (): Promise<Property[]> => {
  const { hasDatabase } = await import("@/server/database.server");
  if (hasDatabase()) {
    const { publicProperties } = await import("@/server/properties.server");
    return publicProperties();
  }
  if (process.env["NODE_ENV"] === "production") throw new Error("Chybí databáze pro produkční nabídky.");
  return [...demo, ...egyptDemo];
});

const sorted = async () => (await readProperties()).sort((a, b) => a.sortOrder - b.sortOrder);

/** Všechny publikované nabídky z Česka i Egypta pro společný přehled. */
export async function listAllProperties(): Promise<Property[]> {
  return sorted();
}

export async function listProperties(status?: PropertyStatus): Promise<Property[]> {
  return (await sorted()).filter((p) => (p.market ?? "cz") === "cz").filter((p) => !status || p.status === status);
}

export async function getProperty(slug: string): Promise<Property | null> {
  return (await readProperties()).find((p) => p.slug === slug) ?? null;
}

export async function listFeatured(): Promise<Property[]> {
  return (await sorted()).filter((p) => (p.market ?? "cz") === "cz" && p.featured && p.status !== "sold").slice(0, 6);
}

/** Publikované egyptské nabídky pro sekci Egypt. */
export async function listEgypt(): Promise<Property[]> {
  return (await sorted()).filter((p) => p.market === "egypt");
}
