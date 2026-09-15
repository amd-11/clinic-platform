import { CheckCheck, CircleCheck, CircleX, Clock3, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AppointmentStatus } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Status colours are reserved for status and always paired with an icon and a label. */
const styles: Record<AppointmentStatus, { icon: LucideIcon; className: string }> = {
  pending: {
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900",
  },
  confirmed: {
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900",
  },
  completed: {
    icon: CheckCheck,
    className:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700",
  },
  cancelled: {
    icon: CircleX,
    className:
      "bg-rose-50 text-rose-800 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-900",
  },
};

export function StatusBadge({ status, className }: { status: AppointmentStatus; className?: string }) {
  const t = useTranslations("admin.status");
  const { icon: Icon, className: tone } = styles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {t(status)}
    </span>
  );
}
