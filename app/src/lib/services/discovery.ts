// Candidate-set resolution — exactly one list request per state change, every other
// active filter refines the response in memory. Superseded design (a filter.php call
// per active dimension, intersected on idMeal) is unsound under TheMealDB's silent
// 100-item cap: both sides arrive truncated, so the intersection drops valid matches
// invisibly. One call means one cap, applied on a single dimension, never compounded.
import * as mealDbClient from '$lib/api/mealDbClient';
import type { RecipeSummary } from '$lib/domain/recipe';
import type { Result } from '$lib/domain/result';

export interface DiscoveryFilters {
	q: string;
	category: string | null;
	area: string | null;
}

export interface DiscoveryDeps {
	search: typeof mealDbClient.search;
	browse: typeof mealDbClient.browse;
	filterByCategory: typeof mealDbClient.filterByCategory;
	filterByArea: typeof mealDbClient.filterByArea;
}

const defaultDeps: DiscoveryDeps = mealDbClient;

function byCategory(list: RecipeSummary[], category: string): RecipeSummary[] {
	return list.filter((recipe) => recipe.category === category);
}

function byArea(list: RecipeSummary[], area: string): RecipeSummary[] {
	return list.filter((recipe) => recipe.area === area);
}

/**
 * Category outranks area as the server-side dimension: `filter.php?c=` carries
 * `strArea` in its payload, but `filter.php?a=` never carries `strCategory` — so
 * category is the only filter response that can still be refined along the other
 * axis in memory.
 */
export async function resolveDiscoveryCandidates(
	filters: DiscoveryFilters,
	signal?: AbortSignal,
	fetchImpl?: typeof fetch,
	deps: DiscoveryDeps = defaultDeps
): Promise<Result<RecipeSummary[]>> {
	const query = filters.q.trim();

	if (query) {
		const result = await deps.search(query, signal, fetchImpl);
		if (!result.ok) return result;
		let data = result.data;
		if (filters.category) data = byCategory(data, filters.category);
		if (filters.area) data = byArea(data, filters.area);
		return { ...result, data };
	}

	if (filters.category) {
		const result = await deps.filterByCategory(filters.category, signal, fetchImpl);
		if (!result.ok) return result;
		const data = filters.area ? byArea(result.data, filters.area) : result.data;
		return { ...result, data };
	}

	if (filters.area) {
		return deps.filterByArea(filters.area, signal, fetchImpl); // nothing left to refine
	}

	return deps.browse(signal, fetchImpl);
}
