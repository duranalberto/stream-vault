import { describe, expect, it } from "vitest";
import { formatDate, formatDuration } from "../lib/format";

describe("formatDuration", () => {
  it("formats sub-second and zero", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(999)).toBe("1s");
  });

  it("formats seconds only", () => {
    expect(formatDuration(45_000)).toBe("45s");
    expect(formatDuration(59_000)).toBe("59s");
  });

  it("rolls up whole seconds into minutes", () => {
    expect(formatDuration(60_000)).toBe("1m 0s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(357_800)).toBe("5m 58s");
    expect(formatDuration(241_316)).toBe("4m 1s");
  });

  it("formats hours, minutes and seconds", () => {
    expect(formatDuration(3_661_000)).toBe("1h 1m 1s");
  });

  it("floors fractional seconds", () => {
    expect(formatDuration(12_199)).toBe("12s");
  });
});

describe("formatDate", () => {
  it("formats a valid ISO date", () => {
    expect(formatDate("2026-09-26")).toMatch(/26/);
    expect(formatDate("2026-09-26")).toMatch(/2026/);
  });

  it("returns the raw value when unparseable", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
