import { eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { settings } from "@/db/schema";

export const TELEGRAM_CHAT_KEY = "telegram_chat_id";
export const TELEGRAM_PAIRING_KEY = "telegram_pairing_until";

export async function getSetting(db: Database, key: string): Promise<string | null> {
  const [row] = await db.select({ value: settings.value }).from(settings).where(eq(settings.key, key)).limit(1);
  return row?.value ?? null;
}

export async function setSetting(db: Database, key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: sql`now()` },
    });
}

export async function deleteSetting(db: Database, key: string) {
  await db.delete(settings).where(eq(settings.key, key));
}

/** The Telegram chat that receives notifications, or null while the bot is not paired. */
export function getNotificationChatId(db: Database) {
  return getSetting(db, TELEGRAM_CHAT_KEY);
}

/** Pairing window: the bot only accepts a new chat while the admin has just opened it. */
export const PAIRING_WINDOW_MS = 10 * 60 * 1000;

export async function isPairingOpen(db: Database, now = Date.now()) {
  const until = await getSetting(db, TELEGRAM_PAIRING_KEY);
  return until !== null && Number(until) > now;
}
