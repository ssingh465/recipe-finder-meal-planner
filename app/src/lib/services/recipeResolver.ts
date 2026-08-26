// Resolves a list of ids (a mix of `usr_*` and numeric) to their recipes for
// screens that store only ids, not copies — Favorites now, the Planner later.
// Each id resolves independently so one failed lookup never blocks the rest.
import * as mealDbClient from '$lib/api/mealDbClient';
import type { Recipe } from '$lib/domain/recipe';
import { recipes } from '$lib/stores/recipes.svelte';

export interface ResolvedRecipe {
	id: string;
	recipe: Recipe | undefined;
	failed: boolean;
}

function isUserRecipeId(id: string): boolean {
	return id.startsWith('usr_');
}

export async function resolveRecipeIds(
	ids: string[],
	signal?: AbortSignal
): Promise<ResolvedRecipe[]> {
	return Promise.all(
		ids.map(async (id): Promise<ResolvedRecipe> => {
			if (isUserRecipeId(id)) {
				const recipe = recipes.byId(id);
				return { id, recipe, failed: !recipe };
			}
			const result = await mealDbClient.lookup(id, signal);
			return result.ok ? { id, recipe: result.data, failed: false } : { id, recipe: undefined, failed: true };
		})
	);
}
