# Petr Pavlát reality — vlastní web a administrace

React 19 / TanStack Start, SSR na Node.js 22, PostgreSQL a fotografie v databázi na Vercelu nebo na vlastním disku.
Provoz aplikace nepotřebuje Lovable ani Supabase. Původní git historii nepřepisujte;
případná synchronizace zdrojových souborů s Lovable může pokračovat.

## Co je hotové

- `/admin`: přihlášení správce, přehled portfolia a nových poptávek.
- Přidávání, úpravy, duplikování a mazání nemovitostí; Česko i Egypt, prodej i pronájem.
- Koncept, zveřejnění (i budoucí datum), archiv; aktivní, rezervovaná a prodaná nabídka.
- Cena, plocha, dispozice, lokalita, parametry, popis, vybavení, video a Matterport.
- Galerie, titulní fotografie, změna pořadí, popisky a opakované použití knihovny.
- Nahrávání JPG/PNG/WebP/AVIF: zdroj do 12 MB / 40 Mpx, velké soubory se zmenší před přenosem, převod na WebP do 2400 px, odstranění původních metadat.
- Na Vercelu jsou fotky trvale v PostgreSQL v oddělené tabulce `media_files`; na vlastním serveru zůstává výchozí disk. Všude stejné chráněné URL `/uploads/…`.
- Náhled nabídky před uložením, vyhledávání, filtry, doporučené nabídky první na úvodu.
- Kontaktní formulář, odhad i dotaz k nabídce skutečně zapisují do tabulky `leads`.
- Správa poptávek: stavy, interní poznámky, kontakty, výmaz a CSV export.
- Změna hesla, historie zásahů a JSON export dat.
- Články: nové blogy, úpravy stávajících, sekce s odstavci a odrážkami, titulní fotografie, koncept / zveřejnění / archiv.
- Fotky webu: výměna úvodní fotografie, pobřeží Egypta, prezentace služeb a obou portrétů, výběr z knihovny a návrat k originálu. Texty a fotky sdílejí kontrolu verze a audit.
- Docker Compose, HTTPS přes Caddy, trvalé volumes, healthcheck, záloha a obnova.

## Lokální spuštění

Potřebujete Node.js 22.12+ a npm. Instalace používá `package-lock.json`.

```sh
npm ci
```

Zkopírujte `.env.example` do `.env`. Pokud už `.env` máte, zachovejte ho a doplňte
`LOCAL_DATABASE=1`, `APP_URL=http://localhost:3000`, `UPLOAD_DIR=./uploads`.
Staré proměnné Supabase se již nepoužívají.

```sh
npm run db:migrate
```

Na Vercelu ji produkční `npm run build` spouští automaticky přes migrační `DATABASE_URL`.
Preview a lokální buildy databázi nemění. Na vlastním serveru spusťte migraci i na existující databázi (migračním účtem).
Přidá tabulku `articles` a práva stávajícího `realty_app`, jednorázově převede dosavadní
články včetně textových úprav. Opakované migrace články nepřepisují ani neobnovují smazané články.
Články pak spravujete v `/admin` → Články; fotografie sekcí v `/admin` → Fotky webu.

Lokálně běží PGlite (PostgreSQL ve WASM); data jsou trvale v `.local/postgres`.
Databázi používejte jen z jednoho procesu současně: pro vytváření správce nejdřív
zastavte dev server. V produkci je tato varianta zablokovaná a vyžaduje se PostgreSQL.

Vytvořte vlastní přístup. Heslo zadávejte skrytě, nikdy ho neposílejte do chatu.
PowerShell:

```powershell
$env:ADMIN_EMAIL = Read-Host 'E-mail správce'
$env:ADMIN_NAME = Read-Host 'Jméno správce'
$taskPassword = Read-Host 'Heslo (alespoň 12 znaků)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $taskPassword).Password
npm run admin:create
Remove-Item Env:ADMIN_PASSWORD
```

Bash:

```sh
read -r -p 'E-mail: ' ADMIN_EMAIL
read -r -p 'Jméno: ' ADMIN_NAME
read -r -s -p 'Heslo (alespoň 12 znaků): ' ADMIN_PASSWORD; printf '\n'
export ADMIN_EMAIL ADMIN_NAME ADMIN_PASSWORD
npm run admin:create
unset ADMIN_PASSWORD
```

```sh
npm run dev
```

Web: `http://localhost:3000`, administrace: `http://localhost:3000/admin`.
V této pracovní kopii už existuje lokální účet pro vyzkoušení. Přístupové údaje jsou
v ignorovaném `.local/admin-access.txt`; patří pouze k tomuto počítači a nekopírují se na VPS.
Další správce vznikne stejným příkazem s jiným e-mailem. Existující e-mail obnoví
heslo a odhlásí jeho relace. Veřejná registrace ani výchozí produkční heslo neexistují.

Pro reset existujícího produkčního účtu použijte `npm run admin:reset`. Potřebuje
externí `APP_DATABASE_URL` nebo `DATABASE_URL`; lokální databázi záměrně nepoužije.
Zachová e-mail i jméno, zneplatní relace vybraného účtu a zapíše reset do auditu.
Pokud existuje jediný správce, vybere ho automaticky; při více účtech vyžádá e-mail.
Nové heslo v PowerShellu zadáte skrytě:

```powershell
$taskAdminPassword = Read-Host 'Nové heslo (12–200 znaků)' -AsSecureString
$env:ADMIN_PASSWORD = [System.Net.NetworkCredential]::new('', $taskAdminPassword).Password
try { npm.cmd run admin:reset } finally { Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue }
```

Pro ostrý projekt reality-peta na Vercelu použijte ve stejném PowerShell bloku
`npm.cmd run admin:reset:vercel` místo `npm.cmd run admin:reset`. Nejdříve se přihlaste
pomocí `npx.cmd vercel login` a propojte existující projekt pomocí `npx.cmd vercel link`.
Tento příkaz odešle pouze scrypt hash jako dočasnou produkční Secret proměnnou a spustí
nasazení. Reset proběhne uvnitř Vercelu s jeho databázovým připojením, ověří se běžným
přihlášením a dočasná proměnná se odstraní. Heslo se nevypisuje ani neposílá přes CLI
argumenty. Audit zabraňuje opakovanému resetu v dalších nasazeních; nevyužitý požadavek
platí hodinu a je svázaný s konkrétním ID projektu. Nevybírá automaticky mezi více účty.
Citlivé proměnné Vercelu nelze stahovat přes `env pull` / `env run`, proto je tento
postup nepotřebuje zpřístupnit lokálně. Pro více účtů nastavte `ADMIN_EMAIL`.

Bez nastavené databáze se ve vývoji ukazují původní demo nabídky; formuláře v tomto
režimu nevypisují falešné potvrzení. Připojená prázdná databáze začíná bez nemovitostí.
Demo nabídky se do produkce automaticky nekopírují.

## Logo, portréty a podpis

Čtyři původní PNG jsou uložené v `src/assets/` vedle svých asset-pointer JSON souborů:

- `petr-pavlat-logo.png`
- `petr-pavlat-portrait.png`
- `petr-pavlat-full.png`
- `petr-pavlat-signature.png`

JSON soubory zachovejte: komponenty přes ně načítají originály a Vite je zahrnuje do
sestavení pod vlastními URL. Fotografie ani logo se při běhu nestahují z Lovable.
Při výměně zachovejte názvy souborů; alternativně lze PNG umístit do `public/brand/`,
`public/assets/` nebo kořene `public/`. Při shodě názvů má přednost `public/brand/`.
Pokud originál chybí, zobrazí se výslovný placeholder. Po výměně sestavte novou produkční verzi.
`npm run assets:import` zůstává pomocným nástrojem pro případnou obnovu z původního webu
(vyžaduje `ASSET_ORIGIN`); nynější lokální originály jej nepotřebují.
Fonty už se servírují přímo z aplikace, bez Google Fonts.

Oddělovač na úvodu kreslí obrys původního loga a potom ho vyplňuje maskou originálního
PNG. Při výměně loga spusťte také `node scripts/trace-brand-logo.mjs`, který z něj
znovu odvodí obrys v `src/assets/petr-pavlat-logo-outline.json`. V podporovaných
prohlížečích se oddělovače vykreslují a vyplňují podle posouvání stránky; při návratu
nahoru se efekt vrací. Slunce u Egypta se vyplní a rozzáří až na konci přechodu.
Bez podpory CSS scroll timelines se po příchodu do záběru jednou pomalu vykreslí.
Kontakty na úvodu jsou viditelné okamžitě. Aktivní sociální ikony se rozzáří jednu
sekundu po načtení, i po refreshi. Síla záře plynule třikrát zesílí a zeslábne
během dalších pěti sekund; potom zhasne. Ikony se nepohybují ani nezvětšují. Při zapnutém
omezení pohybu zůstává tato pomalá změna světla, šipka a oddělovače jsou statické.
Šipka u kontaktů se jemně stáhne dozadu směrem k textu a pružně vrátí do původního
tvaru s postupným dozníváním. Pruží třikrát během stejných pěti sekund jako záře
sociálních ikon; obě animace začínají po jedné sekundě. Konec u textu zůstává pevný
a hrot sleduje křivku.
Nativní SVG animace se při omezení pohybu vůbec nespouští a při změně této předvolby
se zastaví; celé SVG se neposouvá ani neroztahuje.

## Fotografie, URL a parametry nabídky

- Fotografie v editoru přesuňte za úchyt **Přesunout** myší nebo dotykem. Cílová
  pozice se zvýrazní; při tažení k okraji okna se stránka posouvá. Pořadí lze změnit
  také přímým výběrem pozice nebo šipkami. První fotografie je vždy titulní.
- U nových nabídek a konceptů včetně duplikátů se při přejmenování vytváří URL podle
  názvu. Shodné automatické URL dostanou při uložení číselnou příponu. Ruční změna
  URL vypne automatiku v otevřeném editoru; tlačítko **Vytvořit URL z názvu** ji
  zapne znovu. Přejmenování zveřejněné nabídky její URL automaticky nemění.
- V části **Parametry nemovitosti → Další parametry** upravíte původní příslušenství
  a výhody a přidáte až 20 vlastních řádků s názvem a hodnotou. Stávající vybavení
  se zachová. Vlastní parametry se ukládají do JSONB bez nové databázové migrace.
- Příslušenství a výhody (balkon, terasa apod.) se zobrazují také ve štítcích na
  přehledových kartách vedle dispozice a plochy. Karta ukáže prvních pět neprázdných,
  neopakujících se výhod v uloženém pořadí; detail zachová celý seznam. V Parametrech
  nemovitosti můžete vyplnit volitelný **Termín nastěhování**, například „Ihned“, „Od 1. 12. 2026“
  nebo „Dohodou“. Ukáže se na kartě i v detailu; prázdná hodnota se nezobrazuje.
- V **Parametrech nemovitosti** je také volitelné textové pole **Zálohy**, například
  „3 500 Kč měsíčně za služby a energie“. Vyplněná hodnota se zobrazí v parametrech
  veřejného detailu i náhledu nabídky; prázdná se vynechá. Ukládá se spolu s nabídkou
  do JSONB a nevyžaduje novou databázovou migraci.
- Poznámka k ceně se zobrazuje na přehledové kartě, pod popisem detailu i v tabulce
  parametrů. Detail má hlavní celou fotografii s ovládáním pod ní, na počítači
  přehled náhledů vedle fotografie a na mobilu vodorovný pás. **Zobrazit všechny**
  otevře mřížku všech snímků; vybranou fotografii lze zvětšit a vrátit se do přehledu.
  Galerie podporuje klávesové šipky, dotykové listování i omezení pohybu.

## Energie, YouTube a Google Mapy v nabídce

- V administraci v části Parametry vyberte barevnou třídu A–G. Volba
  „G – vypracováváme energetickou hodnotu“ uvádí G do dodání průkazu a návštěvníkům
  vysvětluje, že skutečnou hodnotu teprve připravujete. „Neuvedeno / nevztahuje se“
  zůstává samostatnou možností. Nové nabídky začínají ve stavu přípravy průkazu.
- Video nejprve nahrajte na YouTube jako veřejné nebo neveřejné, povolte jeho vkládání
  a do pole Video vložte obyčejný odkaz z tlačítka Sdílet (youtu.be nebo youtube.com/watch).
  Web ho automaticky převede na přehrávač youtube-nocookie.com. Soukromá videa nelze
  veřejně přehrát. Původní YouTube embed adresy i Vimeo /video/ zůstávají podporované.
  Pokud vyplníte také Matterport, zobrazí se oba přehrávače.
- Google Mapy vyhledají ulici, čtvrť a město z nabídky. Pro přesný bod vyplňte
  volitelnou zeměpisnou šířku i délku (Google Mapy → pravé tlačítko na místo → první
  číslo je šířka, druhé délka). Odkaz v editoru umožní polohu zkontrolovat před uložením.
  Vyplnění pouze jedné souřadnice se neuloží. Bez souřadnic je mapa označená jako
  lokalita podle adresy. Není potřeba API klíč.
- Vložené mapy a přehrávače se načítají pouze s marketingovým souhlasem. Samostatný
  odkaz „Otevřít v Google Mapách“ funguje i bez něj.
- V editoru nabídky v části **Okolí nemovitosti** ručně přidejte školu, školku,
  potraviny, poštu, lékaře, lékárnu, zastávku, park nebo další místo. Uveďte skutečný
  název, volitelnou adresu a ověřenou vzdálenost od domu v celých metrech. Vyberte
  pěší trasu nebo vzdušnou čáru; web způsob měření vždy vypíše. Odkaz v editoru
  otevře pěší trasu pro kontrolu nebo vyhledání místa v Google Mapách. Údaj z trasy
  přepište do vzdálenosti, například 1,2 km = 1200 m. Nevycházejte ze středu města.
  Místa lze řadit a odebírat, maximálně 20 u jedné nabídky. Náhled před uložením
  i veřejný detail je ukážou pod mapou. Prázdný seznam se nezobrazuje. Data se
  ukládají spolu s nemovitostí do PostgreSQL JSONB; není potřeba migrace ani API klíč.
- Potvrzení se sociálními odkazy se u všech formulářů objeví až po úspěšném zápisu
  poptávky. Facebook a LinkedIn mají zatím viditelné neaktivní zástupné ikony;
  skutečné odkazy doplňte v administraci v části Texty webu → Kontakty a odkazy.

## Úpravy textů majitelem

Po přihlášení otevřete **Texty webu**. Vyberte stránku nebo společnou sekci, případně
hledejte podle části původního textu. Upravíte nadpisy, odstavce, tlačítka, texty služeb,
průběh spolupráce, reference, poděkování formulářů i právní
stránky. Opakující se části jsou ve skupinách Společné sekce a Služby a reference.
Jednou upravený společný text se zobrazí na všech místech, kde se používá.

Skupiny **Identita**, **Kontakty a odkazy**, **Partneři** a **Reference** dovolují měnit
jméno, slogan, působnost, telefon, e-mail, WhatsApp, sociální profily, Google profil,
hodnocení a partnerské názvy. Výchozí hodnoty i jejich validace mají stále jedno
místo v `src/config/site.ts`. Prázdné kontakty se zobrazí jako zástupné údaje.

Klikněte na **Uložit texty** a obnovte veřejnou stránku. Změny se uloží do PostgreSQL
a načítají se při zobrazení webu; další sestavení ani nasazení kvůli přepsání textů
není potřeba. **Původní znění** u jednoho pole vrátí výchozí text po dalším uložení.
Při souběžné změně dvěma správci se starší uložení odmítne a rozepsané texty zůstanou
v editoru. Před odchodem nebo odhlášením administrace upozorní na neuložené změny.

Text rozdělený zalomením nebo zvýrazněním má samostatná pole. Editor přijímá prostý
text; zachovává rozložení, navigační URL, fotografie, pravidla formulářů a měření.
Blogové články přidáváte a upravujete v části Články, fotografie sekcí v části Fotky webu.
Přidávání nových stránek, změny uspořádání a programových funkcí patří do kódu.
Nemovitosti a jejich fotografie se dál upravují v části Nemovitosti.

Tato verze jednorázově vyžaduje migraci `website-content-v1` (`npm run db:migrate`;
na produkci `db:setup`, které doplní i oprávnění `realty_app`). Lokálně již byla
provedena. Při PGlite před migrací zastavte dev server. V produkci použijte běžný
aktualizační postup níže. Tabulka `website_content` je zahrnutá v SQL záloze i JSON
exportu administrace.

Pro vývojáře: texty váže `SiteText`, veřejná data dodává `src/data/website.ts` a
serverová validace je v `src/server/website.server.ts`. Katalog lze po přidání nových
veřejných textů aktualizovat příkazem `node scripts/extract-site-copy.mjs`. Výchozí
fráze určují stabilní klíče textů; při jejich změně převeďte také uložené přepisy.

## Vercel

Projekt má v `vercel.json` nastavený framework **TanStack Start**, instalaci `npm ci`
a build `npm run build`; používá Node.js 22. Produkční build nejprve provede idempotentní
aktualizaci schématu přes `DATABASE_URL` s migračním účtem. Běžící web nadále používá
výhradně omezené `APP_DATABASE_URL`; preview ani lokální buildy migraci nespouštějí.
Při chybě migrace se nové nasazení zastaví a běžící verze zůstane dostupná.
Stávající články a fotografie se dají číst i před aktualizací schématu.
Nitro automaticky rozpozná Vercel a
vytvoří `.vercel/output` se statickými soubory a serverovou funkcí. Mimo Vercel
zůstává výchozí build pro vlastní Node server (`.output/server/index.mjs`).
Ve Vercel projektu odstraňte případné vlastní nastavení Output Directory na `dist`
nebo `.output/public`; serverový výstup obsluhuje Nitro přes Build Output API.

Úspěšný build sám o sobě nepřipojí databázi ani fotografie. Pro běh veřejných
nabídek, formulářů a administrace nastavte `APP_DATABASE_URL` na externí PostgreSQL
s připraveným `database/schema.sql` a omezenou rolí `realty_app` (příprava pomocí
`npm run db:setup` s oddělenými migračními údaji v `DATABASE_URL`). Neon integrace
automaticky přidává vlastní `DATABASE_*` proměnné; web na Vercelu používá výhradně
samostatné `APP_DATABASE_URL` s rolí `realty_app`. Doplňte `APP_URL` na přesné HTTPS
URL nasazení a `VITE_SITE_URL` na kanonické URL. `LOCAL_DATABASE` v produkci
nezapínejte a lokální `.env` ani lokální databázi na Vercel nekopírujte.

Na Vercelu se WebP fotografie ukládají do PostgreSQL tabulky `media_files`, atomicky
spolu s metadaty v `media`. Účet `realty_app` dostane práva při automatické migraci.
Produkční sestavení ověří zápis, načtení a smazání testovací fotky přes tento účet
v jediné transakci; v knihovně nezůstane žádný testovací záznam.
Není potřeba zapisovat do souborového systému funkce ani nastavovat další službu.
Tabulka má cizí klíč s kaskádovým smazáním; privátní a zveřejněné fotky mají stejnou
kontrolu přístupu jako dříve. Větší zdrojové fotky se před odesláním zmenší na nejvýše
3,5 MB kvůli limitu přenosu Vercelu. Do databáze se ukládá výsledný WebP do 4 MB.
Fotografie jsou součástí databázové zálohy, JSON export obsahuje jen jejich metadata.
Na vlastním VPS zůstává výchozí `UPLOAD_DIR`; databázové ukládání lze zapnout přes
`MEDIA_STORAGE=database`. Staré fotografie z disku se dál čtou.

Dokumentace: [TanStack Start na Vercelu](https://vercel.com/docs/frameworks/full-stack/tanstack-start)
a [souborový systém Vercel Functions](https://vercel.com/docs/functions/runtimes#file-system-support).

## Nasazení na vlastní VPS

Doporučení: Hetzner Cloud v Německu, x86 VPS přibližně 4 vCPU / 8 GB RAM,
Ubuntu LTS, Docker Engine + Compose. Provoz bude na vaší doméně a účtu.
Samotná aplikace obvykle potřebuje méně, rezerva pomůže při sestavování a zpracování fotek.
Postup instalace Dockeru: https://docs.docker.com/engine/install/ubuntu/

1. Nahrajte projekt / naklonujte vlastní repozitář na server, např. do `/opt/pavlat-reality`.
2. Vytvořte kořenový `.env` podle `deploy/.env.example` (vývojový `.env` sem nepatří).
3. Nastavte vlastní `DOMAIN` bez protokolu a `ACME_EMAIL`. Vygenerujte dvě odlišná hesla
   příkazem `openssl rand -hex 32`: `POSTGRES_PASSWORD` a `APP_DB_PASSWORD`.
   Práva souboru nastavte na `chmod 600 .env`.
4. U registrátora připojte A záznam domény na IPv4 VPS. AAAA nastavujte pouze s funkční IPv6.
   Otevřete TCP 80/443 a UDP 443; SSH omezte na vlastní IP. PostgreSQL nemá veřejný port.
5. Doplňte dostupná brandová PNG a skutečné údaje v `src/config/site.ts`.
6. Spusťte:

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=80 migrate app caddy
```

Compose nejprve připraví databázi a omezený účet `realty_app`. Aplikace získá jen
aplikační oprávnění; migrační superuser není použitý webem. Caddy vystaví HTTPS certifikát
a přesměruje HTTP. Správný DNS a přístupné porty jsou nutné pro vydání certifikátu.
Produkční kanonické URL se sestaví z `DOMAIN` při buildu.

Vytvořte správce na serveru (proměnné nastavte pomocí skrytého Bash vstupu výše):

```sh
docker compose exec -e ADMIN_EMAIL -e ADMIN_NAME -e ADMIN_PASSWORD app npm run admin:create
unset ADMIN_PASSWORD
```

Přihlaste se na `https://vase-domena.cz/admin`, přidejte první koncept, nahrajte fotografii,
zveřejněte a ověřte detail. Odešlete testovací kontakt a zkontrolujte ho v poptávkách.
Serverová připravenost je na `/api/health`.

`APP_URL` je povolený původ pro zápisy. V produkci používá Compose přesně HTTPS doménu;
přístup přes IP nebo jinou doménu může web zobrazit, ale formuláře se neodešlou.
`TRUST_PROXY=1` používejte pouze za důvěryhodným proxy, které přepíše X-Forwarded-For.
Aplikační port ani databázový port v Compose nejsou vystavené internetu.

## Aktualizace a data

Před aktualizací vytvořte zálohu. Nový build vytvořte ještě za běhu staré aplikace:

```sh
sh deploy/backup.sh
docker compose build migrate
docker compose stop app
docker compose run --rm migrate
docker compose up -d --force-recreate app
```

Při neúspěšné migraci aplikaci znovu spusťte před řešením chyby. Před migrací zásadních
změn schématu zálohujte také předchozí obraz / release. Git historii nikdy nepřepisujte.
Změna `DOMAIN` vyžaduje nový build (SEO), aktualizaci DNS a restart Caddy.

- PostgreSQL: volume `database`.
- Fotografie: volume `uploads`.
- HTTPS certifikáty: `caddy_data`.
- `.env` obsahuje tajné údaje: nezapisovat do gitu ani neposílat veřejně.
- `docker compose down` data zachová; přepínač `-v` je odstraní.
- JSON export v administraci obsahuje nabídky a osobní údaje poptávek; není kompletní zálohou.
- Texty, kontakty a partneři mají výchozí hodnoty v kódu a uložené přepisy v databázi.
  Majitel je mění v Texty webu. Měřicí ID a produkční URL zůstávají v konfiguraci
  a jejich změna vyžaduje nové nasazení.

## Zálohování a obnova

```sh
sh deploy/backup.sh
```

Záloha v `backups/<UTC-datum>/` obsahuje PostgreSQL dump i soubory fotografií.
Skript krátce zastaví aplikaci, aby odpovídaly databáze i galerie. Na tento krátký
interval nebude web dostupný. Obnova vyžaduje explicitní zadání slova `RESTORE`:

```sh
sh deploy/restore.sh /opt/pavlat-reality/backups/20261009T020000Z
```

Obnova odhlásí administrátory; zachová případné novější soubory fotek, ale pouze
záznamy obnovené databáze budou dostupné přes web. Na novém VPS nejdřív připravte
Compose i databázové role a potom obnovte zálohu. `.env` uchovávejte odděleně a bezpečně.

Nastavte denní spouštění (např. cron ve 3:15), šifrovanou kopii mimo VPS a rotaci záloh.
Tyto služby nejsou aktivované, protože zatím neexistuje cílový server ani úložiště.
Doporučuji 7 denních a 4 týdenní kopie a pravidelně vyzkoušet obnovu na odděleném serveru.
Záloha pouze na stejném VPS nepomůže při ztrátě serveru.

## Převod původních poptávek

V dostupném exportu nejsou existující řádky cloudové databáze. Připravená aplikace
tedy žádná skutečná cloudová data nepřenesla. Původní tabulka `leads` a její základní
sloupce zůstávají kompatibilní; při pozdějším exportu lze data importovat do nové tabulky.
Převádějte data (např. CSV), ne celé Supabase schéma s jeho platformními rolemi.
Před importem vždy zálohujte obě databáze a zkontrolujte pořadí sloupců exportu.
Původní SQL v `drizzle/migrations` je archiv exportovaného projektu; používá se
výhradně nový `database/schema.sql` a `npm run db:migrate` / `db:setup`.

## Ověření

```sh
npm run typecheck
npm test
npm run build
```

Testy pokrývají přihlášení, Origin ochranu, RLS veřejného zápisu, omezený DB účet,
publikování a archivaci, souběžné úpravy, poptávky, zpracování fotografií a editor.
Build produkuje `.output/server/index.mjs`; na hostingu s Node.js ho spustíte
`npm start` (vyžaduje `DATABASE_URL`, `APP_URL` a trvalý `UPLOAD_DIR`).

Docker není na tomto počítači dostupný, proto Compose, HTTPS a obnovu záloh je potřeba
ověřit na cílovém VPS. Automatické testy používají PostgreSQL v PGlite; připojení
na skutečný produkční PostgreSQL zatím nebylo ověřené. V této relaci není dostupný
ovladatelný prohlížeč, takže vizuální kontrola v prohlížeči zůstává k provedení.

Před veřejným spuštěním zbývá vlastní doména/VPS, produkční účet správce
a doplnění identifikačních údajů a pracovních textů soukromí. E-mailové notifikace ani
export na Sreality nejsou napojené; poptávky jsou uložené a dostupné v administraci.
