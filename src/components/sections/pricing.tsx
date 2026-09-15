"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { BOOKING_HREF } from "@/lib/links";
import { pricing } from "@/lib/site-data";
import { cn, formatAmd } from "@/lib/utils";

type CategoryId = (typeof pricing)[number]["id"];

export function Pricing() {
  const t = useTranslations("pricing");
  const [active, setActive] = useState<CategoryId>(pricing[0].id);
  const category = pricing.find((item) => item.id === active) ?? pricing[0];

  return (
    <section id="prices" className="bg-surface-muted/60 py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <Reveal className="mx-auto mt-12 max-w-3xl">
          <div
            role="tablist"
            aria-label={t("title")}
            className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1.5 [scrollbar-width:none]"
          >
            {pricing.map((item) => {
              const selected = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="pricing-panel"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                    selected ? "text-primary-foreground" : "text-muted hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="pricing-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{t(`categories.${item.id}`)}</span>
                </button>
              );
            })}
          </div>

          <div
            id="pricing-panel"
            role="tabpanel"
            className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={category.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-border"
              >
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline gap-4 px-6 py-5 transition-colors hover:bg-accent/50 sm:px-8"
                  >
                    <span className="font-medium">{t(`items.${item.id}`)}</span>
                    <span
                      aria-hidden
                      className="hidden flex-1 translate-y-[-4px] border-b border-dotted border-border sm:block"
                    />
                    <span className="ml-auto shrink-0 font-bold whitespace-nowrap text-primary sm:ml-0">
                      {formatAmd(item.price)}
                    </span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="flex items-start gap-2 text-sm text-muted">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t("note")}
            </p>
            <ButtonLink href={BOOKING_HREF} className="w-full sm:w-auto">
              {t("book")}
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
