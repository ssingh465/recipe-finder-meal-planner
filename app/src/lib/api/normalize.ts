// The normalization boundary. Nothing above this module sees a `strIngredient17`.
import type { Ingredient, Recipe, RecipeSummary } from '$lib/domain/recipe';
import type { RawMeal } from './raw';

export interface FilterContext {
	category?: string;
	area?: string;
}

/** TheMealDB returns `""`, not `null`, for absent optional fields. */
function emptyToNull(value: string | null | undefined): string | null {
	if (value == null) return null;
	const trimmed = value.trim();
	return trimmed === '' ? null : value;
}

/**
 * Walks the 20 flat `strIngredient*`/`strMeasure*` pairs into an ordered array.
 * A blank or whitespace-only name is dropped even when a measure is present;
 * a present name with a blank measure is kept, with `measure: ''`.
 */
export function toIngredients(raw: RawMeal): Ingredient[] {
	const ingredients: Ingredient[] = [];
	for (let i = 1; i <= 20; i++) {
		const name = raw[`strIngredient${i}`];
		if (!name || !name.trim()) continue;
		const measure = raw[`strMeasure${i}`];
		ingredients.push({ name: name.trim(), measure: measure?.trim() ?? '' });
	}
	return ingredients;
}

/** `strTags` is comma-separated; absent or `""` yields `[]`, never `['']`. */
export function toTags(raw: RawMeal): string[] {
	if (!raw.strTags) return [];
	return raw.strTags
		.split(',')
		.map((tag) => tag.trim())
		.filter((tag) => tag.length > 0);
}

/**
 * `filter.php?c=` responses omit `strCategory`, so a card built from a
 * category-filtered response would otherwise show a blank category on the very screen
 * that filtered by it. `context` back-fills from the active filter that produced the row.
 */
export function toSummary(raw: RawMeal, context?: FilterContext): RecipeSummary {
	return {
		id: raw.idMeal,
		source: 'api',
		name: raw.strMeal,
		thumbnail: emptyToNull(raw.strMealThumb),
		category: emptyToNull(raw.strCategory ?? null) ?? context?.category ?? null,
		area: emptyToNull(raw.strArea ?? null) ?? context?.area ?? null
	};
}

export function toRecipe(raw: RawMeal, context?: FilterContext): Recipe {
	return {
		...toSummary(raw, context),
		instructions: raw.strInstructions ?? '',
		ingredients: toIngredients(raw),
		tags: toTags(raw),
		youtubeUrl: emptyToNull(raw.strYoutube),
		sourceUrl: emptyToNull(raw.strSource),
		// TheMealDB has no creation date; these fields are only meaningful for stored user recipes.
		createdAt: '',
		updatedAt: ''
	};
}
