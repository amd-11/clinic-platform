"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BookingDoctor } from "@/lib/booking/catalog";
import { initials, useCatalogLabels } from "./labels";
import { OptionCard } from "./option-card";

export const ANY_DOCTOR = "any";

type StepDoctorProps = {
  doctors: BookingDoctor[];
  selected: string | null; // doctor id, ANY_DOCTOR or null
  onSelect: (value: string) => void;
};

export function StepDoctor({ doctors, selected, onSelect }: StepDoctorProps) {
  const t = useTranslations("booking");
  const tDoctors = useTranslations("doctors");
  const labels = useCatalogLabels();

  return (
    <div>
      <h2 className="text-2xl font-bold">{t("doctor.title")}</h2>
      <div role="radiogroup" aria-label={t("doctor.title")} className="mt-6 grid gap-3 sm:grid-cols-2">
        {doctors.length > 1 && (
          <OptionCard
            selected={selected === ANY_DOCTOR}
            onSelect={() => onSelect(ANY_DOCTOR)}
            className="sm:col-span-2"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-gold text-white">
              <Sparkles className="size-6" aria-hidden />
            </span>
            <span className="pr-6">
              <span className="block font-bold">{t("doctor.any")}</span>
              <span className="mt-1 block text-sm text-muted">{t("doctor.anyDescription")}</span>
            </span>
          </OptionCard>
        )}

        {doctors.map((doctor) => {
          const name = labels.doctorName(doctor.id);
          return (
            <OptionCard
              key={doctor.id}
              selected={selected === doctor.id}
              onSelect={() => onSelect(doctor.id)}
            >
              <span
                className="grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-semibold text-white dark:brightness-90"
                style={{
                  background: `linear-gradient(160deg, hsl(${doctor.hue} 45% 70%), hsl(${doctor.hue} 35% 50%))`,
                }}
                aria-hidden
              >
                {initials(name)}
              </span>
              <span className="min-w-0 pr-6">
                <span className="block font-bold">{name}</span>
                <span className="mt-0.5 block text-sm text-primary">
                  {labels.doctorRole(doctor.id)}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {tDoctors("experience", { years: doctor.experienceYears })}
                </span>
              </span>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}
