// Register public copy and add transparent React text bindings. Existing bindings are preserved.
import ts from "typescript";
import { readFile, writeFile, readdir } from "node:fs/promises";
const groups = {
  "FaqSection.tsx": "Časté dotazy",
  "index.tsx": "Úvodní stránka",
  "sluzby.tsx": "Služby",
  "egypt.tsx": "Egypt",
  "o-mne.tsx": "O mně",
  "reference.tsx": "Reference",
  "kontakt.tsx": "Kontakt",
  "odhad-ceny.tsx": "Odhad ceny",
  "nabidka.index.tsx": "Nabídka",
  "nabidka.$slug.tsx": "Detail nemovitosti",
  "cookies.tsx": "Cookies",
  "ochrana-osobnich-udaju.tsx": "Ochrana osobních údajů",
  "Sections.tsx": "Společné sekce",
  "EgyptSection.tsx": "Egypt",
  "LeadForm.tsx": "Formuláře",
  "ContactLinks.tsx": "Kontakt",
  "SiteFooter.tsx": "Patička",
  "SiteHeader.tsx": "Navigace",
  "CookieConsent.tsx": "Cookies",
  "GoogleRating.tsx": "Reference",
  "PropertyCarousel.tsx": "Nabídka",
  "PropertyCard.tsx": "Nabídka",
  "PropertyGallery.tsx": "Detail nemovitosti",
  "PropertyParameters.tsx": "Detail nemovitosti",
  "CollaborationStrip.tsx": "Partneři",
  "BrandLockup.tsx": "Identita",
  "ConsentEmbed.tsx": "Mapy a videa",
  "NearbyPlaces.tsx": "Okolí nemovitosti",
  "EnergyRating.tsx": "Energetická třída",
};
const files = [
  ...(await readdir("src/routes"))
    .filter((name) => groups[name])
    .map((name) => `src/routes/${name}`),
  ...(await readdir("src/components"))
    .filter((name) => groups[name])
    .map((name) => `src/components/${name}`),
  "src/routes/clanky/index.tsx",
  "src/routes/clanky/$slug.tsx",
];
const catalog = new Map();
function key(text) {
  let hash = 2166136261;
  for (const c of text.trim().replace(/\s+/g, " "))
    hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return `text_${(hash >>> 0).toString(16)}`;
}
function register(value, group) {
  const text = value.trim().replace(/\s+/g, " ");
  if (!/[a-zA-ZÀ-ž]{2}/.test(text) || /^[/#]|https?:|@|^[a-z-]+:[a-z-]+/.test(text)) return;
  const id = key(text);
  const old = catalog.get(id);
  if (old && old.default !== text) throw new Error(`Copy key collision: ${text}`);
  if (old) {
    if (!old.groups.includes(group)) old.groups.push(group);
  } else catalog.set(id, { key: id, default: text, groups: [group] });
}
function jsxText(raw) {
  const lines = raw.replace(/\r/g, "").split("\n");
  let last = lines.length - 1;
  while (last >= 0 && !lines[last].trim()) last--;
  return lines
    .map((line, i) => {
      let value = line.replace(/\t/g, " ");
      if (i !== 0) value = value.replace(/^ +/, "");
      if (i !== lines.length - 1) value = value.replace(/ +$/, "");
      return value && i < last ? `${value} ` : value;
    })
    .join("")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
for (const filename of files) {
  let source = await readFile(filename, "utf8");
  const ast = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const group = filename.includes("/clanky/") ? "Články" : groups[filename.split("/").at(-1)];
  const edits = [];
  let bindings = false;
  function inText(node) {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isJsxElement(p) && p.openingElement.tagName.getText(ast) === "SiteText") return true;
    }
    return false;
  }
  function visit(node) {
    if (
      ts.isJsxElement(node) &&
      node.openingElement.tagName.getText(ast) === "option" &&
      !node.openingElement.attributes.properties.some(
        (attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(ast) === "value",
      )
    ) {
      const text = node.children.find((child) => ts.isJsxText(child) && child.text.trim());
      const binding = node.children.find(
        (child) =>
          ts.isJsxElement(child) && child.openingElement.tagName.getText(ast) === "SiteText",
      );
      const expression = binding?.children.find((child) => ts.isJsxExpression(child))?.expression;
      const value = text
        ? jsxText(text.text)
        : expression && ts.isStringLiteral(expression)
          ? expression.text
          : undefined;
      if (value !== undefined)
        edits.push({
          start: node.openingElement.end - 1,
          end: node.openingElement.end - 1,
          value: ` value=${JSON.stringify(value)}`,
        });
    }
    if (
      ts.isPropertyAssignment(node) &&
      ["title", "description"].includes(node.name.getText(ast)) &&
      ts.isStringLiteral(node.initializer)
    ) {
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isCallExpression(parent) && parent.expression.getText(ast) === "pageHead") {
          register(node.initializer.text, `${group} – vyhledávače`);
          break;
        }
      }
    }
    if (ts.isJsxText(node)) {
      const text = jsxText(node.text);
      if (/[a-zA-ZÀ-ž]{2}/.test(text)) {
        register(text, group);
        if (!inText(node)) {
          edits.push({
            start: node.pos,
            end: node.end,
            value: `<SiteText>{${JSON.stringify(text)}}</SiteText>`,
          });
          bindings = true;
        }
      }
    }
    if (
      ts.isJsxExpression(node) &&
      node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent)) &&
      !inText(node)
    ) {
      // Property content already has its own editor. Keep those data values untouched.
      const expression = node.expression.getText(ast);
      const propertyData =
        /\bp\.|\bimg\.|\bim\./.test(expression) ||
        /Property(?:Gallery|Parameters)\.tsx$/.test(filename) ||
        (filename.endsWith("PropertyCard.tsx") && /^features?\b/.test(expression)) ||
        (filename.includes("/clanky/") && /\b(?:article|a|s)\.|^[pb]$/.test(expression)) ||
        (filename === "src/routes/index.tsx" && /\ba\./.test(expression)) ||
        (filename.endsWith("nabidka.$slug.tsx") && /^[dv]$/.test(expression));
      if (
        !propertyData &&
        !expression.includes("<SiteText") &&
        !ts.isNumericLiteral(node.expression) &&
        !ts.isArrayLiteralExpression(node.expression) &&
        !(ts.isBinaryExpression(node.expression) && ts.isNumericLiteral(node.expression.right))
      ) {
        edits.push({
          start: node.getStart(ast) + 1,
          end: node.getStart(ast) + 1,
          value: "<SiteText>{",
        });
        edits.push({ start: node.end - 1, end: node.end - 1, value: "}</SiteText>" });
        bindings = true;
      }
    }
    if (ts.isStringLiteral(node)) {
      // Gallery view names are state values, not owner-editable public labels.
      if (
        filename.endsWith("PropertyGallery.tsx") &&
        ((ts.isBinaryExpression(node.parent) && node.parent.left.getText(ast) === "dialogView") ||
          (ts.isCallExpression(node.parent) &&
            node.parent.expression.getText(ast) === "setDialogView"))
      )
        return;
      if (
        filename.endsWith("PropertyParameters.tsx") &&
        ts.isArrayLiteralExpression(node.parent) &&
        node.parent.elements[0] === node
      )
        register(node.text, group);
      if (
        ts.isJsxAttribute(node.parent) &&
        ["title", "eyebrow", "intro", "label", "submitLabel"].includes(
          node.parent.name.getText(ast),
        )
      )
        register(node.text, group);
      else {
        for (let p = node.parent; p; p = p.parent) {
          if (ts.isJsxAttribute(p)) break;
          if (ts.isJsxExpression(p) && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent))) {
            register(node.text, group);
            break;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start || b.end - a.end))
    source = source.slice(0, edit.start) + edit.value + source.slice(edit.end);
  if (bindings && !source.includes("import { SiteText }"))
    source = 'import { SiteText } from "@/components/SiteText";\n' + source;
  await writeFile(filename, source);
}
for (const [filename, group] of [
  ["src/data/faq.ts", "Časté dotazy"],
  ["src/data/content.ts", "Služby a reference"],
  ["src/config/site.ts", "Identita"],
  ["src/data/energy.ts", "Energetická třída"],
  ["src/data/nearby.ts", "Okolí nemovitosti"],
  ["src/data/types.ts", "Nabídka"],
]) {
  const source = await readFile(filename, "utf8");
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isStringLiteral(node)) {
      if (filename === "src/config/site.ts") {
        let declaration = node.parent;
        while (declaration && !ts.isVariableDeclaration(declaration))
          declaration = declaration.parent;
        if (!declaration || !["site", "nav"].includes(declaration.name.getText(ast))) return;
      }
      const parent = ts.isArrayLiteralExpression(node.parent) ? node.parent.parent : node.parent;
      if (
        ts.isPropertyAssignment(parent) &&
        ![
          "slug",
          "src",
          "poster",
          "url",
          "domain",
          "updatedAt",
          "publishedAt",
          "email",
          "phone",
          "whatsapp",
          "egyptPhone",
          "egyptWhatsapp",
        ].includes(parent.name.getText(ast))
      )
        register(node.text, group);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
await writeFile(
  "src/data/website-catalog.json",
  JSON.stringify([...catalog.values()], null, 2) + "\n",
);
console.log(`Registered ${catalog.size} editable public texts.`);
