// SSR via `load` — server-rendered first paint, no client waterfall. Using
// SvelteKit's own `fetch` also means a superseded navigation (the user changes the
// search/filter state again before this resolves) aborts the in-flight request for free.
import { parseDiscoveryQuery } from '$lib/domain/discoveryQuery';
import { resolveDiscoveryCandidates } from '$lib/services/discovery';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const query = parseDiscoveryQuery(url);
	const result = await resolveDiscoveryCandidates(
		{ q: query.q, category: query.category, area: query.area },
		undefined,
		fetch
	);
	return { query, result };
};
