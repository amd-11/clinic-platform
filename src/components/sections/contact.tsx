import { ArrowRight, Clock, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { BOOKING_HREF } from "@/lib/links";
import { siteConfig } from "@/lib/site-data";

const MAP_SRC =
  "https://www.google.com/maps?q=40.1843,44.5160&z=16&output=embed";

export function Contact() {
  const t = useTranslations("contact");

  const details = [
    { icon: MapPin, label: t("address"), value: t("addressValue") },
    {
      icon: Phone,
      label: t("phone"),
      value: (
        <a href={siteConfig.phoneHref} className="hover:text-primary">
          {siteConfig.phone}
        </a>
      ),
    },
    {
      icon: Clock,
      label: t("hours"),
      value: (
        <>
          {t("hoursWeekdays")}
          <br />
          {t("hoursWeekend")}
        </>
      ),
    },
  ];

  return (
    <section id="contacts" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="grid overflow-hidden rounded-[2rem] border border-border bg-surface lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                <span className="h-px w-6 bg-primary/60" aria-hidden />
                {t("eyebrow")}
              </span>
              <h2 className="mt-4 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                {t("title")}
              </h2>
              <p className="mt-4 text-muted">{t("subtitle")}</p>

              <dl className="mt-8 space-y-5">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div>
                      <dt className="text-sm text-muted">{label}</dt>
                      <dd className="mt-0.5 font-semibold">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={BOOKING_HREF} size="lg" className="group">
                  {t("book")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </ButtonLink>
                <ButtonLink
                  href={siteConfig.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  {t("whatsapp")}
                </ButtonLink>
                <ButtonLink
                  href={siteConfig.telegramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  <Send className="size-4" aria-hidden />
                  {t("telegram")}
                </ButtonLink>
              </div>
            </div>

            <div className="relative min-h-80 bg-surface-muted">
              <iframe
                src={MAP_SRC}
                title={t("addressValue")}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0 grayscale-[0.3] dark:brightness-[0.8] dark:contrast-[1.1] dark:grayscale dark:invert-[0.9]"
              />
              <div className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur">
                <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
                {t("mapLabel")}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
