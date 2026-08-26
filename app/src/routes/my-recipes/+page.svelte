<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ScaffoldIndex from '$lib/components/scaffolds/ScaffoldIndex.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { DAYS, DAY_LABELS, formatDayList, type DayOfWeek } from '$lib/domain/day';
	import { paginate } from '$lib/domain/discoveryQuery';
	import type { Recipe } from '$lib/domain/recipe';
	import { recipeService } from '$lib/services/recipeService';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { gridColumns } from '$lib/utils/gridColumns.svelte';
	import type {
		DayPickerCustomEvent,
		RecipeCardCustomEvent
	} from '@ssingh465/recipe-ui/components';

	const columns = gridColumns();

	const currentPage = $derived(Number(page.url.searchParams.get('page')) || 1);
	const pageInfo = $derived(paginate(recipes.list(), currentPage));

	let deleteTarget = $state<Recipe | null>(null);

	function dayOptionsFor(recipeId: string) {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({ day, label: DAY_LABELS[day], occupied: occupied.has(day) }));
	}

	function handlePlanAssign(recipeId: string, day: DayOfWeek, recipeName: string) {
		if (!plan.assign(day, recipeId)) return;
		addToast(`Added ${recipeName} to ${DAY_LABELS[day]}.`);
	}

	function goToPage(nextPage: number) {
		const url = new URL(page.url);
		url.searchParams.set('page', String(nextPage));
		goto(url, { replaceState: false, noScroll: true });
	}

	function openDeleteModal(recipe: Recipe) {
		deleteTarget = recipe;
	}

	function closeDeleteModal() {
		deleteTarget = null;
	}

	function confirmDelete() {
		if (!deleteTarget) return;
		const { id, name } = deleteTarget;
		const result = recipeService.remove(id);
		deleteTarget = null;
		if (result.ok) addToast(`Deleted ${name}.`);
	}

	const deleteBody = $derived.by(() => {
		if (!deleteTarget) return '';
		const preview = recipeService.previewRemoval(deleteTarget.id);
		let text = 'This permanently deletes the recipe.';
		if (preview.unfavorited) text += ' It will be removed from your favorites.';
		if (preview.clearedDays.length > 0) {
			text += ` It will be removed from ${formatDayList(preview.clearedDays)}.`;
		}
		return text;
	});
</script>

<svelte:head>
	<title>My Recipes · Recipe Finder</title>
</svelte:head>

<ScaffoldIndex title="My Recipes">
	{#snippet primaryAction()}
		<Button onclick={() => goto('/recipes/new')}>Create recipe</Button>
	{/snippet}

	{#snippet content()}
		{#if !recipes.hydrated}
			<recipe-grid columns={columns.value}>
				<skeleton-card count={8}></skeleton-card>
			</recipe-grid>
		{:else if pageInfo.items.length === 0}
			<empty-state heading="No recipes yet">
				<p>Recipes you create appear here. Add your own alongside the ones you discover.</p>
				<Button slot="action" onclick={() => goto('/recipes/new')}>Create recipe</Button>
			</empty-state>
		{:else}
			<recipe-grid columns={columns.value}>
				{#each pageInfo.items as recipe (recipe.id)}
					<recipe-card
						recipe={recipe}
						favorited={favorites.has(recipe.id)}
						href={`/recipes/${recipe.id}`}
						onfavoritetoggle={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
							favorites.toggle(event.detail.recipeId)}
						onrecipeselect={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
							goto(`/recipes/${event.detail.recipeId}`)}
					>
						<div slot="actions" class="card-actions">
							<day-picker
								recipeId={recipe.id}
								days={dayOptionsFor(recipe.id)}
								label="Add to plan"
								onplanassign={(event: DayPickerCustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
									handlePlanAssign(event.detail.recipeId, event.detail.day, recipe.name)}
							></day-picker>
							<a class="icon-btn" href={`/recipes/${recipe.id}/edit`} aria-label={`Edit ${recipe.name}`}>
								<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
									<path
										d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										fill="none"
									/>
								</svg>
							</a>
							<button
								type="button"
								class="icon-btn delete"
								aria-label={`Delete ${recipe.name}`}
								onclick={() => openDeleteModal(recipe)}
							>
								<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
									<path
										d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"
										stroke="currentColor"
										stroke-width="1.75"
										stroke-linecap="round"
										stroke-linejoin="round"
										fill="none"
									/>
								</svg>
							</button>
						</div>
					</recipe-card>
				{/each}
			</recipe-grid>
		{/if}
	{/snippet}

	{#snippet pagination()}
		{#if pageInfo.totalPages > 1}
			<nav aria-label="Pagination" class="pagination-nav">
				<Button
					variant="secondary"
					size="sm"
					aria-label="Previous page"
					disabled={pageInfo.page <= 1}
					onclick={() => goToPage(pageInfo.page - 1)}
				>
					Previous
				</Button>
				<span>Page {pageInfo.page} of {pageInfo.totalPages}</span>
				<Button
					variant="secondary"
					size="sm"
					aria-label="Next page"
					disabled={pageInfo.page >= pageInfo.totalPages}
					onclick={() => goToPage(pageInfo.page + 1)}
				>
					Next
				</Button>
			</nav>
		{/if}
	{/snippet}
</ScaffoldIndex>

<Modal
	open={!!deleteTarget}
	heading={deleteTarget ? `Delete ${deleteTarget.name}?` : 'Delete recipe?'}
	onclose={closeDeleteModal}
>
	<p>{deleteBody}</p>
	{#snippet actions()}
		<Button variant="secondary" onclick={closeDeleteModal}>Cancel</Button>
		<Button variant="destructive" onclick={confirmDelete}>Delete recipe</Button>
	{/snippet}
</Modal>

<style>
	.card-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.icon-btn {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-sm);
		background: transparent;
		color: var(--c-text-muted);
		cursor: pointer;
		text-decoration: none;
	}

	.icon-btn:hover {
		background: var(--c-surface-sunken);
	}

	.icon-btn.delete {
		color: var(--c-error);
	}

	.icon-btn.delete:hover {
		background: var(--c-error-subtle);
	}

	.pagination-nav {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
	}
</style>
