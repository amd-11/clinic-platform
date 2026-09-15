"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export const BOOKING_STEPS = ["service", "doctor", "datetime", "contacts"] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

type StepperProps = {
  current: number;
  /** Highest step the visitor may jump to (all previous steps are complete). */
  maxReachable: number;
  onNavigate: (index: number) => void;
};

export function Stepper({ current, maxReachable, onNavigate }: StepperProps) {
  const t = useTranslations("booking");

  return (
    <nav aria-label={t("stepOf", { current: current + 1, total: BOOKING_STEPS.length })}>
      <p className="mb-3 text-sm font-medium text-muted sm:hidden">
        {t("stepOf", { current: current + 1, total: BOOKING_STEPS.length })} ·{" "}
        <span className="text-foreground">{t(`steps.${BOOKING_STEPS[current]}`)}</span>
      </p>
      <ol className="flex items-center gap-2">
        {BOOKING_STEPS.map((step, index) => {
          const done = index < current;
          const active = index === current;
          const reachable = index <= maxReachable && !active;
          return (
            <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onNavigate(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors disabled:cursor-default",
                  active ? "text-foreground" : done ? "text-primary" : "text-muted",
                  reachable && "hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs transition-all duration-300",
                    active && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25",
                    done && "border-primary bg-accent text-accent-foreground",
                    !active && !done && "border-border bg-surface",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : index + 1}
                </span>
                <span className="hidden sm:inline">{t(`steps.${step}`)}</span>
              </button>
              {index < BOOKING_STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border"
                >
                  <span
                    className="absolute inset-y-0 left-0 bg-primary transition-all duration-500"
                    style={{ width: done ? "100%" : "0%" }}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
