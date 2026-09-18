"use server";

import { asc, inArray } from "drizzle-orm";
import { DatabaseUnavailableError, getDb } from "@/db";
import { appointments, doctors } from "@/db/schema";
import { notifyNewAppointment } from "@/lib/telegram/notify";
import { getAvailableSlots, getDoctorIdsForService, getService } from "./availability";
import { clinicDateTime, timeToMinutes } from "./time";
import { appointmentSchema } from "./validation";

type FieldName = "name" | "phone" | "consent";

export type BookingState =
  | { status: "idle" }
  | {
      status: "error";
      error: "validation" | "slotTaken" | "unavailable" | "server";
      fields?: FieldName[];
    }
  | {
      status: "success";
      appointment: {
        id: string;
        serviceId: string;
        doctorId: string;
        date: string;
        time: string;
      };
    };

const FIELD_NAMES: FieldName[] = ["name", "phone", "consent"];

export async function createAppointment(
  _previous: BookingState,
  formData: FormData,
): Promise<BookingState> {
  // Honeypot: real visitors never see or fill this field
  if (formData.get("website")) {
    return { status: "error", error: "server" };
  }

  const parsed = appointmentSchema.safeParse({
    serviceId: formData.get("serviceId"),
    doctorId: formData.get("doctorId") || null,
    date: formData.get("date"),
    time: formData.get("time"),
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    comment: formData.get("comment") ?? undefined,
    consent: formData.get("consent"),
    locale: formData.get("locale"),
  });

  if (!parsed.success) {
    const fields = [
      ...new Set(
        parsed.error.issues
          .map((issue) => issue.path[0])
          .filter((path): path is FieldName => FIELD_NAMES.includes(path as FieldName)),
      ),
    ];
    return { status: "error", error: "validation", fields };
  }

  const input = parsed.data;

  let db;
  try {
    db = await getDb();
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return { status: "error", error: "unavailable" };
    }
    console.error("[booking] database init failed", error);
    return { status: "error", error: "server" };
  }

  try {
    const created = await db.transaction(async (tx) => {
      const candidates = await getDoctorIdsForService(tx, input.serviceId, input.doctorId);
      if (candidates.length === 0) return null;

      // Lock the doctors' rows: concurrent bookings for the same doctor wait here,
      // so two patients can never get the same time.
      await tx
        .select({ id: doctors.id })
        .from(doctors)
        .where(inArray(doctors.id, candidates))
        .orderBy(asc(doctors.id))
        .for("update");

      const slots = await getAvailableSlots(tx, {
        serviceId: input.serviceId,
        doctorId: input.doctorId,
        date: input.date,
      });
      const slot = slots.find((item) => item.time === input.time);
      const service = await getService(tx, input.serviceId);
      const minutes = timeToMinutes(input.time);
      if (!slot || !service || minutes === null) return null;

      const doctorId = slot.doctorIds[0];
      const startsAt = clinicDateTime(input.date, minutes);
      const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

      const [row] = await tx
        .insert(appointments)
        .values({
          serviceId: service.id,
          doctorId,
          startsAt,
          endsAt,
          patientName: input.name,
          patientPhone: input.phone,
          comment: input.comment,
          locale: input.locale,
        })
        .returning({ id: appointments.id });

      return { id: row.id, doctorId, startsAt };
    });

    if (!created) {
      return { status: "error", error: "slotTaken" };
    }

    // Tell the clinic in Telegram; never blocks or fails the booking
    await notifyNewAppointment(db, {
      id: created.id,
      serviceId: input.serviceId,
      doctorId: created.doctorId,
      startsAt: created.startsAt,
      patientName: input.name,
      patientPhone: input.phone,
      comment: input.comment,
    });

    return {
      status: "success",
      appointment: {
        id: created.id,
        serviceId: input.serviceId,
        doctorId: created.doctorId,
        date: input.date,
        time: input.time,
      },
    };
  } catch (error) {
    console.error("[booking] failed to create appointment", error);
    return { status: "error", error: "server" };
  }
}
