"use client";

import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookingService } from "@/lib/booking/catalog";
import { serviceIcon } from "@/lib/service-icons";
import { formatAmd } from "@/lib/utils";
import { useCatalogLabels } from "./labels";
import { OptionCard } from "./option-card";

type StepServiceProps = {
  services: BookingService[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function StepService({ services, selectedId, onSelect }: StepServiceProps) {
  const t = useTranslations("booking");
  const tServices = useTranslations("services");
  const labels = useCatalogLabels();

  return (
    <div>
      <h2 className="text-2xl font-bold">{t("service.title")}</h2>
      <div role="radiogroup" aria-label={t("service.title")} className="mt-6 grid gap-3 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = serviceIcon(service.id);
          const selected = service.id === selectedId;
          return (
            <OptionCard key={service.id} selected={selected} onSelect={() => onSelect(service.id)}>
              <span
                className={
                  selected
                    ? "grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground transition-colors"
                    : "grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors"
                }
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 pr-6">
                <span className="block font-bold">{labels.serviceTitle(service.id)}</span>
                <span className="mt-1 line-clamp-2 block text-sm leading-snug text-muted">
                  {labels.serviceDescription(service.id)}
                </span>
                <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Clock className="size-3.5" aria-hidden />
                    {t("service.duration", { minutes: service.durationMinutes })}
                  </span>
                  <span className="font-semibold">
                    {tServices("from")} {formatAmd(service.priceFrom)}
                  </span>
                </span>
              </span>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}
