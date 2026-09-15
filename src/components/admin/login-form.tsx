"use client";

import { AlertCircle, Eye, KeyRound, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { enterDemo, login, type LoginState } from "@/lib/admin/auth-actions";

type LoginFormProps = {
  showDevHint: boolean;
  demoEnabled: boolean;
};

const initialState: LoginState = { error: null };

export function LoginForm({ showDevHint, demoEnabled }: LoginFormProps) {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="locale" value={locale} />
        <div>
          <label htmlFor="admin-password" className="text-sm font-semibold">
            {t("password")}
          </label>
          <div className="relative mt-2">
            <KeyRound
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              autoFocus
              aria-invalid={state.error === "invalid"}
              className="block w-full rounded-xl border border-border bg-surface py-3 pr-4 pl-11 text-base focus:border-primary focus:ring-4 focus:ring-ring focus:outline-none"
            />
          </div>
        </div>

        {state.error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {t(state.error)}
          </p>
        )}

        {showDevHint && <p className="text-xs text-muted">{t("devHint")}</p>}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {pending ? t("submitting") : t("submit")}
        </Button>
      </form>

      {demoEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-xs text-muted uppercase">
            <span className="h-px flex-1 bg-border" />
            {t("or")}
            <span className="h-px flex-1 bg-border" />
          </div>
          <form action={enterDemo}>
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="secondary" size="lg" className="w-full">
              <Eye className="size-4" aria-hidden />
              {t("demo")}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">{t("demoHint")}</p>
          </form>
        </>
      )}
    </div>
  );
}
