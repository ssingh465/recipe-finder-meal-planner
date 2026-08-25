// TheMealDB adapter — no auth, HTTPS only, one filter parameter per call.
import type { Recipe, RecipeSummary } from '$lib/domain/recipe';
import type { Result } from '$lib/domain/result';
import { toRecipe, toSummary, type FilterContext } from './normalize';
import type { RawMealsResponse } from './raw';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

interface RawCategoryListResponse {
	meals: { strCategory: string }[] | null;
}

async function fetchJson<T>(url: string, signal?: AbortSignal, fetchImpl: typeof fetch = fetch): Promise<Result<T>> {
	let response: Response;
	try {
		response = await fetchImpl(url, { signal });
	} catch (err) {
		// Rethrow aborts — a superseded request is not a failure to report; the caller's
		// newer request wins and this one's result is simply discarded.
		if (err instanceof DOMException && err.name === 'AbortError') throw err;
		return { ok: false, kind: 'network', message: 'Could not reach TheMealDB. Check your connection and try again.' };
	}
	if (!response.ok) {
		return { ok: false, kind: 'upstream', message: `TheMealDB returned an unexpected response (${response.status}).` };
	}
	try {
		return { ok: true, data: (await response.json()) as T };
	} catch {
		return { ok: false, kind: 'upstream', message: 'TheMealDB returned a response that could not be read.' };
	}
}

function toSummaryList(meals: RawMealsResponse['meals'], context?: FilterContext): RecipeSummary[] {
	// {"meals": null} is TheMealDB's empty result, not an error — it becomes [], not a Failure.
	return meals?.map((meal) => toSummary(meal, context)) ?? [];
}

export async function search(
	query: string,
	signal?: AbortSignal,
	fetchImpl?: typeof fetch
): Promise<Result<RecipeSummary[]>> {
	const result = await fetchJson<RawMealsResponse>(
		`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
		signal,
		fetchImpl
	);
	if (!result.ok) return result;
	return { ok: true, data: toSummaryList(result.data.meals) };
}

/** `search.php?s=` with no query — TheMealDB's browse default. */
export function browse(signal?: AbortSignal, fetchImpl?: typeof fetch): Promise<Result<RecipeSummary[]>> {
	return search('', signal, fetchImpl);
}

async function filterBy(
	param: 'c' | 'a',
	value: string,
	signal?: AbortSignal,
	fetchImpl?: typeof fetch
): Promise<Result<RecipeSummary[]>> {
	const context: FilterContext = param === 'c' ? { category: value } : { area: value };
	const result = await fetchJson<RawMealsResponse>(
		`${BASE_URL}/filter.php?${param}=${encodeURIComponent(value)}`,
		signal,
		fetchImpl
	);
	if (!result.ok) return result;
	const data = toSummaryList(result.data.meals, context);
	// filter.php caps silently at exactly 100 — flag it, never hide it.
	return data.length === 100 ? { ok: true, data, truncated: true } : { ok: true, data };
}

export function filterByCategory(
	category: string,
	signal?: AbortSignal,
	fetchImpl?: typeof fetch
): Promise<Result<RecipeSummary[]>> {
	return filterBy('c', category, signal, fetchImpl);
}

export function filterByArea(
	area: string,
	signal?: AbortSignal,
	fetchImpl?: typeof fetch
): Promise<Result<RecipeSummary[]>> {
	return filterBy('a', area, signal, fetchImpl);
}

export async function lookup(id: string, signal?: AbortSignal): Promise<Result<Recipe>> {
	const result = await fetchJson<RawMealsResponse>(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`, signal);
	if (!result.ok) return result;
	const meal = result.data.meals?.[0];
	if (!meal) return { ok: false, kind: 'notfound', message: `No recipe found for id ${id}.` };
	return { ok: true, data: toRecipe(meal) };
}

export async function listCategories(signal?: AbortSignal): Promise<Result<string[]>> {
	const result = await fetchJson<RawCategoryListResponse>(`${BASE_URL}/list.php?c=list`, signal);
	if (!result.ok) return result;
	return { ok: true, data: (result.data.meals ?? []).map((meal) => meal.strCategory) };
}

/** 300ms debounce for the search input. */
export function debounce<Args extends unknown[]>(
	fn: (...args: Args) => void,
	delayMs = 300
): (...args: Args) => void {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return (...args: Args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delayMs);
	};
}
