// Discovery's filter/search/page state lives in URL search params, so a filtered,
// paginated view is shareable, refresh-safe, and correct under back/forward.
export interface DiscoveryQuery {
	q: string;
	category: string | null;
	area: string | null;
	page: number;
}

/** 24 results per page, explicit pagination — not infinite scroll. */
export const PAGE_SIZE = 24;

export function parseDiscoveryQuery(url: URL): DiscoveryQuery {
	const q = url.searchParams.get('q')?.trim() ?? '';
	const category = url.searchParams.get('category');
	const area = url.searchParams.get('area');
	const rawPage = Number(url.searchParams.get('page'));
	const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
	return { q, category, area, page };
}

export interface Page<T> {
	items: T[];
	page: number;
	totalPages: number;
}

/** Clamps an out-of-range page (e.g. a stale bookmark) into the valid range. */
export function paginate<T>(items: T[], page: number): Page<T> {
	const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	const clampedPage = Math.min(Math.max(1, page), totalPages);
	const start = (clampedPage - 1) * PAGE_SIZE;
	return { items: items.slice(start, start + PAGE_SIZE), page: clampedPage, totalPages };
}
