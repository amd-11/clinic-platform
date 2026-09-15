"use client";

import { Check, CheckCheck, Loader2, Trash2, Undo2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import type { AppointmentStatus } from "@/db/schema";
import { deleteAppointment, setAppointmentStatus } from "@/lib/admin/actions";
import type { ActionResult } from "@/lib/admin/guard";
import { cn } from "@/lib/utils";

type AppointmentActionsProps = {
  id: string;
  status: AppointmentStatus;
  readOnly: boolean;
  className?: string;
};

type ActionKey = "confirm" | "complete" | "cancel" | "restore" | "delete";

const transitions: Record<AppointmentStatus, ActionKey[]> = {
  pending: ["confirm", "cancel"],
  confirmed: ["complete", "cancel"],
  completed: [],
  cancelled: ["restore", "delete"],
};

const icons = { confirm: Check, complete: CheckCheck, cancel: X, restore: Undo2, delete: Trash2 };

export function AppointmentActions({ id, status, readOnly, className }: AppointmentActionsProps) {
  const t = useTranslations("admin");
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<ActionKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = transitions[status];
  if (actions.length === 0) return null;

  function run(action: ActionKey) {
    if (action === "delete" && !window.confirm(t("appointments.deleteConfirm"))) return;

    setRunning(action);
    setError(null);
    startTransition(async () => {
      let result: ActionResult;
      if (action === "delete") {
        result = await deleteAppointment(id);
      } else {
        const next: Record<Exclude<ActionKey, "delete">, AppointmentStatus> = {
          confirm: "confirmed",
          complete: "completed",
          cancel: "cancelled",
          restore: "pending",
        };
        result = await setAppointmentStatus(id, next[action]);
      }
      if (!result.ok) setError(t(`errors.${result.error}`));
      setRunning(null);
    });
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div className="flex flex-wrap justify-end gap-1.5">
        {actions.map((action) => {
          const Icon = pending && running === action ? Loader2 : icons[action];
          const primary = action === "confirm" || action === "complete";
          return (
            <button
              key={action}
              type="button"
              disabled={readOnly || pending}
              onClick={() => run(action)}
              title={readOnly ? t("errors.demo") : undefined}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                primary
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : action === "delete"
                    ? "text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    : "border border-border bg-surface hover:bg-accent",
              )}
            >
              <Icon className={cn("size-3.5", pending && running === action && "animate-spin")} aria-hidden />
              {t(`appointments.${action}`)}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}
