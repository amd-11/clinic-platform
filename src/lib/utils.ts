import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 15000 -> "15 000 ֏" */
export function formatAmd(value: number) {
  return `${value.toLocaleString("ru-RU").replace(/ /g, " ")} ֏`;
}
