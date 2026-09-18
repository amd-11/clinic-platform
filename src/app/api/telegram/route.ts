import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getDb } from "@/db";
import { appointments, type AppointmentStatus } from "@/db/schema";
import {
  answerCallbackQuery,
  editMessageText,
  isTelegramConfigured,
  sendMessage,
  webhookSecret,
} from "@/lib/telegram/client";
import { CALLBACK_PREFIX, botLocale, buildAppointmentMessage } from "@/lib/telegram/notify";
import {
  TELEGRAM_CHAT_KEY,
  TELEGRAM_PAIRING_KEY,
  deleteSetting,
  getNotificationChatId,
  isPairingOpen,
  setSetting,
} from "@/lib/telegram/settings";

type Update = {
  message?: { chat: { id: number }; text?: string };
  callback_query?: {
    id: string;
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

/**
 * Telegram webhook. Handles two things:
 *  • /start — pairs the chat that will receive notifications (only while the
 *    admin has opened a pairing window in the admin panel)
 *  • button taps — confirm or cancel an appointment straight from Telegram
 *
 * Always answers 200, otherwise Telegram keeps retrying the same update.
 */
export async function POST(request: NextRequest) {
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true });
  }
  if (request.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = (await request.json()) as Update;
    const t = await getTranslations({ locale: botLocale(), namespace: "telegram" });
    const db = await getDb();

    if (update.message?.text?.startsWith("/start")) {
      const chatId = String(update.message.chat.id);
      const currentChatId = await getNotificationChatId(db);

      if (currentChatId === chatId) {
        await sendMessage(chatId, t("alreadyPaired"));
      } else if (await isPairingOpen(db)) {
        await setSetting(db, TELEGRAM_CHAT_KEY, chatId);
        await deleteSetting(db, TELEGRAM_PAIRING_KEY);
        await sendMessage(chatId, t("paired"));
      } else {
        await sendMessage(chatId, t("pairingClosed"));
      }
      return NextResponse.json({ ok: true });
    }

    const callback = update.callback_query;
    if (callback?.data?.startsWith(`${CALLBACK_PREFIX}:`)) {
      const [, status, id] = callback.data.split(":");
      const chatId = callback.message ? String(callback.message.chat.id) : null;
      const allowedChatId = await getNotificationChatId(db);

      if (!chatId || chatId !== allowedChatId) {
        await answerCallbackQuery(callback.id, t("forbidden"));
        return NextResponse.json({ ok: true });
      }
      if (status !== "confirmed" && status !== "cancelled") {
        await answerCallbackQuery(callback.id);
        return NextResponse.json({ ok: true });
      }

      const [updated] = await db
        .update(appointments)
        .set({ status: status as AppointmentStatus })
        .where(eq(appointments.id, id))
        .returning();

      if (!updated) {
        await answerCallbackQuery(callback.id, t("notFound"));
        return NextResponse.json({ ok: true });
      }

      const { text } = await buildAppointmentMessage(updated, updated.status);
      await answerCallbackQuery(callback.id, t("done"));
      if (callback.message) {
        await editMessageText(chatId, callback.message.message_id, text);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[telegram] webhook error", error);
    return NextResponse.json({ ok: true });
  }
}
