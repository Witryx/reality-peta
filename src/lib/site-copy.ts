export type WebsiteContent = { values: Record<string, string>; version: number };
export const copyKey = (text: string) => {
  let hash = 2166136261;
  for (const character of text.trim().replace(/\s+/g, " "))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `text_${(hash >>> 0).toString(16)}`;
};
export function resolveCopy(values: Record<string, string>, text: string): string {
  const replacement = values[copyKey(text)];
  if (replacement === undefined) return text;
  return (text.match(/^\s*/)?.[0] ?? "") + replacement + (text.match(/\s*$/)?.[0] ?? "");
}
