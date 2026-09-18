import type { Locale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import type { Database } from "@/db";
import type { AppointmentStatus } from "@/db/schema";
import { CLINIC_TIME_ZONE } from "@/lib/booking/time";
import { routing } from "@/i18n/routing";
import type { doctors, services } from "@/lib/site-data";
import {
  escapeHtml,
  isTelegramConfigured,
  sendMessage,
  type InlineKeyboard,
} from "./client";
import { getNotificationChatId } from "./settings";

type ServiceKey = (typeof services)[number]["id"];
type DoctorKey = (typeof doctors)[number]["id"];

export type NotifiableAppointment = {
  id: string;
  serviceId: string;
  doctorId: string;
  startsAt: Date;
  patientName: string;
  patientPhone: string;
  comment: string | null;
};

/** Language of the bot's messages — clinic staff, not patients. */
export function botLocale(): Locale {
  const value = process.env.TELEGRAM_LOCALE;
  return routing.locales.includes(value as Locale) ? (value as Locale) : "ru";
}

export const CALLBACK_PREFIX = "s";

export async function buildAppointmentMessage(
  appointment: NotifiableAppointment,
  status: AppointmentStatus | null,
) {
  const locale = botLocale();
  const [t, tServices, tDoctors, format] = await Promise.all([
    getTranslations({ locale, namespace: "telegram" }),
    getTranslations({ locale, namespace: "services.items" }),
    getTranslations({ locale, namespace: "doctors.items" }),
    getFormatter({ locale }),
  ]);

  const when = format.dateTime(appointment.startsAt, {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: CLINIC_TIME_ZONE,
  });

  const lines = [
    status === "confirmed"
      ? t("statusConfirmed")
      : status === "cancelled"
        ? t("statusCancelled")
        : t("newAppointment"),
    "",
    `👤 <b>${escapeHtml(appointment.patientName)}</b>`,
    `📞 ${escapeHtml(appointment.patientPhone)}`,
    `🦷 ${escapeHtml(tServices(`${appointment.serviceId as ServiceKey}.title`))}`,
    `👨‍⚕️ ${escapeHtml(tDoctors(`${appointment.doctorId as DoctorKey}.name`))}`,
    `📅 ${escapeHtml(when)}`,
  ];

  if (appointment.comment) {
    lines.push("", `💬 ${escapeHtml(appointment.comment)}`);
  }

  const keyboard: InlineKeyboard = status
    ? []
    : [
        [
          { text: t("confirm"), callback_data: `${CALLBACK_PREFIX}:confirmed:${appointment.id}` },
          { text: t("cancel"), callback_data: `${CALLBACK_PREFIX}:cancelled:${appointment.id}` },
        ],
      ];

  return { text: lines.join("\n"), keyboard };
}

/**
 * Tells the clinic about a new booking. Never throws: a Telegram outage
 * must not break the patient's booking.
 */
export async function notifyNewAppointment(db: Database, appointment: NotifiableAppointment) {
  try {
    if (!isTelegramConfigured()) return;
    const chatId = await getNotificationChatId(db);
    if (!chatId) return;

    const { text, keyboard } = await buildAppointmentMessage(appointment, null);
    await sendMessage(chatId, text, keyboard);
  } catch (error) {
    console.error("[telegram] failed to send notification", error);
  }
}
