"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { appointments, doctorSchedules, doctors } from "@/db/schema";
import { SLOT_STEP_MINUTES } from "@/lib/booking/time";
import { regenerateDemoAppointments } from "./demo-data";
import { authorizeMutation, type ActionResult } from "./guard";
import { STATUSES } from "./filters";

function refreshAdmin() {
  revalidatePath("/[locale]/admin", "layout");
}

async function run(mutation: () => Promise<ActionResult | void>): Promise<ActionResult> {
  const allowed = await authorizeMutation();
  if (!allowed.ok) return allowed;
  try {
    const result = await mutation();
    refreshAdmin();
    return result ?? { ok: true };
  } catch (error) {
    console.error("[admin] mutation failed", error);
    return { ok: false, error: "server" };
  }
}

const uuid = z.uuid();

export async function setAppointmentStatus(id: string, status: string): Promise<ActionResult> {
  const parsed = z.object({ id: uuid, status: z.enum(STATUSES) }).safeParse({ id, status });
  if (!parsed.success) return { ok: false, error: "invalid" };

  return run(async () => {
    const db = await getDb();
    await db
      .update(appointments)
      .set({ status: parsed.data.status })
      .where(eq(appointments.id, parsed.data.id));
  });
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  if (!uuid.safeParse(id).success) return { ok: false, error: "invalid" };

  return run(async () => {
    const db = await getDb();
    await db.delete(appointments).where(eq(appointments.id, id));
  });
}

const scheduleSchema = z
  .array(
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        startMinute: z.number().int().min(6 * 60).max(22 * 60),
        endMinute: z.number().int().min(6 * 60).max(22 * 60),
      })
      .refine(
        (day) =>
          day.startMinute < day.endMinute &&
          day.startMinute % SLOT_STEP_MINUTES === 0 &&
          day.endMinute % SLOT_STEP_MINUTES === 0,
      ),
  )
  .max(7)
  .refine((days) => new Set(days.map((day) => day.weekday)).size === days.length);

export async function saveDoctorSchedule(
  doctorId: string,
  days: { weekday: number; startMinute: number; endMinute: number }[],
): Promise<ActionResult> {
  const parsed = scheduleSchema.safeParse(days);
  if (!parsed.success || !/^[a-z0-9-]+$/.test(doctorId)) return { ok: false, error: "invalid" };

  return run(async () => {
    const db = await getDb();
    await db.transaction(async (tx) => {
      await tx.delete(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));
      if (parsed.data.length > 0) {
        await tx.insert(doctorSchedules).values(parsed.data.map((day) => ({ doctorId, ...day })));
      }
    });
  });
}

export async function setDoctorActive(doctorId: string, active: boolean): Promise<ActionResult> {
  if (!/^[a-z0-9-]+$/.test(doctorId)) return { ok: false, error: "invalid" };

  return run(async () => {
    const db = await getDb();
    await db.update(doctors).set({ active }).where(eq(doctors.id, doctorId));
  });
}

// ——— Demo data ———————————————————————————————————————————————

/** Replaces demo appointments with a fresh realistic set (admin only). */
export async function generateDemoData(): Promise<ActionResult> {
  return run(async () => {
    await regenerateDemoAppointments(await getDb());
  });
}

export async function clearDemoData(): Promise<ActionResult> {
  return run(async () => {
    const db = await getDb();
    await db.delete(appointments).where(eq(appointments.isDemo, true));
  });
}
