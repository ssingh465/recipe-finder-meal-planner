// API recipes have nothing to edit server-side — the recipe exists (not 404) and
// there's no authorization system to violate (not 403), so a numeric id just goes
// back to its own details page.
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

function isUserRecipeId(id: string): boolean {
	return id.startsWith('usr_');
}

export const load: PageLoad = ({ params }) => {
	const { id } = params;

	if (!isUserRecipeId(id)) {
		redirect(303, `/recipes/${id}`);
	}

	return { id };
};
