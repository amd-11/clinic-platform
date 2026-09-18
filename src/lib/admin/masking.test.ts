import { describe, expect, it } from "vitest";
import type { AdminAppointment } from "./queries";
import { maskForRole } from "./queries";

const appointment = (overrides: Partial<AdminAppointment> = {}): AdminAppointment => ({
  id: "11111111-1111-1111-1111-111111111111",
  serviceId: "therapy",
  doctorId: "mariam",
  startsAt: new Date("2026-09-21T06:00:00.000Z"),
  endsAt: new Date("2026-09-21T07:00:00.000Z"),
  patientName: "Анна Петросян",
  patientPhone: "+374 99 123 456",
  comment: "болит зуб",
  status: "pending",
  isDemo: false,
  createdAt: new Date("2026-09-20T06:00:00.000Z"),
  ...overrides,
});

describe("patient data masking", () => {
  it("shows everything to an administrator", () => {
    const [row] = maskForRole([appointment()], "admin");
    expect(row.patientName).toBe("Анна Петросян");
    expect(row.patientPhone).toBe("+374 99 123 456");
    expect(row.comment).toBe("болит зуб");
  });

  it("hides real patient details from demo visitors", () => {
    const [row] = maskForRole([appointment()], "demo");
    expect(row.patientName).toBe("Анна П.");
    expect(row.patientPhone).toBe("••• ••• 456");
    expect(row.comment).toBe("•••");
  });

  it("keeps generated demo appointments readable", () => {
    const [row] = maskForRole([appointment({ isDemo: true })], "demo");
    expect(row.patientName).toBe("Анна Петросян");
    expect(row.patientPhone).toBe("+374 99 123 456");
  });

  it("handles single-word names and missing comments", () => {
    const [row] = maskForRole([appointment({ patientName: "Анна", comment: null })], "demo");
    expect(row.patientName).toBe("Анна");
    expect(row.comment).toBeNull();
  });
});
