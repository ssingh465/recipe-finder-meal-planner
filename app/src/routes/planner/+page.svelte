<script lang="ts">
	import { goto } from '$app/navigation';
	import ScaffoldPlanner from '$lib/components/scaffolds/ScaffoldPlanner.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { DAYS, DAY_LABELS, type DayOfWeek } from '$lib/domain/day';
	import { resolveRecipeIds, type ResolvedRecipe } from '$lib/services/recipeResolver';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type {
		DayOption,
		DayPickerCustomEvent,
		PlannerDayCustomEvent,
		PlannerEntry
	} from '@ssingh465/recipe-ui/components';

	// Keyed by recipe id, shared across every day that plans it — a recipe
	// planned on three days resolves once, not three times. Populated
	// progressively: each id's own lookup updates this the moment it settles,
	// independently of every other id (per-row loading, per 8.11).
	let resolvedCache = $state<Record<string, ResolvedRecipe>>({});

	$effect(() => {
		if (!plan.hydrated || !recipes.hydrated) return;
		const ids = Array.from(new Set(DAYS.flatMap((day) => plan.day(day))));
		const controller = new AbortController();
		for (const id of ids) {
			if (id in resolvedCache) continue;
			resolveRecipeIds([id], controller.signal)
				.then(([result]) => {
					if (controller.signal.aborted) return;
					resolvedCache = { ...resolvedCache, [id]: result };
				})
				.catch(() => {
					// Aborted by a newer plan change — that run's result wins instead.
				});
		}
		return () => controller.abort();
	});

	function entriesFor(day: DayOfWeek): PlannerEntry[] {
		return plan.day(day).map((id): PlannerEntry => {
			const cached = resolvedCache[id];
			if (!cached) return { recipeId: id, name: 'Loading…', thumbnail: null, resolved: false };
			if (cached.recipe) {
				return {
					recipeId: id,
					name: cached.recipe.name,
					thumbnail: cached.recipe.thumbnail,
					resolved: true
				};
			}
			return { recipeId: id, name: "Couldn't load this recipe", thumbnail: null, resolved: false };
		});
	}

	const weekIsEmpty = $derived(DAYS.every((day) => plan.day(day).length === 0));

	// A day's default follows its population (empty -> collapsed, so a mostly
	// empty week doesn't demand seven screens of scrolling) until the user
	// overrides it directly — after that their choice sticks regardless of
	// what gets added or removed.
	let collapsedOverride = $state<Partial<Record<DayOfWeek, boolean>>>({});
	function isCollapsed(day: DayOfWeek): boolean {
		return collapsedOverride[day] ?? plan.day(day).length === 0;
	}

	function nameFor(recipeId: string): string {
		return resolvedCache[recipeId]?.recipe?.name ?? 'this recipe';
	}

	function handleEntryRemove(recipeId: string, day: DayOfWeek) {
		const name = nameFor(recipeId);
		plan.remove(day, recipeId);
		addToast(`Removed ${name} from ${DAY_LABELS[day]}.`);
	}

	// Move spans two days, which <planner-day> cannot know — it emits only
	// what it knows (recipeId, fromDay), and the app orchestrates the rest:
	// surface a <day-picker> for that recipe, then call the atomic plan.move().
	let movingEntry = $state<{ recipeId: string; fromDay: DayOfWeek; name: string } | null>(null);
	let dayPickerEl = $state<HTMLDayPickerElement>();

	$effect(() => {
		if (movingEntry && dayPickerEl) {
			dayPickerEl.open();
			dayPickerEl.scrollIntoView({ block: 'nearest' });
		}
	});

	function handleMoveRequest(recipeId: string, fromDay: DayOfWeek) {
		movingEntry = { recipeId, fromDay, name: nameFor(recipeId) };
	}

	function moveDayOptions(recipeId: string, fromDay: DayOfWeek): DayOption[] {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({
			day,
			label: day === fromDay ? `${DAY_LABELS[day]} (current)` : DAY_LABELS[day],
			occupied: occupied.has(day)
		}));
	}

	function handleMoveAssign(event: DayPickerCustomEvent<{ recipeId: string; day: DayOfWeek }>) {
		if (!movingEntry) return;
		const { recipeId, fromDay, name } = movingEntry;
		const { day } = event.detail;
		if (plan.move(recipeId, fromDay, day)) {
			addToast(`Moved ${name} to ${DAY_LABELS[day]}.`);
		}
		movingEntry = null;
	}
</script>

<svelte:head>
	<title>Weekly Planner</title>
</svelte:head>

<ScaffoldPlanner title="Weekly Planner">
	{#snippet emptyState()}
		{#if plan.hydrated && weekIsEmpty}
			<empty-state heading="Your week is empty">
				<p>Find a recipe and add it to any day to start planning.</p>
				<Button slot="action" onclick={() => goto('/')}>Discover recipes</Button>
			</empty-state>
		{/if}
	{/snippet}

	{#snippet days()}
		{#if !plan.hydrated}
			{#each DAYS as day (day)}
				<div class="day-skeleton" aria-hidden="true">
					<div class="skeleton-line title"></div>
					<div class="skeleton-line"></div>
					<div class="skeleton-line"></div>
				</div>
			{/each}
		{:else}
			{#each DAYS as day (day)}
				<planner-day
					{day}
					dayLabel={DAY_LABELS[day]}
					entries={entriesFor(day)}
					collapsed={isCollapsed(day)}
					onentryremove={(event: PlannerDayCustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
						handleEntryRemove(event.detail.recipeId, event.detail.day)}
					onentrymoverequest={(
						event: PlannerDayCustomEvent<{ recipeId: string; fromDay: DayOfWeek }>
					) => handleMoveRequest(event.detail.recipeId, event.detail.fromDay)}
					ondaytoggle={(event: PlannerDayCustomEvent<{ day: DayOfWeek; collapsed: boolean }>) =>
						(collapsedOverride = { ...collapsedOverride, [event.detail.day]: event.detail.collapsed })}
					onrecipeselect={(event: PlannerDayCustomEvent<{ recipeId: string }>) =>
						goto(`/recipes/${event.detail.recipeId}`)}
				>
					<p slot="empty">No meals planned</p>
				</planner-day>
			{/each}
		{/if}
	{/snippet}
</ScaffoldPlanner>

{#if movingEntry}
	<div class="move-bar">
		<span>Move <strong>{movingEntry.name}</strong></span>
		<day-picker
			bind:this={dayPickerEl}
			recipeId={movingEntry.recipeId}
			days={moveDayOptions(movingEntry.recipeId, movingEntry.fromDay)}
			label="Choose a day"
			onplanassign={handleMoveAssign}
			onpickerclose={() => (movingEntry = null)}
		></day-picker>
		<Button variant="secondary" size="sm" onclick={() => (movingEntry = null)}>Cancel</Button>
	</div>
{/if}

<style>
	.day-skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		min-height: 20rem;
		padding: var(--s-4);
		background: var(--c-surface-sunken);
		border: 1px solid var(--c-border);
		border-radius: var(--r-lg);
	}

	.skeleton-line {
		height: 1rem;
		border-radius: var(--r-sm);
		background: var(--c-border);
		position: relative;
		overflow: hidden;
	}

	.skeleton-line.title {
		width: 60%;
		height: 1.25rem;
	}

	.skeleton-line::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, var(--c-surface) 50%, transparent);
		opacity: 0.4;
		animation: shimmer 1.4s infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.skeleton-line::after {
			animation: none;
			opacity: 0.2;
		}
	}

	@keyframes shimmer {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(100%);
		}
	}

	.move-bar {
		position: sticky;
		bottom: var(--s-4);
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--s-3);
		margin-top: var(--s-4);
		padding: var(--s-3) var(--s-4);
		background: var(--c-surface);
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		box-shadow: var(--sh-2);
		font-size: var(--fs-sm);
	}
</style>
