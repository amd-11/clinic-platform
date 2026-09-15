import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { bookingHref } from "@/lib/links";
import { serviceIcon } from "@/lib/service-icons";
import { services } from "@/lib/site-data";
import { formatAmd } from "@/lib/utils";

export function Services() {
  const t = useTranslations("services");

  return (
    <section id="services" className="py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = serviceIcon(service.id);
            return (
              <Reveal key={service.id} delay={index * 0.06}>
                <Link
                  href={bookingHref({ service: service.id })}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
                >
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                  <div className="flex items-start justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <ArrowUpRight
                      className="size-5 text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{t(`items.${service.id}.title`)}</h3>
                  <p className="mt-2 flex-1 leading-relaxed text-muted">
                    {t(`items.${service.id}.description`)}
                  </p>
                  <p className="mt-6 border-t border-border pt-5 text-sm text-muted">
                    {t("from")}{" "}
                    <span className="text-lg font-bold text-foreground">
                      {formatAmd(service.priceFrom)}
                    </span>
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
