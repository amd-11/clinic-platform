import {
  Baby,
  Microscope,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  ToothbrushSparkles,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  therapy: Microscope,
  implants: ShieldCheck,
  orthodontics: ScanLine,
  aesthetics: Sparkles,
  hygiene: ToothbrushSparkles,
  kids: Baby,
};

export function serviceIcon(serviceId: string): LucideIcon {
  return icons[serviceId] ?? Stethoscope;
}
