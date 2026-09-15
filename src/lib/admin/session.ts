import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * "admin" — clinic staff, full access (password from ADMIN_PASSWORD).
 * "demo"  — portfolio visitors, read-only with patient data masked.
 */
export type AdminRole = "admin" | "demo";

export type AdminSession = { role: AdminRole; expiresAt: number };

const COOKIE_NAME = "aurora_admin";
const TTL_MS: Record<AdminRole, number> = {
  admin: 7 * 24 * 60 * 60 * 1000,
  demo: 24 * 60 * 60 * 1000,
};

const DEV_PASSWORD = "admin";

/** The admin password, or null when the panel has no password configured in production. */
export function getAdminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSWORD;
}

export function isDemoAccessEnabled() {
  return process.env.DEMO_ACCESS !== "false";
}

export function isDevPassword() {
  return !process.env.ADMIN_PASSWORD && process.env.NODE_ENV !== "production";
}

/**
 * Sessions are signed (HMAC-SHA256), not stored in the database.
 * The key is derived from a server secret, so changing ADMIN_PASSWORD
 * or SESSION_SECRET logs everyone out.
 */
function signingKey(): Buffer {
  const secret =
    process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? process.env.DATABASE_URL;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Set SESSION_SECRET (or ADMIN_PASSWORD) to enable admin sessions.");
  }
  return createHash("sha256")
    .update(`aurora-admin-session:${secret ?? "development-only-secret"}`)
    .digest();
}

function sign(payload: string) {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

/** Compares two strings in constant time (hashing first equalises lengths). */
export function safeEqual(a: string, b: string) {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

function encode(session: AdminSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(token: string | undefined): AdminSession | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Partial<AdminSession>;
    if ((data.role !== "admin" && data.role !== "demo") || typeof data.expiresAt !== "number") {
      return null;
    }
    if (data.expiresAt < Date.now()) return null;
    return { role: data.role, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export async function createSession(role: AdminRole) {
  const expiresAt = Date.now() + TTL_MS[role];
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode({ role, expiresAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Cached per request, so layouts, pages and actions can all call it cheaply. */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  return decode(cookieStore.get(COOKIE_NAME)?.value);
});
