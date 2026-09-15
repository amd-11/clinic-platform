"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { createAppointment, type BookingState } from "@/lib/booking/actions";
import type { BookingCatalog } from "@/lib/booking/catalog";
import { weekdayOf } from "@/lib/booking/time";
import { BookingSuccess } from "./booking-success";
import { BookingSummary } from "./booking-summary";
import { StepContacts, type ContactValues } from "./step-contacts";
import { StepDateTime } from "./step-datetime";
import { ANY_DOCTOR, StepDoctor } from "./step-doctor";
import { StepService } from "./step-service";
import { BOOKING_STEPS, Stepper } from "./stepper";
import { useSlots } from "./use-slots";

type BookingWizardProps = {
  catalog: BookingCatalog;
  days: string[];
  initialServiceId?: string;
  initialDoctorId?: string;
};

export function BookingWizard(props: BookingWizardProps) {
  // Changing the key remounts the flow with fresh state (used by "New booking")
  const [instance, setInstance] = useState(0);

  return (
    <BookingFlow
      key={instance}
      catalog={props.catalog}
      days={props.days}
      initialServiceId={instance === 0 ? props.initialServiceId : undefined}
      initialDoctorId={instance === 0 ? props.initialDoctorId : undefined}
      onReset={() => {
        setInstance((value) => value + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}

const initialState: BookingState = { status: "idle" };
const emptyContacts: ContactValues = { name: "", phone: "", comment: "", consent: false };

function BookingFlow({
  catalog,
  days,
  initialServiceId,
  initialDoctorId,
  onReset,
}: BookingWizardProps & { onReset: () => void }) {
  const t = useTranslations("booking");
  const [state, formAction, pending] = useActionState(createAppointment, initialState);

  const presetDoctor = catalog.doctors.find((doctor) => doctor.id === initialDoctorId);
  const presetService = catalog.services.find(
    (service) =>
      service.id === initialServiceId && (!presetDoctor || presetDoctor.serviceIds.includes(service.id)),
  );

  const [step, setStep] = useState(presetService ? (presetDoctor ? 2 : 1) : 0);
  const [direction, setDirection] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(presetService?.id ?? null);
  const [doctorChoice, setDoctorChoice] = useState<string | null>(presetDoctor?.id ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [contacts, setContacts] = useState<ContactValues>(emptyContacts);
  const [submittedFor, setSubmittedFor] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const service = catalog.services.find((item) => item.id === serviceId) ?? null;
  const doctorsForService = catalog.doctors.filter(
    (doctor) => serviceId !== null && doctor.serviceIds.includes(serviceId),
  );
  const candidates =
    doctorChoice === ANY_DOCTOR
      ? doctorsForService
      : doctorsForService.filter((doctor) => doctor.id === doctorChoice);
  const workingWeekdays = new Set(candidates.flatMap((doctor) => doctor.weekdays));

  // Default to the first day someone is working, until the visitor picks a date
  const activeDate =
    date && workingWeekdays.has(weekdayOf(date))
      ? date
      : (days.find((day) => workingWeekdays.has(weekdayOf(day))) ?? null);

  const slots = useSlots({
    serviceId,
    doctorId: doctorChoice === ANY_DOCTOR ? null : doctorChoice,
    date: step >= 2 && doctorChoice ? activeDate : null,
    refreshToken,
  });
  const timeIsAvailable =
    time !== null && slots.status === "ready" && slots.slots.some((slot) => slot.time === time);

  const maxReachable = !serviceId ? 0 : !doctorChoice ? 1 : !timeIsAvailable ? 2 : 3;
  const canContinue = step < 3 && step < maxReachable;

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectService(id: string) {
    const offering = catalog.doctors.filter((doctor) => doctor.serviceIds.includes(id));
    setServiceId(id);
    setTime(null);
    if (offering.length === 1) {
      setDoctorChoice(offering[0].id);
    } else if (doctorChoice !== ANY_DOCTOR && !offering.some((doctor) => doctor.id === doctorChoice)) {
      setDoctorChoice(null);
    }
    goTo(1);
  }

  function selectDoctor(value: string) {
    setDoctorChoice(value);
    setTime(null);
    goTo(2);
  }

  function selectTime(value: string) {
    setTime(value);
    goTo(3);
  }

  if (state.status === "success") {
    const bookedService = catalog.services.find((item) => item.id === state.appointment.serviceId);
    return (
      <BookingSuccess
        appointment={state.appointment}
        durationMinutes={bookedService?.durationMinutes ?? 60}
        onReset={onReset}
      />
    );
  }

  const currentKey = `${activeDate}|${time}`;
  const visibleState: BookingState = submittedFor === currentKey ? state : initialState;

  return (
    <div>
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
          <span className="h-px w-6 bg-primary/60" aria-hidden />
          {t("eyebrow")}
        </span>
        <h1 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-lg text-muted">{t("subtitle")}</p>
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Scroll target on step change: keeps the stepper and the new step in view */}
        <div ref={topRef} className="min-w-0 scroll-mt-24">
          <Stepper current={step} maxReachable={maxReachable} onNavigate={goTo} />

          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface p-5 sm:p-8">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={BOOKING_STEPS[step]}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 && (
                  <StepService
                    services={catalog.services}
                    selectedId={serviceId}
                    onSelect={selectService}
                  />
                )}
                {step === 1 && (
                  <StepDoctor
                    doctors={doctorsForService}
                    selected={doctorChoice}
                    onSelect={selectDoctor}
                  />
                )}
                {step === 2 && (
                  <StepDateTime
                    days={days}
                    workingWeekdays={workingWeekdays}
                    selectedDate={activeDate}
                    selectedTime={time}
                    slots={slots}
                    onSelectDate={(value) => {
                      setDate(value);
                      setTime(null);
                    }}
                    onSelectTime={selectTime}
                    onRetry={() => setRefreshToken((value) => value + 1)}
                  />
                )}
                {step === 3 && serviceId && activeDate && time && (
                  <StepContacts
                    action={(formData) => {
                      setSubmittedFor(currentKey);
                      formAction(formData);
                    }}
                    pending={pending}
                    state={visibleState}
                    values={contacts}
                    onChange={setContacts}
                    hidden={{
                      serviceId,
                      doctorId: doctorChoice === ANY_DOCTOR ? null : doctorChoice,
                      date: activeDate,
                      time,
                    }}
                    onChooseAnotherTime={() => {
                      setTime(null);
                      setRefreshToken((value) => value + 1);
                      goTo(2);
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className={step === 0 ? "invisible" : undefined}
              >
                <ArrowLeft className="size-4" aria-hidden />
                {t("prev")}
              </Button>
              {step < 3 && (
                <Button type="button" onClick={() => goTo(step + 1)} disabled={!canContinue}>
                  {t("next")}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </div>

        <BookingSummary
          service={service}
          doctorChoice={doctorChoice}
          date={step >= 2 ? activeDate : null}
          time={timeIsAvailable ? time : null}
        />
      </div>
    </div>
  );
}
