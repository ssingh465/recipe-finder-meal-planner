<script lang="ts">
	import { goto } from '$app/navigation';
	import ScaffoldIndex from '$lib/components/scaffolds/ScaffoldIndex.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { DAYS, DAY_LABELS, type DayOfWeek } from '$lib/domain/day';
	import { resolveRecipeIds, type ResolvedRecipe } from '$lib/services/recipeResolver';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { gridColumns } from '$lib/utils/gridColumns.svelte';
	import type {
		DayOption,
		DayPickerCustomEvent,
		RecipeCardCustomEvent
	} from '@ssingh465/recipe-ui/components';

	const columns = gridColumns();

	// The resolved cache for the current favorite ids. Filtered by `favorites.has`
	// below so un-favoriting removes a card immediately, without waiting on a re-resolve.
	let entries = $state<ResolvedRecipe[]>([]);
	let hasResolved = $state(false);

	$effect(() => {
		if (!favorites.hydrated || !recipes.hydrated) return;
		const ids = favorites.list();
		const controller = new AbortController();
		resolveRecipeIds(ids, controller.signal)
			.then((result) => {
				if (controller.signal.aborted) return;
				entries = result;
				hasResolved = true;
			})
			.catch(() => {
				// Aborted by a newer id-list change — that run's result wins instead.
			});
		return () => controller.abort();
	});

	const visibleEntries = $derived(entries.filter((entry) => favorites.has(entry.id)));
	const successfulEntries = $derived(visibleEntries.filter((entry) => entry.recipe));
	const failedEntries = $derived(visibleEntries.filter((entry) => entry.failed));
	const isLoading = $derived(
		!favorites.hydrated || !recipes.hydrated || (!hasResolved && favorites.size > 0)
	);

	function dayOptionsFor(recipeId: string): DayOption[] {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({ day, label: DAY_LABELS[day], occupied: occupied.has(day) }));
	}

	function handlePlanAssign(recipeId: string, day: DayOfWeek, recipeName: string) {
		if (!plan.assign(day, recipeId)) return;
		addToast(`Added ${recipeName} to ${DAY_LABELS[day]}.`);
	}

	async function retryFailed() {
		const idsToRetry = failedEntries.map((entry) => entry.id);
		if (idsToRetry.length === 0) return;
		const retried = await resolveRecipeIds(idsToRetry);
		const byId = new Map(retried.map((entry) => [entry.id, entry]));
		entries = entries.map((entry) => byId.get(entry.id) ?? entry);
	}
</script>

<svelte:head>
	<title>Favorites</title>
</svelte:head>

<ScaffoldIndex title="Favorites">
	{#snippet notice()}
		{#if failedEntries.length > 0}
			<div class="partial-failure" role="status">
				<p>Some favorites couldn't be loaded.</p>
				<Button variant="secondary" size="sm" onclick={retryFailed}>Retry</Button>
			</div>
		{/if}
	{/snippet}

	{#snippet content()}
		{#if isLoading}
			<recipe-grid columns={columns.value}>
				<skeleton-card count={8}></skeleton-card>
			</recipe-grid>
		{:else if favorites.size === 0}
			<empty-state heading="No favorites yet">
				<p>Tap the heart on any recipe to save it here.</p>
				<Button slot="action" onclick={() => goto('/')}>Discover recipes</Button>
			</empty-state>
		{:else}
			<recipe-grid columns={columns.value}>
				{#each successfulEntries as entry (entry.id)}
					{@const recipe = entry.recipe}
					{#if recipe}
						<recipe-card
							recipe={recipe}
							favorited={favorites.has(recipe.id)}
							href={`/recipes/${recipe.id}`}
							onfavoritetoggle={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
								favorites.toggle(event.detail.recipeId)}
							onrecipeselect={(event: RecipeCardCustomEvent<{ recipeId: string }>) =>
								goto(`/recipes/${event.detail.recipeId}`)}
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
					{/if}
				{/each}
			</recipe-grid>
		{/if}
	{/snippet}
</ScaffoldIndex>

<style>
	.partial-failure {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--s-3);
		padding: var(--s-3) var(--s-4);
		background: var(--c-surface-sunken);
		border-radius: var(--r-sm);
	}

	.partial-failure p {
		margin: 0;
		color: var(--c-text-muted);
		font-size: var(--fs-sm);
	}
</style>
