/** Days of the week, Monday-first (ISO 8601). Also the key set of `rfmp:plan`. */
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type DayOfWeek = (typeof DAYS)[number];
