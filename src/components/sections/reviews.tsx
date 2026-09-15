import { Quote, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { reviews, siteConfig } from "@/lib/site-data";

export function Reviews() {
  const t = useTranslations("reviews");

  return (
    <section id="reviews" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} align="left" />
          <Reveal className="flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
            <span className="font-display text-4xl font-semibold">{siteConfig.rating}</span>
            <div>
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" aria-hidden />
                ))}
              </div>
              <p className="mt-1 text-sm text-muted">
                {t("summary", { rating: siteConfig.rating, count: siteConfig.reviewsCount })}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {reviews.map((id, index) => {
            const name = t(`items.${id}.name`);
            return (
              <Reveal key={id} delay={(index % 3) * 0.08} className="mb-5 break-inside-avoid">
                <figure className="relative rounded-3xl border border-border bg-surface p-7">
                  <Quote className="absolute top-6 right-6 size-8 text-primary/15" aria-hidden />
                  <div className="flex gap-0.5 text-gold" aria-label="5/5">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="size-4 fill-current" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-4 leading-relaxed text-pretty">
                    “{t(`items.${id}.text`)}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">
                      {name.charAt(0)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{name}</span>
                      <span className="block text-xs text-muted">{t(`items.${id}.service`)}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
