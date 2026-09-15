"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type OptionCardProps = {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  className?: string;
};

/** A large selectable card that behaves like a radio button. */
export function OptionCard({ selected, onSelect, children, className }: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative flex w-full items-start gap-4 rounded-2xl border bg-surface p-5 text-left transition-all duration-200 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
        selected
          ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
          : "border-border hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute top-4 right-4 grid size-6 place-items-center rounded-full border transition-all",
          selected
            ? "scale-100 border-primary bg-primary text-primary-foreground"
            : "scale-90 border-border text-transparent",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </span>
    </button>
  );
}
