Originály (PNG) jsou nyní ve src/assets vedle odpovídajících .asset.json:

- petr-pavlat-logo.png
- petr-pavlat-portrait.png
- petr-pavlat-full.png
- petr-pavlat-signature.png
- stelar-reality-logo.png
- egyptskoceska-reality-logo.png

Tato složka může obsahovat jejich náhrady se stejnými názvy; má přednost před src/assets.
Importy *.asset.json zůstávají zachované; Vite načítá lokální PNG a zahrne je do sestavení.
ASSET_ORIGIN a npm run assets:import slouží jen pro případnou obnovu z původního Lovable webu.
Chybějící média mají viditelný placeholder, nejsou nahrazena jiným člověkem či značkou.

Loga STELAR reality a Egyptsko-Česká Reality se zobrazují pod názvy partnerů na úvodu,
v sekci Egypt a v patičce. Pořadí partnerů v konfiguraci určuje přiřazení loga;
STELAR Advisory zatím dodané logo nemá.
