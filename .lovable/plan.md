# Srozumitelné informace o cookies

- Zachovat vzhled a branding banneru, použít nový stručný text a stejně výrazné volby „Povolit vše“, „Jen nezbytné“ a dostupné „Nastavení“.
- Přidat „Více o cookies“: samostatný přístupný informační dialog s krátkými českými sekcemi, vysvětlením kategorií, podmíněného využití externích nástrojů a odkazem na existující zásady ochrany osobních údajů. Zavření nezmění souhlas.
- Doplnit vysvětlení u kategorií nastavení; nezbytné zůstanou zapnuté a nepřepínatelné, volitelné bez předchozího souhlasu vypnuté.
- Ověřit mobil, tablet a počítač, zavření informací bez souhlasu, odmítnutí/povolení a změnu preference z patičky; web nepublikovat.

## Technické provedení
- Použít existující dialog a tlačítka, bez nového balíčku a bez změn formulářů či databáze.
- Zvýšit CONSENT_VERSION z 2 na 3 kvůli změně schváleného textu: návštěvníci s předchozí verzí dostanou novou volbu.
- Zachovat centrální ukládání a události souhlasu; ověřit blokování měřicích skriptů. Reálná měřicí ID jsou prázdná, proto kontrola skutečných integrací bude omezená na konfiguraci a testovací ověření blokování.