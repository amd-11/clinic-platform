"use client";

import { useTranslations } from "next-intl";
import type { doctors, services } from "@/lib/site-data";

type ServiceKey = (typeof services)[number]["id"];
type DoctorKey = (typeof doctors)[number]["id"];

/**
 * Service and doctor ids come from the database as plain strings.
 * These helpers map them to translated labels in one typed place.
 */
export function useCatalogLabels() {
  const tServices = useTranslations("services.items");
  const tDoctors = useTranslations("doctors.items");

  return {
    serviceTitle: (id: string) => tServices(`${id as ServiceKey}.title`),
    serviceDescription: (id: string) => tServices(`${id as ServiceKey}.description`),
    doctorName: (id: string) => tDoctors(`${id as DoctorKey}.name`),
    doctorRole: (id: string) => tDoctors(`${id as DoctorKey}.role`),
  };
}

export function initials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}
