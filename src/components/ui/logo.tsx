import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" className="size-9 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="10" className="fill-primary" />
        <path
          d="M10.5 9.5c-2.2 0-3.5 1.9-3.5 4.3 0 2.6 1.1 4.4 1.8 6.9.6 2.2 1.1 4.3 2.4 4.3 1.6 0 1.5-3.6 2.4-5.4.4-.8.9-1.1 2.4-1.1s2 .3 2.4 1.1c.9 1.8.8 5.4 2.4 5.4 1.3 0 1.8-2.1 2.4-4.3.7-2.5 1.8-4.3 1.8-6.9 0-2.4-1.3-4.3-3.5-4.3-2.1 0-3.3 1.2-5.5 1.2s-3.4-1.2-5.5-1.2Z"
          className="fill-primary-foreground"
        />
      </svg>
      <span className="font-display text-lg leading-none font-semibold tracking-tight whitespace-nowrap sm:text-xl">
        {siteConfig.name}
      </span>
    </span>
  );
}
