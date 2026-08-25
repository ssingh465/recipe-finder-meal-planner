/** Days of the week, Monday-first (ISO 8601). Also the key set of `rfmp:plan`. */
export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type DayOfWeek = (typeof DAYS)[number];

/** Full day names — used in toasts, the delete dialog, and planner headers. */
export const DAY_LABELS: Record<DayOfWeek, string> = {
	mon: 'Monday',
	tue: 'Tuesday',
	wed: 'Wednesday',
	thu: 'Thursday',
	fri: 'Friday',
	sat: 'Saturday',
	sun: 'Sunday'
};
