import "server-only";
import type { Locale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { getSession, type AdminSession } from "./session";

/** For pages and layouts: sends visitors without a session to the login page. */
export async function requireSession(locale: Locale): Promise<AdminSession> {
  const session = await getSession();
  if (!session) {
    redirect({ href: "/admin/login", locale });
  }
  return session as AdminSession;
}

export type ActionResult = { ok: true } | { ok: false; error: "unauthorized" | "demo" | "invalid" | "server" };

/**
 * For server actions: every mutation must check permissions itself —
 * a page being protected does not protect the actions it calls.
 */
export async function authorizeMutation(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "unauthorized" };
  if (session.role !== "admin") return { ok: false, error: "demo" };
  return { ok: true };
}
