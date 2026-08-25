// Composes the three stores — this is what makes the delete cascade atomic across
// recipes, favorites and the plan. Stores never call this; the dependency runs one
// way, service -> stores.
import * as mealDbClient from '$lib/api/mealDbClient';
import type { DayOfWeek } from '$lib/domain/day';
import type { Recipe, RecipeInput } from '$lib/domain/recipe';
import type { Result } from '$lib/domain/result';
import { favorites } from '$lib/stores/favorites.svelte';
import { plan } from '$lib/stores/planner.svelte';
import { recipes } from '$lib/stores/recipes.svelte';
import { isValid, validateRecipeInput } from './validation';

function isUserRecipeId(id: string): boolean {
	return id.startsWith('usr_');
}

export const recipeService = {
	async getById(id: string, signal?: AbortSignal): Promise<Result<Recipe>> {
		if (isUserRecipeId(id)) {
			const recipe = recipes.byId(id);
			return recipe
				? { ok: true, data: recipe }
				: { ok: false, kind: 'notfound', message: `No recipe found for id ${id}.` };
		}
		return mealDbClient.lookup(id, signal);
	},

	create(input: RecipeInput): Result<Recipe> {
		const fields = validateRecipeInput(input);
		if (!isValid(fields)) {
			return { ok: false, kind: 'validation', message: 'Fix the highlighted fields.', fields };
		}
		return { ok: true, data: recipes.add(input) };
	},

	update(id: string, input: RecipeInput): Result<Recipe> {
		const fields = validateRecipeInput(input);
		if (!isValid(fields)) {
			return { ok: false, kind: 'validation', message: 'Fix the highlighted fields.', fields };
		}
		const updated = recipes.update(id, input);
		return updated
			? { ok: true, data: updated }
			: { ok: false, kind: 'notfound', message: `No recipe found for id ${id}.` };
	},

	/**
	 * Pure read — computes the cascade without applying it, so the confirmation
	 * dialog can itemise consequences before the user commits, and Cancel changes nothing.
	 */
	previewRemoval(id: string): { unfavorited: boolean; clearedDays: DayOfWeek[] } {
		return {
			unfavorited: favorites.has(id),
			clearedDays: plan.daysContaining(id)
		};
	},

	remove(id: string): Result<void> {
		if (!recipes.byId(id)) {
			return { ok: false, kind: 'notfound', message: `No recipe found for id ${id}.` };
		}
		favorites.remove(id);
		plan.removeEverywhere(id);
		recipes.remove(id);
		return { ok: true, data: undefined };
	}
};
