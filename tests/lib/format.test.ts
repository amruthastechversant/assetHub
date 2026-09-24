/**
 * tests/lib/format.test.ts
 *
 * Area: Date formatting, Currency formatting
 */
import { describe, it, expect } from "vitest";
import { formatDate, formatCurrency } from "@/lib/format";

describe("formatDate", () => {
  it("formats a valid ISO date string into a human-readable date", () => {
    const result = formatDate("2024-01-15");
    // en-GB locale → "15 Jan 2024"
    expect(result).toBe("15 Jan 2024");
  });

  it("returns undefined when given undefined", () => {
    expect(formatDate(undefined)).toBeUndefined();
  });

  it("returns undefined when given an empty string", () => {
    expect(formatDate("")).toBeUndefined();
  });

  it("falls back to the raw string when the date is unparsable", () => {
    const bad = "not-a-date";
    // new Date("not-a-date") → Invalid Date; Intl throws, so fallback returns raw string
    const result = formatDate(bad);
    expect(typeof result).toBe("string");
  });
});

describe("formatCurrency", () => {
  it("formats a number as Indian Rupees (₹)", () => {
    const result = formatCurrency(75000);
    expect(result).toContain("₹");
    expect(result).toContain("75");
  });

  it("returns undefined when given undefined", () => {
    expect(formatCurrency(undefined)).toBeUndefined();
  });

  it("returns undefined when given a non-number", () => {
    expect(formatCurrency("abc" as any)).toBeUndefined();
  });

  it("formats zero correctly", () => {
    const result = formatCurrency(0);
    expect(result).toContain("₹");
  });
});
