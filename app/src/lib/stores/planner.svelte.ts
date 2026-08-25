// TRD §4.4.1. Module is `planner.svelte.ts`; the exported binding is `plan` (both names
// appear throughout the planning docs and refer to the same thing).
import { readKey, writeKey } from '$lib/storage/local';
import { DAYS, type DayOfWeek } from '$lib/domain/day';

const KEY = 'rfmp:plan';

type Week = Record<DayOfWeek, string[]>;

function emptyWeek(): Week {
	return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

let week = $state<Week>(emptyWeek());
let hydrated = $state(false);

// O(1) duplicate check per day (DATA-MODEL §6.2) — recomputed only when `week` changes.
const daySets = $derived<Record<DayOfWeek, Set<string>>>(
	Object.fromEntries(DAYS.map((day) => [day, new Set(week[day])])) as Record<DayOfWeek, Set<string>>
);

export const plan = {
	get hydrated() {
		return hydrated;
	},

	/** Ordered; assign appends. */
	day(day: DayOfWeek): string[] {
		return week[day];
	},

	/** O(1). */
	has(day: DayOfWeek, recipeId: string): boolean {
		return daySets[day].has(recipeId);
	},

	daysContaining(recipeId: string): DayOfWeek[] {
		return DAYS.filter((day) => daySets[day].has(recipeId));
	},

	hydrate() {
		if (hydrated) return;
		// All seven keys always exist, `[]` when empty — even if a stored/corrupt shape is partial.
		week = { ...emptyWeek(), ...readKey<Partial<Week>>(KEY, {}) };
		hydrated = true;
	},

	/** `false` and no-op if the day already holds this id (DATA-MODEL §4.2). */
	assign(day: DayOfWeek, recipeId: string): boolean {
		if (daySets[day].has(recipeId)) return false;
		week = { ...week, [day]: [...week[day], recipeId] };
		writeKey(KEY, week);
		return true;
	},

	remove(day: DayOfWeek, recipeId: string): void {
		if (!daySets[day].has(recipeId)) return;
		week = { ...week, [day]: week[day].filter((id) => id !== recipeId) };
		writeKey(KEY, week);
	},

	/**
	 * `false` if `fromDay` doesn't hold the id, or `toDay` already does. Otherwise
	 * atomic — one state update, never remove-then-assign (D-18): that would open a
	 * window where the entry exists in neither day, or in both if the ordering flips.
	 */
	move(recipeId: string, fromDay: DayOfWeek, toDay: DayOfWeek): boolean {
		if (!daySets[fromDay].has(recipeId) || daySets[toDay].has(recipeId)) return false;
		week = {
			...week,
			[fromDay]: week[fromDay].filter((id) => id !== recipeId),
			[toDay]: [...week[toDay], recipeId]
		};
		writeKey(KEY, week);
		return true;
	},

	/** Cascade target for recipeService.remove() (DATA-MODEL §5.3). Returns the cleared days. */
	removeEverywhere(recipeId: string): DayOfWeek[] {
		const affected = plan.daysContaining(recipeId);
		if (affected.length === 0) return [];
		const next = { ...week };
		for (const day of affected) next[day] = next[day].filter((id) => id !== recipeId);
		week = next;
		writeKey(KEY, week);
		return affected;
	}
};
