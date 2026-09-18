"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getDb } from "@/db";
import {
  deleteWebhook,
  getMe,
  getWebhookInfo,
  isTelegramConfigured,
  sendMessage,
  setWebhook,
} from "@/lib/telegram/client";
import { botLocale } from "@/lib/telegram/notify";
import {
  PAIRING_WINDOW_MS,
  TELEGRAM_CHAT_KEY,
  TELEGRAM_PAIRING_KEY,
  deleteSetting,
  getNotificationChatId,
  getSetting,
  setSetting,
} from "@/lib/telegram/settings";
import { authorizeMutation } from "./guard";

export type TelegramStatus = {
  tokenConfigured: boolean;
  botUsername: string | null;
  webhookUrl: string | null;
  webhookError: string | null;
  chatConnected: boolean;
  /** Minutes left in the pairing window (0 when closed) — computed on the server. */
  pairingMinutesLeft: number;
  siteUrl: string | null;
};

export type TelegramResult =
  | { ok: true; message: "connected" | "test" | "disconnected" }
  | { ok: false; error: "unauthorized" | "demo" | "noUrl" | "noToken" | "noChat" | "failed"; message?: string };

/** Public base URL of the deployment; Telegram cannot call localhost. */
function siteUrl(): string | null {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return host ? `https://${host}` : null;
}

export async function getTelegramStatus(): Promise<TelegramStatus> {
  const base: TelegramStatus = {
    tokenConfigured: isTelegramConfigured(),
    botUsername: null,
    webhookUrl: null,
    webhookError: null,
    chatConnected: false,
    pairingMinutesLeft: 0,
    siteUrl: siteUrl(),
  };
  if (!base.tokenConfigured) return base;

  const db = await getDb();
  const [chatId, pairing] = await Promise.all([
    getNotificationChatId(db),
    getSetting(db, TELEGRAM_PAIRING_KEY),
  ]);
  base.chatConnected = Boolean(chatId);
  base.pairingMinutesLeft = pairing
    ? Math.max(0, Math.ceil((Number(pairing) - Date.now()) / 60_000))
    : 0;

  try {
    const [me, hook] = await Promise.all([getMe(), getWebhookInfo()]);
    base.botUsername = me.username;
    base.webhookUrl = hook.url || null;
    base.webhookError = hook.last_error_message ?? null;
  } catch (error) {
    base.webhookError = error instanceof Error ? error.message : String(error);
  }

  return base;
}

/** Registers the webhook and opens a 10-minute window in which /start pairs the chat. */
export async function connectTelegram(): Promise<TelegramResult> {
  const allowed = await authorizeMutation();
  if (!allowed.ok) return { ok: false, error: allowed.error === "demo" ? "demo" : "unauthorized" };
  if (!isTelegramConfigured()) return { ok: false, error: "noToken" };

  const url = siteUrl();
  if (!url) return { ok: false, error: "noUrl" };

  try {
    await setWebhook(`${url}/api/telegram`);
    const db = await getDb();
    await setSetting(db, TELEGRAM_PAIRING_KEY, String(Date.now() + PAIRING_WINDOW_MS));
    revalidatePath("/[locale]/admin", "layout");
    return { ok: true, message: "connected" };
  } catch (error) {
    console.error("[telegram] connect failed", error);
    return { ok: false, error: "failed", message: error instanceof Error ? error.message : undefined };
  }
}

export async function sendTelegramTest(): Promise<TelegramResult> {
  const allowed = await authorizeMutation();
  if (!allowed.ok) return { ok: false, error: allowed.error === "demo" ? "demo" : "unauthorized" };
  if (!isTelegramConfigured()) return { ok: false, error: "noToken" };

  try {
    const db = await getDb();
    const chatId = await getNotificationChatId(db);
    if (!chatId) return { ok: false, error: "noChat" };

    const t = await getTranslations({ locale: botLocale(), namespace: "telegram" });
    await sendMessage(chatId, t("test"));
    return { ok: true, message: "test" };
  } catch (error) {
    console.error("[telegram] test failed", error);
    return { ok: false, error: "failed", message: error instanceof Error ? error.message : undefined };
  }
}

export async function disconnectTelegram(): Promise<TelegramResult> {
  const allowed = await authorizeMutation();
  if (!allowed.ok) return { ok: false, error: allowed.error === "demo" ? "demo" : "unauthorized" };

  try {
    const db = await getDb();
    await deleteSetting(db, TELEGRAM_CHAT_KEY);
    await deleteSetting(db, TELEGRAM_PAIRING_KEY);
    if (isTelegramConfigured()) await deleteWebhook();
    revalidatePath("/[locale]/admin", "layout");
    return { ok: true, message: "disconnected" };
  } catch (error) {
    console.error("[telegram] disconnect failed", error);
    return { ok: false, error: "failed", message: error instanceof Error ? error.message : undefined };
  }
}
