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
