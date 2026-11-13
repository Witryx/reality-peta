/**
 * Apply the owner's preferred form of address (capitalised polite "Vy" in all
 * its forms) without changing stored copy or its keys.
 */
const FORMAL_ADDRESS =
  /(?<![\p{L}\p{N}_])(v)(y|ám|ámi|ás|áš|aše|ašeho|ašemu|ašem|aším|aši|aší|ašich|ašim|ašima|ašimi)(?![\p{L}\p{N}_])/gu;

export function formalAddress(text: string): string {
  return text.replace(FORMAL_ADDRESS, (_match, _v: string, rest: string) => `V${rest}`);
}
