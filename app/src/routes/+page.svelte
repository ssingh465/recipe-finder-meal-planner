<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import ScaffoldIndex from '$lib/components/scaffolds/ScaffoldIndex.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { AREAS, CATEGORIES } from '$lib/domain/filter-options.generated';
	import { DAYS, DAY_LABELS, type DayOfWeek } from '$lib/domain/day';
	import { paginate } from '$lib/domain/discoveryQuery';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { gridColumns } from '$lib/utils/gridColumns.svelte';
	import type {
		DayOption,
		DayPickerCustomEvent,
		RecipeCardCustomEvent
	} from '@ssingh465/recipe-ui/components';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const categoryOptions = [
		{ value: '', label: 'All categories' },
		...CATEGORIES.map((category) => ({ value: category, label: category }))
	];
	const areaOptions = [
		{ value: '', label: 'All areas' },
		...AREAS.map((area) => ({ value: area, label: area }))
	];

	const columns = gridColumns();

	// SvelteKit keeps the previous `data` until a new navigation's `load` resolves,
	// so this is genuinely "the last successful result" while `navigating` is truthy.
	const hadPriorResults = $derived(data.result.ok && data.result.data.length > 0);
	const isPending = $derived(!!navigating.to);
	const isLoading = $derived(isPending && !hadPriorResults);
	const isRefreshing = $derived(isPending && hadPriorResults);

	const pageInfo = $derived(data.result.ok ? paginate(data.result.data, data.query.page) : null);
	const visibleItems = $derived(pageInfo?.items ?? []);

	const hasFilters = $derived(!!(data.query.category || data.query.area));

	// A writable derived: typing overrides it locally (immediate feedback before the
	// 300ms debounce commits), and it snaps back to the URL on external navigation
	// (back/forward, Clear search/all) the moment `data.query.q` changes.
	let searchValue = $derived(data.query.q);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let resultsHeading = $state<HTMLHeadingElement>();

	function navigate(mutate: (url: URL) => void, opts: { replace?: boolean } = {}) {
		const url = new URL(page.url);
		mutate(url);
		return goto(url, { replaceState: opts.replace ?? false, keepFocus: true, noScroll: true });
	}

	function resetPage(url: URL) {
		url.searchParams.delete('page');
	}

	function commitSearch(value: string, opts: { replace?: boolean } = {}) {
		return navigate((url) => {
			const trimmed = value.trim();
			if (trimmed) url.searchParams.set('q', trimmed);
			else url.searchParams.delete('q');
			resetPage(url);
		}, opts);
	}

	function onSearchInput(value: string) {
		searchValue = value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => commitSearch(value, { replace: true }), 300);
	}

	function onSearchKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		clearTimeout(debounceTimer);
		commitSearch(searchValue, { replace: true });
	}

	function clearSearch() {
		clearTimeout(debounceTimer);
		searchValue = '';
		commitSearch('');
	}

	function setCategory(value: string) {
		navigate((url) => {
			if (value) url.searchParams.set('category', value);
			else url.searchParams.delete('category');
			resetPage(url);
		});
	}

	function setArea(value: string) {
		navigate((url) => {
			if (value) url.searchParams.set('area', value);
			else url.searchParams.delete('area');
			resetPage(url);
		});
	}

	function removeFilter(dimension: 'category' | 'area') {
		navigate((url) => {
			url.searchParams.delete(dimension);
			resetPage(url);
		});
	}

	function clearAllFilters() {
		navigate((url) => {
			url.searchParams.delete('category');
			url.searchParams.delete('area');
			resetPage(url);
		});
	}

	async function goToPage(nextPage: number) {
		await navigate((url) => {
			url.searchParams.set('page', String(nextPage));
		});
		resultsHeading?.focus();
	}

	function retry() {
		invalidateAll();
	}

	function dayOptionsFor(recipeId: string): DayOption[] {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({ day, label: DAY_LABELS[day], occupied: occupied.has(day) }));
	}

	function handleFavoriteToggle(recipeId: string) {
		favorites.toggle(recipeId);
	}

	function handleRecipeSelect(recipeId: string) {
		goto(`/recipes/${recipeId}`);
	}

	function handlePlanAssign(recipeId: string, day: DayOfWeek, recipeName: string) {
		if (!plan.assign(day, recipeId)) return;
		addToast(`Added ${recipeName} to ${DAY_LABELS[day]}.`);
	}
</script>

<svelte:head>
	<title>Discover recipes</title>
</svelte:head>

<ScaffoldIndex title="Discover">
	{#snippet controls()}
		<div class="search-field">
			<label for="discovery-search">Search recipes</label>
			<div class="search-input-wrap">
				<input
					id="discovery-search"
					type="search"
					placeholder="Search recipes by name"
					value={searchValue}
					oninput={(event) => onSearchInput(event.currentTarget.value)}
					onkeydown={onSearchKeydown}
				/>
				{#if searchValue}
					<button type="button" class="clear-search" aria-label="Clear search" onclick={clearSearch}>
						<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
							<path
								d="M6 6l12 12M18 6L6 18"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<div class="filter-row">
			<Select
				label="Category"
				options={categoryOptions}
				value={data.query.category ?? ''}
				onchange={(event) => setCategory(event.currentTarget.value)}
			/>
			<Select
				label="Area"
				options={areaOptions}
				value={data.query.area ?? ''}
				onchange={(event) => setArea(event.currentTarget.value)}
			/>
		</div>

		{#if hasFilters}
			<div class="active-filters" role="group" aria-label="Active filters">
				{#if data.query.category}
					<filter-chip
						label={data.query.category}
						value={data.query.category}
						dimension="category"
						onchiptoggle={() => removeFilter('category')}
					></filter-chip>
				{/if}
				{#if data.query.area}
					<filter-chip
						label={data.query.area}
						value={data.query.area}
						dimension="area"
						onchiptoggle={() => removeFilter('area')}
					></filter-chip>
				{/if}
				<Button variant="ghost" size="sm" onclick={clearAllFilters}>Clear all</Button>
			</div>
		{/if}
	{/snippet}

	{#snippet notice()}
		{#if data.result.ok && data.result.truncated}
			<p class="truncation-notice" role="status">
				Showing the first 100 matches. Narrow your search or filters to see more.
			</p>
		{/if}
	{/snippet}

	{#snippet content()}
		{#if isLoading}
			<recipe-grid columns={columns.value}>
				<skeleton-card count={8}></skeleton-card>
			</recipe-grid>
		{:else if !data.result.ok}
			<div class="state-block">
				<h2>{data.result.kind === 'network' ? "Couldn't load recipes" : 'Something went wrong'}</h2>
				<p>
					{data.result.kind === 'network'
						? 'Check your connection and try again.'
						: 'The recipe service returned an unexpected response.'}
				</p>
				<Button onclick={retry}>Retry</Button>
			</div>
		{:else if data.result.data.length === 0}
			{#if hasFilters}
				<empty-state heading="No recipes match these filters">
					<p>Try removing a filter to see more results.</p>
					<Button slot="action" onclick={clearAllFilters}>Clear all filters</Button>
				</empty-state>
			{:else}
				<empty-state heading="No recipes found">
					<p>No recipes match "{data.query.q}". Try a different search term.</p>
					<Button slot="action" onclick={clearSearch}>Clear search</Button>
				</empty-state>
			{/if}
		{:else}
			<div class:refreshing={isRefreshing}>
				<h2 bind:this={resultsHeading} tabindex="-1" class="visually-hidden">Results</h2>
				<recipe-grid columns={columns.value}>
					{#each visibleItems as recipe (recipe.id)}
						<recipe-card
							recipe={recipe}
							favorited={favorites.has(recipe.id)}
							href={`/recipes/${recipe.id}`}
							onfavoritetoggle={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
								handleFavoriteToggle(event.detail.recipeId)}
							onrecipeselect={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
								handleRecipeSelect(event.detail.recipeId)}
						>
							<day-picker
								slot="actions"
								recipeId={recipe.id}
								days={dayOptionsFor(recipe.id)}
								label="Add to plan"
								onplanassign={(event: DayPickerCustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
									handlePlanAssign(event.detail.recipeId, event.detail.day, recipe.name)}
							></day-picker>
						</recipe-card>
					{/each}
				</recipe-grid>
			</div>
		{/if}
	{/snippet}

	{#snippet pagination()}
		{#if pageInfo && pageInfo.totalPages > 1}
			<nav aria-label="Pagination" class="pagination-nav">
				<Button
					variant="secondary"
					size="sm"
					aria-label="Previous page"
					disabled={pageInfo.page <= 1}
					onclick={() => goToPage(pageInfo!.page - 1)}
				>
					Previous
				</Button>
				<span>Page {pageInfo.page} of {pageInfo.totalPages}</span>
				<Button
					variant="secondary"
					size="sm"
					aria-label="Next page"
					disabled={pageInfo.page >= pageInfo.totalPages}
					onclick={() => goToPage(pageInfo!.page + 1)}
				>
					Next
				</Button>
			</nav>
		{/if}
	{/snippet}
</ScaffoldIndex>

<style>
	.search-field {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
		max-width: 32rem;
	}

	.search-field label {
		font-size: var(--fs-sm);
		font-weight: 500;
		color: var(--c-text);
	}

	.search-input-wrap {
		position: relative;
		display: flex;
	}

	.search-input-wrap input {
		flex: 1;
		min-height: 44px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-sm);
		padding-inline: var(--s-3);
		padding-inline-end: var(--s-7);
		font-family: var(--font-text);
		font-size: var(--fs-body);
		color: var(--c-text);
	}

	.search-input-wrap input:focus-visible {
		border-color: var(--c-accent);
	}

	.clear-search {
		position: absolute;
		top: 50%;
		right: var(--s-2);
		transform: translateY(-50%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		color: var(--c-text-muted);
		cursor: pointer;
		border-radius: var(--r-sm);
	}

	.filter-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
	}

	.filter-row :global(.field) {
		min-width: 12rem;
	}

	.active-filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.truncation-notice {
		margin: 0;
		padding: var(--s-3) var(--s-4);
		background: var(--c-surface-sunken);
		color: var(--c-text-muted);
		border-radius: var(--r-sm);
		font-size: var(--fs-sm);
	}

	.refreshing {
		opacity: 0.5;
		transition: opacity var(--dur-base) var(--ease);
	}

	.state-block {
		max-width: 32rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-3);
		padding-block: var(--s-6);
	}

	.pagination-nav {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
