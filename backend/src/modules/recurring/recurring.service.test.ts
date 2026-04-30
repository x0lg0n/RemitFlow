import { calculateNextRunAt } from "./recurring.service";

describe("calculateNextRunAt", () => {
  it("increments one day for daily cadence", () => {
    const start = new Date("2026-01-10T12:00:00.000Z");
    const next = calculateNextRunAt(start, "daily", "UTC");

    expect(next.toISOString()).toBe("2026-01-11T12:00:00.000Z");
  });

  it("increments one week for weekly cadence", () => {
    const start = new Date("2026-01-10T12:00:00.000Z");
    const next = calculateNextRunAt(start, "weekly", "UTC");

    expect(next.toISOString()).toBe("2026-01-17T12:00:00.000Z");
  });

  it("increments one month for monthly cadence", () => {
    const start = new Date("2026-01-10T12:00:00.000Z");
    const next = calculateNextRunAt(start, "monthly", "UTC");

    expect(next.toISOString()).toBe("2026-02-10T12:00:00.000Z");
  });
});
