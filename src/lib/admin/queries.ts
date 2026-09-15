import "server-only";
import { and, asc, count, desc, eq, gte, ilike, lt, ne, or, sql, type SQL } from "drizzle-orm";
import type { Database } from "@/db";
import {
  appointments,
  doctorSchedules,
  doctorServices,
  doctors,
  services,
  type AppointmentStatus,
} from "@/db/schema";
import { addDays, clinicDateTime, todayInClinic } from "@/lib/booking/time";
import { PAGE_SIZE, type RangeFilter } from "./filters";
import type { AdminRole } from "./session";

export type AdminAppointment = {
  id: string;
  serviceId: string;
  doctorId: string;
  startsAt: Date;
  endsAt: Date;
  patientName: string;
  patientPhone: string;
  comment: string | null;
  status: AppointmentStatus;
  isDemo: boolean;
  createdAt: Date;
};

const appointmentColumns = {
  id: appointments.id,
  serviceId: appointments.serviceId,
  doctorId: appointments.doctorId,
  startsAt: appointments.startsAt,
  endsAt: appointments.endsAt,
  patientName: appointments.patientName,
  patientPhone: appointments.patientPhone,
  comment: appointments.comment,
  status: appointments.status,
  isDemo: appointments.isDemo,
  createdAt: appointments.createdAt,
};

/**
 * Demo visitors see the real interface, but not real patients:
 * names become "Anna P.", phones keep only the last 3 digits.
 * Generated sample appointments are fictional, so they stay readable.
 */
export function maskForRole(rows: AdminAppointment[], role: AdminRole): AdminAppointment[] {
  if (role === "admin") return rows;
  return rows.map((row) => {
    if (row.isDemo) return row;
    const [first = "", last = ""] = row.patientName.split(" ");
    return {
      ...row,
      patientName: last ? `${first} ${last.charAt(0)}.` : first,
      patientPhone: `••• ••• ${row.patientPhone.replace(/\D/g, "").slice(-3)}`,
      comment: row.comment ? "•••" : null,
    };
  });
}

function dayBounds(date: string) {
  return { start: clinicDateTime(date, 0), end: clinicDateTime(date, 24 * 60) };
}

export async function getDashboardData(db: Database, now = new Date()) {
  const today = todayInClinic(now);
  const { start: todayStart, end: todayEnd } = dayBounds(today);
  const weekEnd = clinicDateTime(addDays(today, 7), 0);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const active = ne(appointments.status, "cancelled");

  const [[todayCount], [pendingCount], [weekCount], [newCount], todayList, pendingList, load] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(appointments)
        .where(and(active, gte(appointments.startsAt, todayStart), lt(appointments.startsAt, todayEnd))),
      db
        .select({ value: count() })
        .from(appointments)
        .where(and(eq(appointments.status, "pending"), gte(appointments.startsAt, now))),
      db
        .select({ value: count() })
        .from(appointments)
        .where(and(active, gte(appointments.startsAt, todayStart), lt(appointments.startsAt, weekEnd))),
      db
        .select({ value: count() })
        .from(appointments)
        .where(gte(appointments.createdAt, monthAgo)),
      db
        .select(appointmentColumns)
        .from(appointments)
        .where(and(active, gte(appointments.startsAt, todayStart), lt(appointments.startsAt, todayEnd)))
        .orderBy(asc(appointments.startsAt)),
      db
        .select(appointmentColumns)
        .from(appointments)
        .where(and(eq(appointments.status, "pending"), gte(appointments.startsAt, now)))
        .orderBy(asc(appointments.startsAt))
        .limit(6),
      db
        .select({ doctorId: doctors.id, value: count(appointments.id) })
        .from(doctors)
        .leftJoin(
          appointments,
          and(
            eq(appointments.doctorId, doctors.id),
            active,
            gte(appointments.startsAt, todayStart),
            lt(appointments.startsAt, weekEnd),
          ),
        )
        .groupBy(doctors.id, doctors.sortOrder)
        .orderBy(asc(doctors.sortOrder)),
    ]);

  return {
    stats: {
      today: todayCount.value,
      pending: pendingCount.value,
      week: weekCount.value,
      newLast30Days: newCount.value,
    },
    todayList,
    pendingList,
    doctorLoad: load,
  };
}

export type AppointmentFilters = {
  status: AppointmentStatus | null;
  range: RangeFilter;
  doctorId: string | null;
  query: string;
  page: number;
};

export async function listAppointments(db: Database, filters: AppointmentFilters, now = new Date()) {
  const today = todayInClinic(now);
  const { start: todayStart, end: todayEnd } = dayBounds(today);
  const conditions: (SQL | undefined)[] = [];

  switch (filters.range) {
    case "today":
      conditions.push(gte(appointments.startsAt, todayStart), lt(appointments.startsAt, todayEnd));
      break;
    case "week":
      conditions.push(
        gte(appointments.startsAt, todayStart),
        lt(appointments.startsAt, clinicDateTime(addDays(today, 7), 0)),
      );
      break;
    case "upcoming":
      conditions.push(gte(appointments.startsAt, todayStart));
      break;
    case "past":
      conditions.push(lt(appointments.startsAt, now));
      break;
  }

  if (filters.status) conditions.push(eq(appointments.status, filters.status));
  if (filters.doctorId) conditions.push(eq(appointments.doctorId, filters.doctorId));

  const query = filters.query.trim();
  if (query) {
    const digits = query.replace(/\D/g, "");
    conditions.push(
      or(
        ilike(appointments.patientName, `%${query.replace(/[%_]/g, "")}%`),
        digits.length >= 3
          ? sql`regexp_replace(${appointments.patientPhone}, '\\D', '', 'g') like ${`%${digits}%`}`
          : undefined,
      ),
    );
  }

  const where = and(...conditions);
  const chronological = filters.range !== "past" && filters.range !== "all";

  const [rows, [total]] = await Promise.all([
    db
      .select(appointmentColumns)
      .from(appointments)
      .where(where)
      .orderBy(chronological ? asc(appointments.startsAt) : desc(appointments.startsAt))
      .limit(PAGE_SIZE)
      .offset((filters.page - 1) * PAGE_SIZE),
    db.select({ value: count() }).from(appointments).where(where),
  ]);

  return { rows, total: total.value };
}

export async function getScheduleEditorData(db: Database) {
  const [doctorRows, schedules, links, [demo]] = await Promise.all([
    db.select().from(doctors).orderBy(asc(doctors.sortOrder)),
    db.select().from(doctorSchedules),
    db
      .select({ doctorId: doctorServices.doctorId, serviceId: doctorServices.serviceId })
      .from(doctorServices)
      .innerJoin(services, eq(services.id, doctorServices.serviceId))
      .orderBy(asc(services.sortOrder)),
    db.select({ value: count() }).from(appointments).where(eq(appointments.isDemo, true)),
  ]);

  return {
    doctors: doctorRows.map((doctor) => ({
      id: doctor.id,
      active: doctor.active,
      hue: doctor.hue,
      serviceIds: links.filter((link) => link.doctorId === doctor.id).map((link) => link.serviceId),
      schedule: schedules
        .filter((row) => row.doctorId === doctor.id)
        .map(({ weekday, startMinute, endMinute }) => ({ weekday, startMinute, endMinute })),
    })),
    demoAppointments: demo.value,
  };
}
