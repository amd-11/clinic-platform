import { and, asc, eq, gt, inArray, lt, ne } from "drizzle-orm";
import type { Database } from "@/db";
import { appointments, doctorSchedules, doctorServices, doctors, services } from "@/db/schema";
import {
  MIN_LEAD_MINUTES,
  SLOT_STEP_MINUTES,
  bookingDateRange,
  clinicDateTime,
  minutesToTime,
  weekdayOf,
} from "./time";

/** Works with the database itself or inside a transaction. */
type Executor = Pick<Database, "select">;

export type Slot = {
  time: string; // "HH:MM" clinic local time
  doctorIds: string[]; // doctors free at this time, in display order
};

type SlotQuery = {
  serviceId: string;
  doctorId: string | null; // null = any doctor who provides the service
  date: string; // "YYYY-MM-DD", already validated
  now?: Date;
};

export async function getService(db: Executor, serviceId: string) {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.active, true)))
    .limit(1);
  return service ?? null;
}

/** Active doctors who provide the service (optionally narrowed to one doctor). */
export async function getDoctorIdsForService(
  db: Executor,
  serviceId: string,
  doctorId: string | null,
) {
  const rows = await db
    .select({ id: doctors.id })
    .from(doctorServices)
    .innerJoin(doctors, eq(doctors.id, doctorServices.doctorId))
    .where(
      and(
        eq(doctorServices.serviceId, serviceId),
        eq(doctors.active, true),
        doctorId ? eq(doctors.id, doctorId) : undefined,
      ),
    )
    .orderBy(asc(doctors.sortOrder));
  return rows.map((row) => row.id);
}

export async function getAvailableSlots(db: Executor, query: SlotQuery): Promise<Slot[]> {
  const now = query.now ?? new Date();
  const { first, last } = bookingDateRange(now);
  if (query.date < first || query.date > last) return [];

  const service = await getService(db, query.serviceId);
  if (!service) return [];

  const doctorIds = await getDoctorIdsForService(db, service.id, query.doctorId);
  if (doctorIds.length === 0) return [];

  const weekday = weekdayOf(query.date);
  const schedules = await db
    .select()
    .from(doctorSchedules)
    .where(and(inArray(doctorSchedules.doctorId, doctorIds), eq(doctorSchedules.weekday, weekday)));
  if (schedules.length === 0) return [];

  const dayStart = clinicDateTime(query.date, 0);
  const dayEnd = clinicDateTime(query.date, 24 * 60);
  const booked = await db
    .select({
      doctorId: appointments.doctorId,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
    })
    .from(appointments)
    .where(
      and(
        inArray(appointments.doctorId, doctorIds),
        ne(appointments.status, "cancelled"),
        lt(appointments.startsAt, dayEnd),
        gt(appointments.endsAt, dayStart),
      ),
    );

  const earliestStart = now.getTime() + MIN_LEAD_MINUTES * 60_000;
  const duration = service.durationMinutes * 60_000;
  const slots = new Map<number, string[]>();

  for (const doctorId of doctorIds) {
    const schedule = schedules.find((item) => item.doctorId === doctorId);
    if (!schedule) continue;
    const busy = booked.filter((item) => item.doctorId === doctorId);

    for (
      let minute = schedule.startMinute;
      minute + service.durationMinutes <= schedule.endMinute;
      minute += SLOT_STEP_MINUTES
    ) {
      const start = clinicDateTime(query.date, minute).getTime();
      if (start < earliestStart) continue;
      const end = start + duration;
      const overlaps = busy.some(
        (item) => item.startsAt.getTime() < end && item.endsAt.getTime() > start,
      );
      if (overlaps) continue;

      const free = slots.get(minute) ?? [];
      free.push(doctorId);
      slots.set(minute, free);
    }
  }

  return [...slots.entries()]
    .sort(([a], [b]) => a - b)
    .map(([minute, ids]) => ({ time: minutesToTime(minute), doctorIds: ids }));
}
