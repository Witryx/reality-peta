/** Apply the owner's preferred form of address without changing stored copy or its keys. */
export function formalAddress(text: string): string {
  return text.replace(/(?<![\p{L}\p{N}_])vám(?![\p{L}\p{N}_])/gu, "Vám");
}
