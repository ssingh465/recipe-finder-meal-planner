// The server can resolve a numeric id but has no way to resolve a `usr_*` one
// (that recipe lives only in the browser's store), so this never attempts a
// fetch for it — the page resolves that case client-side, after hydration.
import { error } from '@sveltejs/kit';
import * as mealDbClient from '$lib/api/mealDbClient';
import type { PageLoad } from './$types';

function isUserRecipeId(id: string): boolean {
	return id.startsWith('usr_');
}

export const load: PageLoad = async ({ params, fetch }) => {
	const { id } = params;

	if (isUserRecipeId(id)) {
		return { source: 'user' as const, id };
	}

	const result = await mealDbClient.lookup(id, undefined, fetch);
	if (!result.ok && result.kind === 'notfound') {
		error(404, 'Recipe not found');
	}
	return { source: 'api' as const, id, result };
};
