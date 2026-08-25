import { describe, expect, it, vi } from 'vitest';
import type { RecipeSummary } from '$lib/domain/recipe';
import type { DiscoveryDeps } from './discovery';
import { resolveDiscoveryCandidates } from './discovery';

function summary(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
	return {
		id: '1',
		source: 'api',
		name: 'Recipe',
		thumbnail: null,
		category: null,
		area: null,
		...overrides
	};
}

function makeDeps(overrides: Partial<DiscoveryDeps> = {}): DiscoveryDeps {
	return {
		search: vi.fn(async () => ({ ok: true as const, data: [] })),
		browse: vi.fn(async () => ({ ok: true as const, data: [] })),
		filterByCategory: vi.fn(async () => ({ ok: true as const, data: [] })),
		filterByArea: vi.fn(async () => ({ ok: true as const, data: [] })),
		...overrides
	};
}

describe('resolveDiscoveryCandidates — endpoint selection', () => {
	it('calls search.php when a search term is present, and nothing else', async () => {
		const deps = makeDeps();

		await resolveDiscoveryCandidates({ q: 'chicken', category: null, area: null }, undefined, undefined, deps);

		expect(deps.search).toHaveBeenCalledWith('chicken', undefined, undefined);
		expect(deps.filterByCategory).not.toHaveBeenCalled();
		expect(deps.filterByArea).not.toHaveBeenCalled();
		expect(deps.browse).not.toHaveBeenCalled();
	});

	it('calls filter.php?c= when only category is active, and nothing else', async () => {
		const deps = makeDeps();

		await resolveDiscoveryCandidates({ q: '', category: 'Chicken', area: null }, undefined, undefined, deps);

		expect(deps.filterByCategory).toHaveBeenCalledWith('Chicken', undefined, undefined);
		expect(deps.search).not.toHaveBeenCalled();
		expect(deps.filterByArea).not.toHaveBeenCalled();
		expect(deps.browse).not.toHaveBeenCalled();
	});

	it('calls filter.php?a= when only area is active, and nothing else', async () => {
		const deps = makeDeps();

		await resolveDiscoveryCandidates({ q: '', category: null, area: 'Japanese' }, undefined, undefined, deps);

		expect(deps.filterByArea).toHaveBeenCalledWith('Japanese', undefined, undefined);
		expect(deps.search).not.toHaveBeenCalled();
		expect(deps.filterByCategory).not.toHaveBeenCalled();
		expect(deps.browse).not.toHaveBeenCalled();
	});

	it('calls search.php?s= (browse default) when nothing is active', async () => {
		const deps = makeDeps();

		await resolveDiscoveryCandidates({ q: '', category: null, area: null }, undefined, undefined, deps);

		expect(deps.browse).toHaveBeenCalledOnce();
		expect(deps.search).not.toHaveBeenCalled();
		expect(deps.filterByCategory).not.toHaveBeenCalled();
		expect(deps.filterByArea).not.toHaveBeenCalled();
	});

	it('category outranks area — both active with no search calls filter.php?c= only', async () => {
		const deps = makeDeps();

		await resolveDiscoveryCandidates(
			{ q: '', category: 'Chicken', area: 'Japanese' },
			undefined,
			undefined,
			deps
		);

		expect(deps.filterByCategory).toHaveBeenCalledWith('Chicken', undefined, undefined);
		expect(deps.filterByArea).not.toHaveBeenCalled();
	});
});

describe('resolveDiscoveryCandidates — in-memory refinement', () => {
	it('refines a search response by category and area together', async () => {
		const deps = makeDeps({
			search: vi.fn(async () => ({
				ok: true as const,
				data: [
					summary({ id: '1', category: 'Chicken', area: 'Japanese' }),
					summary({ id: '2', category: 'Chicken', area: 'Italian' }),
					summary({ id: '3', category: 'Beef', area: 'Japanese' })
				]
			}))
		});

		const result = await resolveDiscoveryCandidates(
			{ q: 'teriyaki', category: 'Chicken', area: 'Japanese' },
			undefined,
			undefined,
			deps
		);

		expect(result.ok).toBe(true);
		expect(result.ok && result.data.map((r) => r.id)).toEqual(['1']);
	});

	it('refines a category response by area only (the one field filter.php?c= carries)', async () => {
		const deps = makeDeps({
			filterByCategory: vi.fn(async () => ({
				ok: true as const,
				data: [
					summary({ id: '1', category: 'Chicken', area: 'Japanese' }),
					summary({ id: '2', category: 'Chicken', area: 'Italian' })
				]
			}))
		});

		const result = await resolveDiscoveryCandidates(
			{ q: '', category: 'Chicken', area: 'Japanese' },
			undefined,
			undefined,
			deps
		);

		expect(result.ok).toBe(true);
		expect(result.ok && result.data.map((r) => r.id)).toEqual(['1']);
	});

	it('does not filter an area-only response — nothing is left to refine by', async () => {
		const data = [summary({ id: '1', area: 'Japanese' }), summary({ id: '2', area: 'Japanese' })];
		const deps = makeDeps({ filterByArea: vi.fn(async () => ({ ok: true as const, data })) });

		const result = await resolveDiscoveryCandidates(
			{ q: '', category: null, area: 'Japanese' },
			undefined,
			undefined,
			deps
		);

		expect(result.ok).toBe(true);
		expect(result.ok && result.data).toEqual(data);
	});
});

describe('resolveDiscoveryCandidates — truncation and failure', () => {
	it('carries the truncation flag through in-memory refinement', async () => {
		const deps = makeDeps({
			filterByCategory: vi.fn(async () => ({
				ok: true as const,
				data: [summary({ id: '1', category: 'Chicken', area: 'Japanese' })],
				truncated: true
			}))
		});

		const result = await resolveDiscoveryCandidates(
			{ q: '', category: 'Chicken', area: 'Japanese' },
			undefined,
			undefined,
			deps
		);

		expect(result.ok && result.truncated).toBe(true);
	});

	it('returns a failure result untouched, without attempting to refine it', async () => {
		const failure = { ok: false as const, kind: 'network' as const, message: 'offline' };
		const deps = makeDeps({ search: vi.fn(async () => failure) });

		const result = await resolveDiscoveryCandidates(
			{ q: 'chicken', category: 'Chicken', area: null },
			undefined,
			undefined,
			deps
		);

		expect(result).toEqual(failure);
	});
});
