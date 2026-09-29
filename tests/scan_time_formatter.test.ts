import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  formatScanTimestamp,
  formatScanTimestampMobile,
  getHoverScanDateTime,
  getRelativeTime,
} from "../src/utils/scanTimeFormatter.ts";

describe("Scan Time Formatter Tests", () => {
  const sampleIso = "2026-09-29T10:33:00.000Z";

  test("formatScanTimestamp formats as DD MMM YYYY hh:mm A", () => {
    const formatted = formatScanTimestamp(sampleIso);
    // Should contain day, month, year, and AM/PM
    assert.match(formatted, /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+2026/);
    assert.match(formatted, /(AM|PM)/);
  });

  test("formatScanTimestampMobile formats as DD MMM hh:mm A", () => {
    const mobileFormatted = formatScanTimestampMobile(sampleIso);
    assert.match(mobileFormatted, /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/);
    assert.match(mobileFormatted, /(AM|PM)/);
  });

  test("getHoverScanDateTime includes weekday, date, time with seconds, and relative age", () => {
    const now = Date.now();
    const hoverText = getHoverScanDateTime(now);
    assert.match(hoverText, /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/);
    assert.match(hoverText, /(AM|PM)/);
    assert.match(hoverText, /Just now/);
  });

  test("getRelativeTime handles seconds, minutes, hours, and days", () => {
    const now = Date.now();
    assert.equal(getRelativeTime(now), "Just now");
    assert.equal(getRelativeTime(now - 30 * 1000), "30 seconds ago");
    assert.equal(getRelativeTime(now - 5 * 60 * 1000), "5 minutes ago");
    assert.equal(getRelativeTime(now - 2 * 3600 * 1000), "2 hours ago");
    assert.equal(getRelativeTime(now - 24 * 3600 * 1000), "1 day ago");
    assert.equal(getRelativeTime(now - 3 * 24 * 3600 * 1000), "3 days ago");
  });

  test("Gracefully handles invalid dates", () => {
    assert.equal(formatScanTimestamp("invalid-date"), "");
    assert.equal(formatScanTimestampMobile("invalid-date"), "");
    assert.equal(getHoverScanDateTime("invalid-date"), "");
  });
});
