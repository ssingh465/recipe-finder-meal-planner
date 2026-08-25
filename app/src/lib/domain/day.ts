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

/** 3-letter form — planner column headers only; the accessible name stays full. */
export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
	mon: 'Mon',
	tue: 'Tue',
	wed: 'Wed',
	thu: 'Thu',
	fri: 'Fri',
	sat: 'Sat',
	sun: 'Sun'
};

/**
 * Delete-dialog day list: the full name alone for one day, otherwise the
 * short forms joined as `Mon and Tue` / `Mon, Tue and Thu`.
 */
export function formatDayList(days: DayOfWeek[]): string {
	if (days.length === 0) return '';
	if (days.length === 1) return DAY_LABELS[days[0]];
	const short = days.map((day) => DAY_LABELS_SHORT[day]);
	return `${short.slice(0, -1).join(', ')} and ${short[short.length - 1]}`;
}
