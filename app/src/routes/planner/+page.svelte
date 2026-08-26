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
	// independently of every other id, so one slow or failed lookup never
	// blocks the rest.
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

	// An id with no cache entry yet simply isn't included, rather than shown
	// with an invented "loading" placeholder — the row appears the moment its
	// own lookup settles, independently of every other entry.
	//
	// $derived, not a plain function called from the template: entries must be
	// the SAME array reference across a re-render unrelated to plan/resolvedCache
	// (e.g. toggling movingEntry for the move bar), or Stencil sees a new prop
	// value and tears down and rebuilds every <li>, taking focus with it — which
	// broke the Move button's focus-return-on-dismiss.
	const entriesByDay = $derived.by(() => {
		const byDay = {} as Record<DayOfWeek, PlannerEntry[]>;
		for (const day of DAYS) {
			byDay[day] = plan
				.day(day)
				.map((id) => resolvedCache[id])
				.filter((cached): cached is ResolvedRecipe => cached !== undefined)
				.map((cached): PlannerEntry => {
					if (cached.recipe) {
						return {
							recipeId: cached.id,
							name: cached.recipe.name,
							thumbnail: cached.recipe.thumbnail,
							resolved: true
						};
					}
					return {
						recipeId: cached.id,
						name: "Couldn't load this recipe",
						thumbnail: null,
						resolved: false
					};
				});
		}
		return byDay;
	});

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
	let movingEntry = $state<{
		recipeId: string;
		fromDay: DayOfWeek;
		name: string;
		returnFocusTo: HTMLElement | null;
	} | null>(null);
	let dayPickerEl = $state<HTMLDayPickerElement>();

	$effect(() => {
		if (movingEntry && dayPickerEl) {
			dayPickerEl.open();
			dayPickerEl.scrollIntoView({ block: 'nearest' });
		}
	});

	function handleMoveRequest(recipeId: string, fromDay: DayOfWeek, dayEl: HTMLElement) {
		const name = nameFor(recipeId);
		// So focus can return to the control that opened this on dismissal —
		// the event only gives us the <planner-day> host, so its own Move
		// button for this entry is found the same way it's labelled internally.
		const returnFocusTo =
			dayEl.shadowRoot?.querySelector<HTMLElement>(`[aria-label="Move ${name}"]`) ?? null;
		movingEntry = { recipeId, fromDay, name, returnFocusTo };
	}

	function closeMoveBar() {
		movingEntry?.returnFocusTo?.focus();
		movingEntry = null;
	}

	// $derived for the same reason as entriesByDay: a fresh array on every
	// unrelated re-render would make day-picker tear down and rebuild its day
	// buttons — losing focus mid-interaction if it happens while the picker
	// is open (e.g. an unrelated id resolving elsewhere while the user is
	// still arrow-keying through days).
	const moveDayOptions = $derived(
		movingEntry ? buildMoveDayOptions(movingEntry.recipeId, movingEntry.fromDay) : []
	);

	function buildMoveDayOptions(recipeId: string, fromDay: DayOfWeek): DayOption[] {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({
			day,
			label: day === fromDay ? `${DAY_LABELS[day]} (current)` : DAY_LABELS[day],
			occupied: occupied.has(day)
		}));
	}

	// day-picker always follows planassign with pickerclose (closePanel runs
	// right after the emit in its own selectDay handler) — closeMoveBar there
	// is what actually clears movingEntry, for both this and the cancel path.
	function handleMoveAssign(event: DayPickerCustomEvent<{ recipeId: string; day: DayOfWeek }>) {
		if (!movingEntry) return;
		const { recipeId, fromDay, name } = movingEntry;
		const { day } = event.detail;
		if (plan.move(recipeId, fromDay, day)) {
			addToast(`Moved ${name} to ${DAY_LABELS[day]}.`);
		}
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
					entries={entriesByDay[day]}
					collapsed={isCollapsed(day)}
					onentryremove={(event: PlannerDayCustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
						handleEntryRemove(event.detail.recipeId, event.detail.day)}
					onentrymoverequest={(
						event: PlannerDayCustomEvent<{ recipeId: string; fromDay: DayOfWeek }>
					) =>
						handleMoveRequest(
							event.detail.recipeId,
							event.detail.fromDay,
							event.currentTarget as HTMLElement
						)}
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
			days={moveDayOptions}
			label="Choose a day"
			onplanassign={handleMoveAssign}
			onpickerclose={closeMoveBar}
		></day-picker>
		<Button variant="secondary" size="sm" onclick={closeMoveBar}>Cancel</Button>
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
