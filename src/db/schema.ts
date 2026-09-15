import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceFrom: integer("price_from").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const doctors = pgTable("doctors", {
  id: text("id").primaryKey(),
  experienceYears: integer("experience_years").notNull(),
  hue: integer("hue").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

/** Which services each doctor provides. */
export const doctorServices = pgTable(
  "doctor_services",
  {
    doctorId: text("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.serviceId] })],
);

/**
 * Weekly working hours. Times are minutes from midnight in clinic local time
 * (Asia/Yerevan), e.g. 9:30 → 570. Weekday: 0 = Sunday … 6 = Saturday.
 */
export const doctorSchedules = pgTable(
  "doctor_schedules",
  {
    doctorId: text("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(),
    startMinute: smallint("start_minute").notNull(),
    endMinute: smallint("end_minute").notNull(),
  },
  (table) => [primaryKey({ columns: [table.doctorId, table.weekday] })],
);

export const appointmentStatus = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
]);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id),
    doctorId: text("doctor_id")
      .notNull()
      .references(() => doctors.id),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    patientName: text("patient_name").notNull(),
    patientPhone: text("patient_phone").notNull(),
    comment: text("comment"),
    locale: text("locale").notNull(),
    status: appointmentStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("appointments_doctor_starts_idx").on(table.doctorId, table.startsAt)],
);

export type Service = typeof services.$inferSelect;
export type Doctor = typeof doctors.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
