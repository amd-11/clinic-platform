import { z } from "zod";
import { routing } from "@/i18n/routing";
import { isDateString, timeToMinutes } from "./time";

const id = z.string().trim().min(1).max(40).regex(/^[a-z0-9-]+$/);

export const slotsQuerySchema = z.object({
  service: id,
  doctor: id.nullable(),
  date: z.string().refine(isDateString),
});

/** Digits only, 8–15 long; allows +, spaces, dashes and brackets in the input. */
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((value) => /^[+\d\s()-]+$/.test(value), "phone")
  .transform((value) => value.replace(/[^\d+]/g, ""))
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "phone");

export const appointmentSchema = z.object({
  serviceId: id,
  doctorId: id.nullable(),
  date: z.string().refine(isDateString),
  time: z.string().refine((value) => timeToMinutes(value) !== null),
  name: z.string().trim().min(2, "name").max(80, "name"),
  phone,
  comment: z.string().trim().max(500).optional().transform((value) => value || null),
  consent: z.literal("on", { error: "consent" }),
  locale: z.enum(routing.locales),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;
