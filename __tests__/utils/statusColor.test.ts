import { statusColor } from "@/utils/statusColor";

describe("statusColor", () => {
  it("returns emerald classes for Safe status", () => {
    const result = statusColor("Safe");
    expect(result).toContain("emerald");
  });

  it("returns red pulsing classes for Need Help with high intensity", () => {
    const result = statusColor("Need Help", "high");
    expect(result).toContain("red-100");
    expect(result).toContain("animate-pulse");
  });

  it("returns orange classes for Need Help with medium intensity", () => {
    const result = statusColor("Need Help", "medium");
    expect(result).toContain("orange");
  });

  it("returns amber classes for Need Help with low intensity", () => {
    const result = statusColor("Need Help", "low");
    expect(result).toContain("amber");
  });

  it("returns plain red classes for Need Help without intensity", () => {
    const result = statusColor("Need Help");
    expect(result).toContain("red");
    expect(result).not.toContain("animate-pulse");
  });

  it("returns plain red classes for Need Help with null intensity", () => {
    const result = statusColor("Need Help", null);
    expect(result).toContain("red");
    expect(result).not.toContain("animate-pulse");
  });

  it("returns slate/cyan classes for Unknown status", () => {
    const result = statusColor("Unknown");
    expect(result).toContain("slate");
    expect(result).toContain("cyan");
  });
});
