import { describe, expect, it } from "vitest";
import { appointmentSchema, slotsQuerySchema } from "./validation";

const valid = {
  serviceId: "therapy",
  doctorId: null,
  date: "2026-09-21",
  time: "10:30",
  name: "Анна Петросян",
  phone: "+374 99 123 456",
  comment: "  болит зуб  ",
  consent: "on",
  locale: "ru",
};

function parse(overrides: Record<string, unknown> = {}) {
  return appointmentSchema.safeParse({ ...valid, ...overrides });
}

describe("appointment validation", () => {
  it("accepts a complete form and normalises the data", () => {
    const result = parse();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+37499123456"); // spaces removed
      expect(result.data.comment).toBe("болит зуб"); // trimmed
    }
  });

  it("turns an empty comment into null", () => {
    const result = parse({ comment: "   " });
    expect(result.success && result.data.comment).toBeNull();
  });

  it("requires consent", () => {
    expect(parse({ consent: null }).success).toBe(false);
    expect(parse({ consent: "off" }).success).toBe(false);
  });

  it("rejects short names and bad phone numbers", () => {
    expect(parse({ name: "A" }).success).toBe(false);
    expect(parse({ phone: "123" }).success).toBe(false);
    expect(parse({ phone: "not a phone" }).success).toBe(false);
    expect(parse({ phone: "+374 99 123 456 789 000" }).success).toBe(false);
  });

  it("accepts local phone formats", () => {
    for (const phone of ["099123456", "+374 (99) 12-34-56", "37499123456"]) {
      expect(parse({ phone }).success).toBe(true);
    }
  });

  it("rejects invalid dates, times, ids and locales", () => {
    expect(parse({ date: "21.09.2026" }).success).toBe(false);
    expect(parse({ time: "25:00" }).success).toBe(false);
    expect(parse({ serviceId: "Therapy; drop table" }).success).toBe(false);
    expect(parse({ locale: "de" }).success).toBe(false);
  });

  it("reports which fields are wrong, so the form can highlight them", () => {
    const result = parse({ name: "A", phone: "1", consent: null });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = new Set(result.error.issues.map((issue) => issue.path[0]));
      expect(fields).toEqual(new Set(["name", "phone", "consent"]));
    }
  });
});

describe("slots query validation", () => {
  it("accepts a service with an optional doctor", () => {
    expect(slotsQuerySchema.safeParse({ service: "therapy", doctor: null, date: "2026-09-21" }).success).toBe(true);
    expect(slotsQuerySchema.safeParse({ service: "therapy", doctor: "anna", date: "2026-09-21" }).success).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(slotsQuerySchema.safeParse({ service: "", doctor: null, date: "2026-09-21" }).success).toBe(false);
    expect(slotsQuerySchema.safeParse({ service: "therapy", doctor: null, date: "tomorrow" }).success).toBe(false);
  });
});
