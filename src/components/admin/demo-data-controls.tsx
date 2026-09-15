"use client";

import { Loader2, Trash2, WandSparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { clearDemoData, generateDemoData } from "@/lib/admin/actions";

export function DemoDataControls({ count, readOnly }: { count: number; readOnly: boolean }) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<"generate" | "clear" | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(kind: "generate" | "clear") {
    setRunning(kind);
    setError(null);
    startTransition(async () => {
      const result = kind === "generate" ? await generateDemoData() : await clearDemoData();
      if (!result.ok) setError(t(`errors.${result.error}`));
      setRunning(null);
    });
  }

  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 font-bold">
            <WandSparkles className="size-4 text-primary" aria-hidden />
            {t("schedule.demoTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted">{t("schedule.demoText")}</p>
          <p className="mt-2 text-sm font-semibold">{t("schedule.demoCount", { count })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {count > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={readOnly || pending}
              onClick={() => run("clear")}
              title={readOnly ? t("errors.demo") : undefined}
              className="text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              {running === "clear" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              {t("schedule.demoClear")}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={readOnly || pending}
            onClick={() => run("generate")}
            title={readOnly ? t("errors.demo") : undefined}
          >
            {running === "generate" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <WandSparkles className="size-4" aria-hidden />}
            {t("schedule.demoGenerate")}
          </Button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    </section>
  );
}
