export const energyClasses = ["A", "B", "C", "D", "E", "F", "G"] as const;
export const energyLabels: Record<string, string> = {
  A: "Mimořádně úsporná",
  B: "Velmi úsporná",
  C: "Úsporná",
  D: "Méně úsporná",
  E: "Nehospodárná",
  F: "Velmi nehospodárná",
  G: "Mimořádně nehospodárná",
};
export const ENERGY_PENDING = "pending";
/** Small buildings (under 50 m²) need no energy certificate (zákon 406/2000 Sb., § 7a). */
export const ENERGY_EXEMPT = "exempt";
