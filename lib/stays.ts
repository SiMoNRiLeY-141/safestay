import { createHash, randomBytes } from "crypto";

export const HELP_OPTIONS = {
  fire: { label: "Fire / Smoke", intensity: "high" },
  gas: { label: "Gas Leak", intensity: "high" },
  threat: { label: "Active Threat", intensity: "high" },
  medical: { label: "Medical / First Aid", intensity: "medium" },
  trapped: { label: "Trapped", intensity: "medium" },
  meds: { label: "Critical Medicines", intensity: "medium" },
  food: { label: "Water + Food", intensity: "low" },
  flood: { label: "Water Leakage", intensity: "low" },
  electrical: { label: "Electrical Faults", intensity: "low" },
  other: { label: "Other Help", intensity: "low" },
} as const;

export type HelpOption = keyof typeof HELP_OPTIONS;

export function newStayToken() {
  return randomBytes(32).toString("base64url");
}

export function hashStayToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isHelpOption(value: unknown): value is HelpOption {
  return typeof value === "string" && value in HELP_OPTIONS;
}
