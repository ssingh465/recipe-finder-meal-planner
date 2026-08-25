// A Set backs the hot path — isFavorited runs ~24x per discovery render.
import { SvelteSet } from 'svelte/reactivity';
import { readKey, writeKey } from '$lib/storage/local';

const KEY = 'rfmp:favorites';

const ids = new SvelteSet<string>();
let hydrated = $state(false);

export const favorites = {
	get hydrated() {
		return hydrated;
	},
	get size() {
		return ids.size;
	},

	/** O(1). */
	has(id: string): boolean {
		return ids.has(id);
	},

	/** Insertion-ordered array for rendering. */
	list(): string[] {
		return [...ids];
	},

	hydrate() {
		if (hydrated) return; // readKey is a no-op on the server
		for (const id of readKey<string[]>(KEY, [])) ids.add(id);
		hydrated = true;
	},

	toggle(id: string) {
		if (ids.has(id)) ids.delete(id);
		else ids.add(id);
		writeKey(KEY, [...ids]); // always an array — a Set serializes to `{}`, never persist it directly
	},

	/** Idempotent. Cascade target for recipeService.remove(). */
	remove(id: string) {
		if (!ids.has(id)) return;
		ids.delete(id);
		writeKey(KEY, [...ids]);
	}
};
