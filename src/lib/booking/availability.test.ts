import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/db";
import type { BookingState } from "./actions";
import type { getAvailableSlots as GetAvailableSlots } from "./availability";
import { addDays, clinicDateTime, todayInClinic, weekdayOf } from "./time";

/**
 * Integration tests against a real PostgreSQL (embedded PGlite), so the SQL,
 * the transaction and the locking behaviour are all covered.
 */

let db: Database;
let getAvailableSlots: typeof GetAvailableSlots;
let createAppointment: (previous: BookingState, formData: FormData) => Promise<BookingState>;
let schema: typeof import("@/db/schema");

/** The next Monday — every doctor in the seed works on weekdays. */
function nextMonday() {
  let date = addDays(todayInClinic(), 1);
  while (weekdayOf(date) !== 1) date = addDays(date, 1);
  return date;
}

let monday: string;

beforeAll(async () => {
  process.env.PGLITE_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "pglite-test-"));
  delete process.env.DATABASE_URL;
  delete process.env.TELEGRAM_BOT_TOKEN;

  const dbModule = await import("@/db");
  schema = await import("@/db/schema");
  ({ getAvailableSlots } = await import("./availability"));
  ({ createAppointment } = await import("./actions"));

  db = await dbModule.getDb();
  monday = nextMonday();
});

function bookingForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const values: Record<string, string> = {
    serviceId: "therapy",
    doctorId: "mariam",
    date: monday,
    time: "09:00",
    name: "Тест Пациент",
    phone: "+374 99 123 456",
    consent: "on",
    locale: "ru",
    ...overrides,
  };
  for (const [key, value] of Object.entries(values)) form.set(key, value);
  return form;
}

describe("available slots", () => {
  it("returns slots inside the doctor's working hours", async () => {
    // Mariam works Mon–Fri 09:00–15:00, therapy takes 60 minutes
    const slots = await getAvailableSlots(db, { serviceId: "therapy", doctorId: "mariam", date: monday });
    expect(slots[0].time).toBe("09:00");
    expect(slots.at(-1)?.time).toBe("14:00");
    expect(slots.every((slot) => slot.doctorIds.includes("mariam"))).toBe(true);
  });

  it("returns nothing on a day off", async () => {
    const sunday = addDays(monday, -1);
    expect(await getAvailableSlots(db, { serviceId: "therapy", doctorId: null, date: sunday })).toEqual([]);
  });

  it("returns nothing for a doctor who does not provide the service", async () => {
    // Implants are only done by David
    expect(await getAvailableSlots(db, { serviceId: "implants", doctorId: "mariam", date: monday })).toEqual([]);
  });

  it("merges the free times of every suitable doctor when no doctor is chosen", async () => {
    const slots = await getAvailableSlots(db, { serviceId: "therapy", doctorId: null, date: monday });
    const doctors = new Set(slots.flatMap((slot) => slot.doctorIds));
    expect(doctors.size).toBeGreaterThan(1);
    // David works until 20:00, so the last slot is later than Mariam's
    expect(slots.at(-1)?.time).toBe("19:00");
  });

  it("ignores days outside the booking window", async () => {
    const far = addDays(todayInClinic(), 60);
    expect(await getAvailableSlots(db, { serviceId: "therapy", doctorId: null, date: far })).toEqual([]);
  });

  it("hides slots that start too soon", async () => {
    const today = todayInClinic();
    if (weekdayOf(today) === 0) return; // clinic closed, nothing to assert
    const slots = await getAvailableSlots(db, { serviceId: "therapy", doctorId: null, date: today });
    const earliest = Date.now() + 59 * 60_000;
    for (const slot of slots) {
      const [hours, minutes] = slot.time.split(":").map(Number);
      expect(clinicDateTime(today, hours * 60 + minutes).getTime()).toBeGreaterThanOrEqual(earliest);
    }
  });
});

describe("creating an appointment", () => {
  it("saves a valid booking", async () => {
    const result = await createAppointment({ status: "idle" }, bookingForm({ time: "10:00" }));
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.appointment.doctorId).toBe("mariam");
      expect(result.appointment.time).toBe("10:00");
    }
  });

  it("blocks the whole duration, not just the start time", async () => {
    // The 10:00 therapy booking above runs until 11:00
    const slots = await getAvailableSlots(db, { serviceId: "therapy", doctorId: "mariam", date: monday });
    const times = slots.map((slot) => slot.time);
    expect(times).not.toContain("10:00");
    expect(times).not.toContain("10:30");
    expect(times).toContain("11:00");
  });

  it("lets only one of three simultaneous bookings win", async () => {
    const results = await Promise.all([
      createAppointment({ status: "idle" }, bookingForm({ time: "12:00", name: "Пациент А" })),
      createAppointment({ status: "idle" }, bookingForm({ time: "12:00", name: "Пациент Б" })),
      createAppointment({ status: "idle" }, bookingForm({ time: "12:00", name: "Пациент В" })),
    ]);
    const statuses = results.map((result) =>
      result.status === "error" ? result.error : result.status,
    );
    expect(statuses.filter((status) => status === "success")).toHaveLength(1);
    expect(statuses.filter((status) => status === "slotTaken")).toHaveLength(2);
  });

  it("picks a free doctor when the patient chose 'any'", async () => {
    const result = await createAppointment(
      { status: "idle" },
      bookingForm({ doctorId: "", time: "12:00", name: "Любой врач" }),
    );
    expect(result.status).toBe("success");
    if (result.status === "success") {
      // Mariam is busy at 12:00 from the test above
      expect(result.appointment.doctorId).not.toBe("mariam");
    }
  });

  it("rejects a time outside working hours", async () => {
    const result = await createAppointment({ status: "idle" }, bookingForm({ time: "07:00" }));
    expect(result.status).toBe("error");
    if (result.status === "error") expect(result.error).toBe("slotTaken");
  });

  it("rejects invalid form data and names the bad fields", async () => {
    const result = await createAppointment({ status: "idle" }, bookingForm({ name: "A", phone: "1", consent: "" }));
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.error).toBe("validation");
      expect(new Set(result.fields)).toEqual(new Set(["name", "phone", "consent"]));
    }
  });

  it("ignores submissions that fill the honeypot field", async () => {
    const form = bookingForm({ time: "13:00" });
    form.set("website", "http://spam.example");
    expect((await createAppointment({ status: "idle" }, form)).status).toBe("error");
  });

  it("frees the slot again once an appointment is cancelled", async () => {
    const [appointment] = await db.select().from(schema.appointments).limit(1);
    const { eq } = await import("drizzle-orm");
    await db
      .update(schema.appointments)
      .set({ status: "cancelled" })
      .where(eq(schema.appointments.id, appointment.id));

    const date = appointment.startsAt.toISOString().slice(0, 10);
    const slots = await getAvailableSlots(db, {
      serviceId: appointment.serviceId,
      doctorId: appointment.doctorId,
      date,
      now: new Date(appointment.startsAt.getTime() - 3 * 60 * 60_000),
    });
    const time = `${String(appointment.startsAt.getUTCHours() + 4).padStart(2, "0")}:${String(appointment.startsAt.getUTCMinutes()).padStart(2, "0")}`;
    expect(slots.map((slot) => slot.time)).toContain(time);
  });
});
