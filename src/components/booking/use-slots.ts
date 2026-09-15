"use client";

import { useEffect, useState } from "react";
import type { Slot } from "@/lib/booking/availability";

type SlotsResult =
  | { key: string; status: "ready"; slots: Slot[] }
  | { key: string; status: "error"; unavailable: boolean };

type SlotsQuery = {
  serviceId: string | null;
  doctorId: string | null; // null = any doctor
  date: string | null;
  /** Change to force a refetch, e.g. after "slot already taken". */
  refreshToken: number;
};

/**
 * Loads free time slots for the selected service, doctor and date.
 * Results are keyed by the query, so a stale response can never overwrite a newer one.
 */
export function useSlots({ serviceId, doctorId, date, refreshToken }: SlotsQuery) {
  const key = serviceId && date ? `${serviceId}|${doctorId ?? ""}|${date}|${refreshToken}` : null;
  const [result, setResult] = useState<SlotsResult | null>(null);

  useEffect(() => {
    if (!key || !serviceId || !date) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ service: serviceId, date });
    if (doctorId) params.set("doctor", doctorId);

    fetch(`/api/slots?${params}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          setResult({ key, status: "error", unavailable: response.status === 503 });
          return;
        }
        const data = (await response.json()) as { slots: Slot[] };
        setResult({ key, status: "ready", slots: data.slots });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setResult({ key, status: "error", unavailable: false });
      });

    return () => controller.abort();
  }, [key, serviceId, doctorId, date]);

  if (!key) return { status: "idle" as const };
  if (!result || result.key !== key) return { status: "loading" as const };
  return result;
}
