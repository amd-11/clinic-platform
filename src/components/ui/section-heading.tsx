import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
        <span className="h-px w-6 bg-primary/60" aria-hidden />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
