// Holds user-created recipes only — API recipes are never persisted.
import { browser } from '$app/environment';
import { readKey, writeKey } from '$lib/storage/local';
import type { Recipe, RecipeInput } from '$lib/domain/recipe';

const KEY = 'rfmp:recipes';

function newRecipeId(): string {
	if (!browser) throw new Error('newRecipeId() must run in the browser');
	// eslint-disable-next-line no-restricted-globals -- guarded by `browser` above
	return `usr_${crypto.randomUUID()}`;
}

function nowIso(): string {
	return new Date().toISOString();
}

let items = $state<Recipe[]>([]);
let hydrated = $state(false);

// O(1) lookup by id — recomputed only when `items` changes.
const byIdMap = $derived(new Map(items.map((recipe) => [recipe.id, recipe])));

export const recipes = {
	get hydrated() {
		return hydrated;
	},

	byId(id: string): Recipe | undefined {
		return byIdMap.get(id);
	},

	/** Newest first, by `createdAt`. */
	list(): Recipe[] {
		return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	},

	hydrate() {
		if (hydrated) return;
		items = readKey<Recipe[]>(KEY, []);
		hydrated = true;
	},

	add(input: RecipeInput): Recipe {
		const now = nowIso();
		const recipe: Recipe = {
			id: newRecipeId(),
			source: 'user',
			name: input.name,
			category: input.category,
			area: input.area,
			instructions: input.instructions,
			ingredients: input.ingredients,
			thumbnail: null,
			tags: [],
			youtubeUrl: null,
			sourceUrl: null,
			createdAt: now,
			updatedAt: now
		};
		items = [...items, recipe];
		writeKey(KEY, items);
		return recipe;
	},

	update(id: string, input: RecipeInput): Recipe | undefined {
		const index = items.findIndex((recipe) => recipe.id === id);
		if (index === -1) return undefined;

		// id is immutable across updates; createdAt untouched, updatedAt refreshed.
		const updated: Recipe = { ...items[index], ...input, updatedAt: nowIso() };
		items = items.map((recipe, i) => (i === index ? updated : recipe));
		writeKey(KEY, items);
		return updated;
	},

	remove(id: string): void {
		if (!byIdMap.has(id)) return;
		items = items.filter((recipe) => recipe.id !== id);
		writeKey(KEY, items);
	}
};
