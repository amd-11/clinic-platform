"use server";

import type { Locale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  createSession,
  deleteSession,
  getAdminPassword,
  isDemoAccessEnabled,
  safeEqual,
} from "./session";

export type LoginState = { error: "invalid" | "notConfigured" | null };

function readLocale(formData: FormData): Locale {
  const value = formData.get("locale");
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const expected = getAdminPassword();
  if (!expected) return { error: "notConfigured" };

  const password = String(formData.get("password") ?? "");
  if (!safeEqual(password, expected)) {
    // Slow down password guessing
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "invalid" };
  }

  await createSession("admin");
  redirect({ href: "/admin", locale: readLocale(formData) });
  return { error: null };
}

export async function enterDemo(formData: FormData) {
  if (!isDemoAccessEnabled()) return;
  await createSession("demo");
  redirect({ href: "/admin", locale: readLocale(formData) });
}

export async function logout(formData: FormData) {
  await deleteSession();
  redirect({ href: "/admin/login", locale: readLocale(formData) });
}
