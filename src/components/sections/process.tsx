import { CalendarCheck, ClipboardList, ScanLine, ShieldCheck, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/lib/site-data";

const icons: Record<(typeof processSteps)[number], LucideIcon> = {
  booking: CalendarCheck,
  diagnostics: ScanLine,
  plan: ClipboardList,
  warranty: ShieldCheck,
};

/** Always-dark band that breaks up the light page rhythm (in both themes). */
export function Process() {
  const t = useTranslations("process");

  return (
    <section className="relative overflow-hidden bg-[#0a1a1c] py-20 text-white sm:py-28 dark:bg-[#071012]">
      <div
        aria-hidden
        className="absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#5cc6b6] to-transparent"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[#5cc6b6]/10 blur-3xl"
      />
      <Container className="relative">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
          className="[&_p]:text-white/60 [&>span]:text-[#5cc6b6]"
        />

        <div role="list" className="relative mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div
            aria-hidden
            className="absolute top-7 right-[12.5%] left-[12.5%] hidden h-px border-t border-dashed border-white/20 lg:block"
          />
          {processSteps.map((step, index) => {
            const Icon = icons[step];
            return (
              <Reveal key={step} delay={index * 0.1} className="relative text-center">
                <div role="listitem">
                  <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-[#5cc6b6] text-[#04201d] shadow-lg shadow-[#5cc6b6]/20">
                    <Icon className="size-6" aria-hidden />
                    <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-white text-xs font-bold text-[#0a1a1c]">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-6 text-lg font-bold">{t(`steps.${step}.title`)}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/60">
                    {t(`steps.${step}.description`)}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
