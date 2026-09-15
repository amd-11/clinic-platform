"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { BookingState } from "@/lib/booking/actions";
import { siteConfig } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export type ContactValues = {
  name: string;
  phone: string;
  comment: string;
  consent: boolean;
};

type StepContactsProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  state: BookingState;
  values: ContactValues;
  onChange: (values: ContactValues) => void;
  hidden: { serviceId: string; doctorId: string | null; date: string; time: string };
  onChooseAnotherTime: () => void;
};

const inputClass =
  "mt-2 block w-full rounded-xl border bg-surface px-4 py-3 text-base transition-colors placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-ring focus:outline-none";

export function StepContacts({
  action,
  pending,
  state,
  values,
  onChange,
  hidden,
  onChooseAnotherTime,
}: StepContactsProps) {
  const t = useTranslations("booking");
  const locale = useLocale();

  const invalid = new Set(state.status === "error" ? (state.fields ?? []) : []);
  const set = (patch: Partial<ContactValues>) => onChange({ ...values, ...patch });

  return (
    // Inputs are controlled, so values survive a failed submission
    <form action={action} noValidate>
      <h2 className="text-2xl font-bold">{t("contacts.title")}</h2>

      <input type="hidden" name="serviceId" value={hidden.serviceId} />
      <input type="hidden" name="doctorId" value={hidden.doctorId ?? ""} />
      <input type="hidden" name="date" value={hidden.date} />
      <input type="hidden" name="time" value={hidden.time} />
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot for bots — hidden from people and screen readers */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {state.status === "error" && state.error !== "validation" && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <p>
              {state.error === "unavailable"
                ? t("errors.unavailable", { phone: siteConfig.phone })
                : t(`errors.${state.error}`)}
            </p>
            {state.error === "slotTaken" && (
              <button
                type="button"
                onClick={onChooseAnotherTime}
                className="mt-2 font-semibold underline underline-offset-4"
              >
                {t("steps.datetime")} →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className="text-sm font-semibold">
            {t("contacts.name")}
          </label>
          <input
            id="booking-name"
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            value={values.name}
            onChange={(event) => set({ name: event.target.value })}
            placeholder={t("contacts.namePlaceholder")}
            aria-invalid={invalid.has("name")}
            aria-describedby={invalid.has("name") ? "booking-name-error" : undefined}
            className={cn(inputClass, invalid.has("name") ? "border-red-400" : "border-border")}
          />
          {invalid.has("name") && (
            <p id="booking-name-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {t("errors.name")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="booking-phone" className="text-sm font-semibold">
            {t("contacts.phone")}
          </label>
          <input
            id="booking-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={30}
            value={values.phone}
            onChange={(event) => set({ phone: event.target.value })}
            placeholder={t("contacts.phonePlaceholder")}
            aria-invalid={invalid.has("phone")}
            aria-describedby={invalid.has("phone") ? "booking-phone-error" : undefined}
            className={cn(inputClass, invalid.has("phone") ? "border-red-400" : "border-border")}
          />
          {invalid.has("phone") && (
            <p id="booking-phone-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {t("errors.phone")}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="booking-comment" className="text-sm font-semibold">
            {t("contacts.comment")}{" "}
            <span className="font-normal text-muted">({t("contacts.optional")})</span>
          </label>
          <textarea
            id="booking-comment"
            name="comment"
            rows={3}
            maxLength={500}
            value={values.comment}
            onChange={(event) => set({ comment: event.target.value })}
            placeholder={t("contacts.commentPlaceholder")}
            className={cn(inputClass, "resize-none border-border")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              name="consent"
              checked={values.consent}
              onChange={(event) => set({ consent: event.target.checked })}
              aria-invalid={invalid.has("consent")}
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-[var(--primary)]"
            />
            <span className={invalid.has("consent") ? "text-red-600 dark:text-red-400" : "text-muted"}>
              {t("contacts.consent")}
            </span>
          </label>
          {invalid.has("consent") && (
            <p className="mt-1.5 pl-8 text-sm text-red-600 dark:text-red-400">{t("errors.consent")}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="mt-8 w-full sm:w-auto">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {pending ? t("contacts.submitting") : t("contacts.submit")}
      </Button>
    </form>
  );
}
