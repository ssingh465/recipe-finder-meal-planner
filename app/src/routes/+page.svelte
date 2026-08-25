<script lang="ts">
	import { DAYS, type DayOfWeek } from '$lib/domain/day';
	import type { RecipeSummary } from '$lib/domain/recipe';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { DayOption, PlannerEntry } from '@ssingh465/recipe-ui/components';

	// Temporary showcase of the published component library — proves every
	// component works end to end in the real app (object props surviving
	// custom-element upgrade, events, slots, --rc-* theming). Replaced once
	// the real screens land.

	const DAY_LABELS: Record<DayOfWeek, string> = {
		mon: 'Monday',
		tue: 'Tuesday',
		wed: 'Wednesday',
		thu: 'Thursday',
		fri: 'Friday',
		sat: 'Saturday',
		sun: 'Sunday'
	};

	const recipes: RecipeSummary[] = [
		{
			id: '52772',
			source: 'api',
			name: 'Teriyaki Chicken Casserole',
			thumbnail: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
			category: 'Chicken',
			area: 'Japanese'
		},
		{
			id: '52959',
			source: 'api',
			name: 'Baked salmon with fennel & tomatoes',
			thumbnail: 'https://www.themealdb.com/images/media/meals/1548772327.jpg',
			category: 'Seafood',
			area: 'French'
		},
		{
			id: 'usr_1',
			source: 'user',
			name: "Grandma's Sunday Lentil Soup",
			thumbnail: null,
			category: 'Vegetarian',
			area: null
		}
	];

	let favorited = $state<Record<string, boolean>>({});
	let assignments = $state<Record<string, DayOfWeek[]>>({});

	function dayOptions(recipeId: string): DayOption[] {
		const occupiedDays = assignments[recipeId] ?? [];
		return DAYS.map((day) => ({ day, label: DAY_LABELS[day], occupied: occupiedDays.includes(day) }));
	}

	function handleFavoriteToggle(recipeId: string) {
		favorited[recipeId] = !favorited[recipeId];
	}

	function handleRecipeSelect(recipeId: string) {
		addToast(`Would navigate to recipe ${recipeId}`);
	}

	function handlePlanAssign(recipeId: string, day: DayOfWeek) {
		const current = assignments[recipeId] ?? [];
		assignments[recipeId] = [...current, day];
		addToast(`Added to ${DAY_LABELS[day]}`);
	}

	const categoryChip = $state({ active: true });
	const areaChip = $state({ active: true });

	let mondayEntries = $state<PlannerEntry[]>([
		{ recipeId: '52772', name: 'Teriyaki Chicken Casserole', thumbnail: recipes[0].thumbnail, resolved: true },
		{ recipeId: 'usr_2', name: 'A recipe that failed to resolve', thumbnail: null, resolved: false }
	]);
	let mondayCollapsed = $state(false);

	function handleEntryRemove(recipeId: string) {
		mondayEntries = mondayEntries.filter((entry) => entry.recipeId !== recipeId);
	}

	function handleMoveRequest(recipeId: string, fromDay: DayOfWeek) {
		addToast(`Move requested for ${recipeId} from ${DAY_LABELS[fromDay]}`);
	}
</script>

<svelte:head>
	<title>Component library showcase</title>
</svelte:head>

<div class="page">
	<section>
		<h1>Discover</h1>
		<recipe-grid columns={3}>
			{#each recipes as recipe (recipe.id)}
				<recipe-card
					recipe={recipe}
					favorited={favorited[recipe.id] ?? false}
					href={`/recipes/${recipe.id}`}
					onfavoritetoggle={(event: CustomEvent<{ recipeId: string }>) =>
						handleFavoriteToggle(event.detail.recipeId)}
					onrecipeselect={(event: CustomEvent<{ recipeId: string }>) => handleRecipeSelect(event.detail.recipeId)}
				>
					<day-picker
						slot="actions"
						recipeId={recipe.id}
						days={dayOptions(recipe.id)}
						label="Add to plan"
						onplanassign={(event: CustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
							handlePlanAssign(event.detail.recipeId, event.detail.day)}
					></day-picker>
				</recipe-card>
			{/each}
		</recipe-grid>
	</section>

	<section>
		<h2>Active filters</h2>
		<div class="chip-row">
			{#if categoryChip.active}
				<filter-chip
					label="Chicken"
					value="Chicken"
					dimension="category"
					onchiptoggle={() => (categoryChip.active = false)}
				></filter-chip>
			{/if}
			{#if areaChip.active}
				<filter-chip
					label="Japanese"
					value="Japanese"
					dimension="area"
					onchiptoggle={() => (areaChip.active = false)}
				></filter-chip>
			{/if}
		</div>
	</section>

	<section>
		<h2>Planner — Monday</h2>
		<div class="planner-demo">
			<planner-day
				day="mon"
				dayLabel="Monday"
				entries={mondayEntries}
				collapsed={mondayCollapsed}
				onentryremove={(event: CustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
					handleEntryRemove(event.detail.recipeId)}
				onentrymoverequest={(event: CustomEvent<{ recipeId: string; fromDay: DayOfWeek }>) =>
					handleMoveRequest(event.detail.recipeId, event.detail.fromDay)}
				ondaytoggle={(event: CustomEvent<{ day: DayOfWeek; collapsed: boolean }>) =>
					(mondayCollapsed = event.detail.collapsed)}
			>
				<p slot="empty">Nothing planned for Monday.</p>
			</planner-day>
		</div>
	</section>

	<section>
		<h2>Empty and loading states</h2>
		<empty-state heading="No favorites yet">
			<p>Save recipes to see them here.</p>
			<button slot="action" type="button" onclick={() => addToast('Would navigate to Discover')}>
				Discover recipes
			</button>
		</empty-state>
		<recipe-grid columns={3}>
			<skeleton-card count={3}></skeleton-card>
		</recipe-grid>
	</section>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
	}

	.chip-row {
		display: flex;
		gap: var(--s-2);
	}

	.planner-demo {
		max-width: 20rem;
	}
</style>
