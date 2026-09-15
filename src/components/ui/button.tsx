import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/25",
  secondary:
    "border border-border bg-surface text-foreground hover:border-primary/40 hover:bg-accent",
  ghost: "text-foreground hover:bg-accent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = React.ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={buttonVariants({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = React.ComponentProps<"a"> & {
  href: string;
  variant?: Variant;
  size?: Size;
};

/**
 * Internal paths ("/booking") go through the locale-aware Link, so /hy stays /hy/booking.
 * Anchors, phone numbers and external URLs render a plain <a>.
 */
export function ButtonLink({ variant, size, className, href, ...props }: ButtonLinkProps) {
  const classes = buttonVariants({ variant, size, className });
  if (href.startsWith("/")) {
    return <Link href={href} className={classes} {...props} />;
  }
  return <a href={href} className={classes} {...props} />;
}
