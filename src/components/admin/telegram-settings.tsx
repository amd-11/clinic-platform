"use client";

import { AlertCircle, Check, CircleCheck, CircleX, Link2, Loader2, Send, Unlink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  connectTelegram,
  disconnectTelegram,
  sendTelegramTest,
  type TelegramResult,
  type TelegramStatus,
} from "@/lib/admin/telegram-actions";
import { cn } from "@/lib/utils";

type Action = "connect" | "test" | "disconnect";

export function TelegramSettings({ status, readOnly }: { status: TelegramStatus; readOnly: boolean }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<Action | null>(null);
  const [result, setResult] = useState<TelegramResult | null>(null);

  const pairingMinutes = status.pairingMinutesLeft;

  function run(action: Action) {
    setRunning(action);
    setResult(null);
    startTransition(async () => {
      const outcome =
        action === "connect"
          ? await connectTelegram()
          : action === "test"
            ? await sendTelegramTest()
            : await disconnectTelegram();
      setResult(outcome);
      setRunning(null);
    });
  }

  const rows: { label: string; value: string; ok: boolean }[] = [
    {
      label: t("telegram.state.token"),
      value: status.tokenConfigured ? t("telegram.state.ready") : t("telegram.state.missing"),
      ok: status.tokenConfigured,
    },
    {
      label: t("telegram.state.bot"),
      value: status.botUsername ? `@${status.botUsername}` : t("telegram.state.missing"),
      ok: Boolean(status.botUsername),
    },
    {
      label: t("telegram.state.webhook"),
      value: status.webhookUrl ? t("telegram.state.connected") : t("telegram.state.notConnected"),
      ok: Boolean(status.webhookUrl),
    },
    {
      label: t("telegram.state.chat"),
      value: status.chatConnected ? t("telegram.state.connected") : t("telegram.state.notConnected"),
      ok: status.chatConnected,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-4">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold",
                  row.ok ? "text-emerald-700 dark:text-emerald-300" : "text-muted",
                )}
              >
                {row.ok ? (
                  <CircleCheck className="size-4" aria-hidden />
                ) : (
                  <CircleX className="size-4" aria-hidden />
                )}
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
          <Button
            type="button"
            size="sm"
            disabled={readOnly || pending}
            onClick={() => run("connect")}
            title={readOnly ? t("errors.demo") : undefined}
          >
            {running === "connect" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Link2 className="size-4" aria-hidden />
            )}
            {running === "connect" ? t("telegram.working") : t("telegram.connect")}
          </Button>

          {status.chatConnected && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={readOnly || pending}
                onClick={() => run("test")}
                title={readOnly ? t("errors.demo") : undefined}
              >
                {running === "test" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {t("telegram.test")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={readOnly || pending}
                onClick={() => run("disconnect")}
                title={readOnly ? t("errors.demo") : undefined}
                className="text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                {running === "disconnect" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Unlink className="size-4" aria-hidden />
                )}
                {t("telegram.disconnect")}
              </Button>
            </>
          )}
        </div>

        {(result || pairingMinutes > 0 || status.webhookError) && (
          <div className="space-y-2 border-t border-border bg-surface-muted/50 p-4 text-sm" aria-live="polite">
            {result?.ok && (
              <p className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Check className="size-4 shrink-0" aria-hidden />
                {t(`telegram.ok.${result.message}`)}
              </p>
            )}
            {result && !result.ok && (
              <p role="alert" className="flex items-start gap-2 text-rose-700 dark:text-rose-300">
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
                {result.error === "demo" || result.error === "unauthorized"
                  ? t(`errors.${result.error === "demo" ? "demo" : "unauthorized"}`)
                  : result.error === "failed"
                    ? t("telegram.errors.failed", { message: result.message ?? "" })
                    : t(`telegram.errors.${result.error}`)}
              </p>
            )}
            {pairingMinutes > 0 && !result?.ok && (
              <p className="text-muted">{t("telegram.pairing", { minutes: pairingMinutes })}</p>
            )}
            {status.webhookError && (
              <p className="text-muted">{t("telegram.lastError", { message: status.webhookError })}</p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-surface p-5">
        <h2 className="font-bold">{t("telegram.steps.title")}</h2>
        <ol className="mt-3 space-y-3 text-sm text-muted">
          {(["one", "two", "three"] as const).map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {index + 1}
              </span>
              {t(`telegram.steps.${step}`)}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
