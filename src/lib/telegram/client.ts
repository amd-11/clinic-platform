import { createHash } from "node:crypto";

/**
 * Minimal Telegram Bot API client — plain fetch, no dependencies.
 * https://core.telegram.org/bots/api
 */

export type InlineKeyboard = { text: string; callback_data: string }[][];

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

function token() {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN is not set");
  return value;
}

/**
 * Secret that Telegram sends back in the X-Telegram-Bot-Api-Secret-Token header,
 * so only Telegram can call our webhook. Derived from the bot token,
 * which means no extra environment variable to configure.
 */
export function webhookSecret() {
  return createHash("sha256").update(`telegram-webhook:${token()}`).digest("hex").slice(0, 48);
}

async function call<T>(method: string, body?: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    cache: "no-store",
  });

  const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description ?? response.status}`);
  }
  return data.result as T;
}

/** Escapes text for parse_mode: "HTML". */
export function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sendMessage(chatId: string, text: string, keyboard?: InlineKeyboard) {
  return call<{ message_id: number }>("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

export function editMessageText(
  chatId: string,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard,
) {
  return call("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: { inline_keyboard: keyboard ?? [] },
  });
}

export function answerCallbackQuery(id: string, text?: string) {
  return call("answerCallbackQuery", { callback_query_id: id, ...(text ? { text } : {}) });
}

export function setWebhook(url: string) {
  return call("setWebhook", {
    url,
    secret_token: webhookSecret(),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
}

export function deleteWebhook() {
  return call("deleteWebhook", { drop_pending_updates: true });
}

export function getWebhookInfo() {
  return call<{ url: string; last_error_message?: string; pending_update_count: number }>(
    "getWebhookInfo",
  );
}

export function getMe() {
  return call<{ id: number; username: string; first_name: string }>("getMe");
}
