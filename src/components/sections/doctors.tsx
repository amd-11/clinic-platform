import { ArrowRight, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { BOOKING_HREF } from "@/lib/links";
import { doctors } from "@/lib/site-data";

function initials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

export function Doctors() {
  const t = useTranslations("doctors");

  return (
    <section id="doctors" className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doctor, index) => {
            const name = t(`items.${doctor.id}.name`);
            return (
              <Reveal key={doctor.id} delay={index * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/5">
                  {/* Portrait placeholder — replace with a real photo via next/image */}
                  <div
                    className="relative grid aspect-[4/4.2] place-items-center overflow-hidden dark:brightness-[0.82] dark:saturate-[0.9]"
                    style={{
                      background: `linear-gradient(160deg, hsl(${doctor.hue} 45% 88%), hsl(${doctor.hue} 35% 72%))`,
                    }}
                  >
                    <span
                      className="font-display text-7xl font-semibold text-white/90 transition-transform duration-500 group-hover:scale-110"
                      aria-hidden
                    >
                      {initials(name)}
                    </span>
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#0d1b1e] backdrop-blur">
                      <Award className="size-3.5 text-[#0e5e5a]" aria-hidden />
                      {t("experience", { years: doctor.experience })}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold tracking-wider text-primary uppercase">
                      {t(`items.${doctor.id}.role`)}
                    </p>
                    <h3 className="mt-2 text-xl font-bold">{name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                      {t(`items.${doctor.id}.bio`)}
                    </p>
                    <a
                      href={BOOKING_HREF}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
                      style={{ transition: "gap 200ms" }}
                    >
                      {t("book")}
                      <ArrowRight className="size-4" aria-hidden />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
