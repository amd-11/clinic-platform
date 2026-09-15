import { ArrowRight, BadgeCheck, CalendarDays, ShieldCheck, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BOOKING_HREF } from "@/lib/links";
import { cn } from "@/lib/utils";

const slots = ["10:30", "13:00", "16:30"];

export function Hero() {
  const t = useTranslations("hero");

  const stats = [
    { value: t("stats.years"), label: t("stats.yearsLabel") },
    { value: t("stats.patients"), label: t("stats.patientsLabel") },
    { value: t("stats.rating"), label: t("stats.ratingLabel") },
  ];

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 sm:pt-40 lg:pb-28">
      <HeroBackground />

      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        <div className="min-w-0">
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              {t("badge")}
            </span>
          </FadeUp>

          <FadeUp delay={80}>
            <h1 className="mt-6 font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {t("title")} <span className="text-primary italic">{t("titleAccent")}</span>
            </h1>
          </FadeUp>

          <FadeUp delay={160}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted">
              {t("subtitle")}
            </p>
          </FadeUp>

          <FadeUp delay={240} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={BOOKING_HREF} size="lg" className="group">
              {t("ctaPrimary")}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </ButtonLink>
            <ButtonLink href="#prices" variant="secondary" size="lg">
              {t("ctaSecondary")}
            </ButtonLink>
          </FadeUp>

          <FadeUp delay={320}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-display text-3xl font-semibold sm:text-4xl">{stat.value}</dd>
                  <dd className="mt-1 text-xs leading-snug text-muted sm:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </FadeUp>
        </div>

        <FadeUp delay={200}>
          <HeroVisual
            labels={{
              nextSlot: t("card.nextSlot"),
              today: t("card.today"),
              doctorName: t("card.doctorName"),
              doctorRole: t("card.doctorRole"),
              book: t("card.book"),
              warranty: t("card.warranty"),
              painless: t("card.painless"),
              reviews: t("card.reviews"),
              rating: t("stats.rating"),
            }}
          />
        </FadeUp>
      </Container>
    </section>
  );
}

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("animate-fade-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-40 -right-40 size-[40rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute top-1/2 -left-60 size-[32rem] rounded-full bg-gold/15 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 70% 30%, black 10%, transparent 65%)",
        }}
      />
    </div>
  );
}

type HeroVisualLabels = {
  nextSlot: string;
  today: string;
  doctorName: string;
  doctorRole: string;
  book: string;
  warranty: string;
  painless: string;
  reviews: string;
  rating: string;
};

function HeroVisual({ labels }: { labels: HeroVisualLabels }) {
  return (
    <div className="relative mx-auto aspect-[4/4.4] w-full max-w-md lg:max-w-none">
      {/* Main panel */}
      <div className="absolute inset-x-6 inset-y-0 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-[#0b3f3d] shadow-2xl shadow-primary/30 sm:inset-x-10 dark:to-[#0a2a28]">
        <svg
          viewBox="0 0 400 440"
          className="absolute inset-0 size-full text-white/10"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <circle cx="330" cy="70" r="120" fill="currentColor" />
          <circle cx="60" cy="400" r="160" fill="currentColor" />
        </svg>
        {/* Stylised tooth illustration */}
        <svg
          viewBox="0 0 200 220"
          className="absolute top-[40%] left-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
          aria-hidden
        >
          <defs>
            <linearGradient id="tooth" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d6ece7" />
            </linearGradient>
          </defs>
          <path
            d="M60 12C29 12 12 37 12 69c0 35 15 59 24 92 8 29 14 57 32 57 22 0 21-48 33-72 4-9 9-12 20-12s16 3 20 12c12 24 11 72 33 72 18 0 24-28 32-57 9-33 24-57 24-92 0-32-17-57-48-57-27 0-43 15-61 15S87 12 60 12Z"
            transform="translate(-10 -4)"
            fill="url(#tooth)"
          />
          <path
            d="M62 40c-14 3-22 16-22 32"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Booking card */}
      <div className="absolute right-0 bottom-6 left-0 animate-float rounded-3xl border border-border bg-surface/95 p-5 shadow-2xl shadow-black/10 backdrop-blur sm:right-auto sm:w-80">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-muted">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            {labels.nextSlot}
          </span>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            {labels.today}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-gold font-semibold text-white">
            {labels.doctorName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold">{labels.doctorName}</p>
            <p className="text-xs text-muted">{labels.doctorRole}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {slots.map((slot, index) => (
            <span
              key={slot}
              className={
                index === 1
                  ? "rounded-xl bg-primary py-2 text-center text-sm font-semibold text-primary-foreground"
                  : "rounded-xl border border-border py-2 text-center text-sm font-medium"
              }
            >
              {slot}
            </span>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-foreground py-2.5 text-center text-sm font-semibold text-background">
          {labels.book}
        </div>
      </div>

      {/* Rating card */}
      <div
        className="absolute top-8 right-0 animate-float rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur"
        style={{ animationDelay: "-2.5s" }}
      >
        <div className="flex items-center gap-1 text-gold">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-3.5 fill-current" aria-hidden />
          ))}
        </div>
        <p className="mt-1 text-sm">
          <span className="font-display text-xl font-semibold">{labels.rating}</span>{" "}
          <span className="text-muted">· {labels.reviews}</span>
        </p>
      </div>

      {/* Warranty chip */}
      <div
        className="absolute top-1/3 left-0 hidden animate-float items-center gap-2 rounded-2xl border border-border bg-surface/95 px-4 py-3 text-sm font-semibold shadow-xl shadow-black/10 backdrop-blur sm:flex"
        style={{ animationDelay: "-4s" }}
      >
        <ShieldCheck className="size-5 text-primary" aria-hidden />
        {labels.warranty}
      </div>

      <div
        className="absolute right-4 bottom-44 hidden animate-float items-center gap-2 rounded-2xl border border-border bg-surface/95 px-4 py-3 text-sm font-semibold shadow-xl shadow-black/10 backdrop-blur sm:flex"
        style={{ animationDelay: "-1s" }}
      >
        <BadgeCheck className="size-5 text-primary" aria-hidden />
        {labels.painless}
      </div>
    </div>
  );
}
