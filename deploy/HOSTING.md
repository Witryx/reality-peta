# Volba hostingu (ověřeno 9. října 2026)

Pro tento projekt bych zvolil **Hetzner Cloud, Německo, CX33**, pokud je dostupný:
4 vCPU, 8 GB RAM a 80 GB NVMe. To poskytne rezervu pro SSR, PostgreSQL,
sestavování webu a zpracování fotografií.

[Oficiální parametry](https://www.hetzner.com/cloud/cost-optimized/),
[oficiální ceník po změně z června 2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/).
V tomto ceníku je CX33 za **8,49 EUR měsíčně bez DPH a IPv4**. Dostupnost i konečnou
cenu ověřte v konzoli při nákupu; nabídka levnějších sdílených serverů je omezená.

Pokud CX33 není dostupný, zvolil bych jiný x86 VPS v EU se 4 vCPU / 8 GB RAM;
aplikace používá přenosný Docker Compose a není svázaná s poskytovatelem.
Základní odhad samotného provozu je přibližně 10–20 EUR měsíčně včetně rezervy na
zálohy; doména, e-mail a údržba jsou samostatné položky. Jde o odhad, nikoli nabídku.

Nasazení: připravený Compose (Node.js + PostgreSQL + Caddy). Pro tento jeden web
bych začal přímo s Compose. Pokud budete spravovat více projektů a chcete grafické
nasazování, lze přidat [vlastní Coolify](https://coolify.io/docs/start-with-self-hosted).
Při něm použijte jeho proxy a upravte tuto konfiguraci, aby se nekřížily porty 80/443.

Doménu `.cz` můžete koupit u svého registrátora. Je-li původní doména již pod vaším
účtem, stačí změna DNS; není třeba ji přeregistrovat. Web automaticky neprovádí nákup.

Pro e-mail bych použil běžnou schránku u poskytovatele s vlastní doménou a později
jeho SMTP pro oznámení poptávek. Vlastní poštovní server bych pro tento projekt
neprovozoval kvůli správě doručitelnosti a reputace. SMTP v aktuální aplikaci ještě
není zapojené; všechny poptávky jsou dostupné v adminu.

K zálohám databáze a médií používejte přiložený skript a šifrovanou kopii mimo VPS.
Providerové zálohy serveru jsou další vrstva. Hetzner uvádí 7 slotů za 20 % ceny serveru:
[dokumentace fakturace](https://docs.hetzner.com/cloud/billing/faq/).

Vlastní provoz znamená pravidelné aktualizace systému a Docker obrazů, sledování
volného disku, dostupnosti a ověřování obnovy. Pokud správu VPS nechcete dělat sami,
zvažte placenou správu serveru; zdroje i data mohou stále zůstat na vašem účtu.
