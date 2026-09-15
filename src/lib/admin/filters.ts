/** Filter constants shared by server queries and client filter controls. */
export const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export const RANGES = ["upcoming", "today", "week", "past", "all"] as const;
export type RangeFilter = (typeof RANGES)[number];
export const PAGE_SIZE = 15;
