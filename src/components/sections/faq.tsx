"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqItems } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Faq() {
  const t = useTranslations("faq");
  const [openId, setOpenId] = useState<string | null>(faqItems[0]);
  const baseId = useId();

  return (
    <section id="faq" className="bg-surface-muted/60 py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          align="left"
          className="lg:sticky lg:top-28 lg:self-start"
        />

        <Reveal className="divide-y divide-border rounded-3xl border border-border bg-surface">
          {faqItems.map((id) => {
            const open = openId === id;
            const panelId = `${baseId}-${id}`;
            return (
              <div key={id}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : id)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-semibold transition-colors hover:text-primary sm:px-8 sm:py-6"
                  >
                    {t(`items.${id}.q`)}
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border border-border transition-all duration-300",
                        open && "rotate-45 border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <Plus className="size-4" aria-hidden />
                    </span>
                  </button>
                </h3>
                {/* grid-rows 0fr → 1fr animates height without measuring */}
                <div
                  id={panelId}
                  role="region"
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden" inert={!open}>
                    <p className="px-6 pb-6 leading-relaxed text-muted sm:px-8">
                      {t(`items.${id}.a`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}
