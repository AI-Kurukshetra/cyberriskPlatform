import { describe, it, expect } from "vitest";
import { formatCurrency, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Northwind Consulting")).toBe("northwind-consulting");
  });

  it("strips leading trailing hyphens", () => {
    expect(slugify("  ---foo---  ")).toBe("foo");
  });

  it("returns empty for symbols only", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(25000)).toMatch(/25/);
  });
});
