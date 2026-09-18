import { describe, expect, it } from "vitest";
import {
  addDays,
  bookingDateRange,
  clinicDateTime,
  isDateString,
  minutesToTime,
  timeToMinutes,
  todayInClinic,
  weekdayOf,
} from "./time";

describe("clinic time helpers", () => {
  it("builds an instant from a clinic-local date and minutes (Yerevan is UTC+4)", () => {
    // 09:30 in Yerevan is 05:30 UTC
    expect(clinicDateTime("2026-09-21", 9 * 60 + 30).toISOString()).toBe("2026-09-21T05:30:00.000Z");
    expect(clinicDateTime("2026-09-21", 0).toISOString()).toBe("2026-09-20T20:00:00.000Z");
  });

  it("knows the weekday of a clinic date", () => {
    expect(weekdayOf("2026-09-21")).toBe(1); // Monday
    expect(weekdayOf("2026-09-20")).toBe(0); // Sunday
    expect(weekdayOf("2026-09-19")).toBe(6); // Saturday
  });

  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-09-21", 21)).toBe("2026-10-12");
  });

  it("reports the clinic date, not the server date, around midnight", () => {
    // 23:00 UTC is already the next day in Yerevan (03:00)
    expect(todayInClinic(new Date("2026-09-21T23:00:00.000Z"))).toBe("2026-09-22");
    expect(todayInClinic(new Date("2026-09-21T19:00:00.000Z"))).toBe("2026-09-21");
  });

  it("validates date strings", () => {
    expect(isDateString("2026-09-21")).toBe(true);
    expect(isDateString("2026-02-30")).toBe(false); // rolls over, so rejected
    expect(isDateString("2026-9-21")).toBe(false);
    expect(isDateString("not-a-date")).toBe(false);
  });

  it("converts between minutes and HH:MM", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(9 * 60 + 5)).toBe("09:05");
    expect(minutesToTime(20 * 60)).toBe("20:00");
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("24:00")).toBeNull();
    expect(timeToMinutes("9:30")).toBeNull();
    expect(timeToMinutes("garbage")).toBeNull();
  });

  it("offers a three-week booking window starting today", () => {
    const { first, last } = bookingDateRange(new Date("2026-09-21T10:00:00.000Z"));
    expect(first).toBe("2026-09-21");
    expect(last).toBe("2026-10-11");
  });
});
