<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/state';
	import ScaffoldDetail from '$lib/components/scaffolds/ScaffoldDetail.svelte';
	import ScaffoldMessage from '$lib/components/scaffolds/ScaffoldMessage.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { DAYS, DAY_LABELS, formatDayList, type DayOfWeek } from '$lib/domain/day';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { recipeService } from '$lib/services/recipeService';
	import { addToast } from '$lib/stores/toast.svelte';
	import { tileHue } from '$lib/utils/tileHue';
	import type { DayOption, DayPickerCustomEvent } from '@ssingh465/recipe-ui/components';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Same-route navigations (one recipe details page to another) keep this
	// component mounted and swap `data` once `load` resolves — this is the only
	// realistic window where "loading" is visible for an API id.
	const pendingNav = $derived(navigating.to?.route.id === '/recipes/[id]');

	const recipe = $derived(
		data.source === 'api' ? (data.result.ok ? data.result.data : undefined) : recipes.byId(data.id)
	);

	const viewState = $derived.by((): 'loading' | 'success' | 'notfound' | 'error' => {
		if (data.source === 'api') {
			if (pendingNav) return 'loading';
			return data.result.ok ? 'success' : 'error';
		}
		if (!recipes.hydrated) return 'loading';
		return recipe ? 'success' : 'notfound';
	});

	const pageTitle = $derived(
		viewState === 'success' && recipe
			? `${recipe.name} · Recipe Finder`
			: viewState === 'notfound'
				? 'Recipe not found · Recipe Finder'
				: viewState === 'error'
					? "Couldn't load this recipe · Recipe Finder"
					: 'Recipe Finder'
	);

	let deleteModalOpen = $state(false);

	function dayOptionsFor(recipeId: string): DayOption[] {
		const occupied = new Set(plan.daysContaining(recipeId));
		return DAYS.map((day) => ({ day, label: DAY_LABELS[day], occupied: occupied.has(day) }));
	}

	function handlePlanAssign(recipeId: string, day: DayOfWeek, recipeName: string) {
		if (!plan.assign(day, recipeId)) return;
		addToast(`Added ${recipeName} to ${DAY_LABELS[day]}.`);
	}

	function retry() {
		invalidateAll();
	}

	function openDeleteModal() {
		deleteModalOpen = true;
	}

	function closeDeleteModal() {
		deleteModalOpen = false;
	}

	async function confirmDelete() {
		if (!recipe) return;
		const { name, id } = recipe;
		const result = recipeService.remove(id);
		if (!result.ok) return;
		deleteModalOpen = false;
		try {
			await goto('/my-recipes');
		} catch {
			// goto() rejects (after already falling back to a full navigation) when
			// the target route doesn't exist in the client manifest.
		} finally {
			addToast(`Deleted ${name}.`);
		}
	}

	const deleteBody = $derived.by(() => {
		if (!recipe) return '';
		const preview = recipeService.previewRemoval(recipe.id);
		let text = 'This permanently deletes the recipe.';
		if (preview.unfavorited) text += ' It will be removed from your favorites.';
		if (preview.clearedDays.length > 0) {
			text += ` It will be removed from ${formatDayList(preview.clearedDays)}.`;
		}
		return text;
	});
</script>

{#snippet metaBlock()}
	{#if recipe?.category}<Badge>{recipe.category}</Badge>{/if}
	{#if recipe?.area}<Badge>{recipe.area}</Badge>{/if}
{/snippet}

{#snippet mediaBlock()}
	{#if recipe}
		{#if recipe.thumbnail}
			<img
				class="detail-media"
				src={recipe.thumbnail}
				alt={recipe.name}
				width="800"
				height="600"
				loading="lazy"
				decoding="async"
			/>
		{:else}
			<div class="detail-media tile" style={`--tile-h: ${tileHue(recipe.name)}`}>
				<span>{recipe.name}</span>
			</div>
		{/if}
	{/if}
{/snippet}

{#snippet actionsBlock()}
	{#if recipe}
		{@const r = recipe}
		<button
			type="button"
			class="favorite-toggle"
			aria-pressed={favorites.has(r.id) ? 'true' : 'false'}
			aria-label={favorites.has(r.id) ? `Remove ${r.name} from favorites` : `Add ${r.name} to favorites`}
			onclick={() => favorites.toggle(r.id)}
		>
			<svg
				viewBox="0 0 24 24"
				width="20"
				height="20"
				fill={favorites.has(r.id) ? 'currentColor' : 'none'}
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				focusable="false"
			>
				<path
					d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"
				/>
			</svg>
		</button>

		<day-picker
			recipeId={r.id}
			days={dayOptionsFor(r.id)}
			label="Add to plan"
			onplanassign={(event: DayPickerCustomEvent<{ recipeId: string; day: DayOfWeek }>) =>
				handlePlanAssign(event.detail.recipeId, event.detail.day, r.name)}
		></day-picker>

		{#if r.source === 'user'}
			<Button variant="secondary" onclick={() => goto(`/recipes/${r.id}/edit`)}>Edit</Button>
			<button type="button" class="delete-trigger" onclick={openDeleteModal}>Delete</button>
		{/if}
	{/if}
{/snippet}

{#snippet ingredientsBlock()}
	<h2>Ingredients</h2>
	{#if recipe}
		<ul>
			{#each recipe.ingredients as ingredient, index (index)}
				<li>{[ingredient.measure, ingredient.name].filter(Boolean).join(' ')}</li>
			{/each}
		</ul>
	{/if}
{/snippet}

{#snippet instructionsBlock()}
	<h2>Instructions</h2>
	{#if recipe}
		<p class="instructions-text">{recipe.instructions}</p>
	{/if}
{/snippet}

{#snippet sourceLinksBlock()}
	<div class="source-links-row">
		{#if recipe?.youtubeUrl}
			<a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer">
				<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
					<path
						d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
					/>
				</svg>
				Watch on YouTube
			</a>
		{/if}
		{#if recipe?.sourceUrl}
			<a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
				<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
					<path
						d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
					/>
				</svg>
				Original source
			</a>
		{/if}
	</div>
{/snippet}

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

{#if viewState === 'loading'}
	<div class="detail-skeleton">
		<span class="visually-hidden" role="status">Loading recipe…</span>
		<div class="skel skeleton-shimmer skel-title" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-media" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-line" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-line short" aria-hidden="true"></div>
	</div>
{:else if viewState === 'notfound'}
	<ScaffoldMessage heading="Recipe not found" body="This recipe may have been deleted.">
		{#snippet actions()}
			<a href="/my-recipes" class="btn-link primary">Go to My Recipes</a>
		{/snippet}
	</ScaffoldMessage>
{:else if viewState === 'error'}
	<div class="error-state" role="alert">
		<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" focusable="false">
			<path
				d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
			<path d="M12 9v4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
			<path d="M12 17h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
		</svg>
		<h1>Couldn't load this recipe</h1>
		<p>The recipe service returned an unexpected response.</p>
		<Button variant="secondary" onclick={retry}>Retry</Button>
	</div>
{:else if recipe}
	<ScaffoldDetail
		backHref="/"
		backLabel="Back"
		title={recipe.name}
		meta={metaBlock}
		media={mediaBlock}
		actions={actionsBlock}
		ingredients={ingredientsBlock}
		instructions={instructionsBlock}
		sourceLinks={recipe.youtubeUrl || recipe.sourceUrl ? sourceLinksBlock : undefined}
	/>
{/if}

<Modal
	open={deleteModalOpen}
	heading={recipe ? `Delete ${recipe.name}?` : 'Delete recipe?'}
	onclose={closeDeleteModal}
>
	<p>{deleteBody}</p>
	{#snippet actions()}
		<Button variant="secondary" onclick={closeDeleteModal}>Cancel</Button>
		<Button variant="destructive" onclick={confirmDelete}>Delete recipe</Button>
	{/snippet}
</Modal>

<style>
	.detail-media {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: var(--r-lg);
	}

	.detail-media.tile {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--s-4);
		text-align: center;
		background: hsl(var(--tile-h) 42% 88%);
		color: hsl(var(--tile-h) 45% 28%);
	}

	@media (prefers-color-scheme: dark) {
		.detail-media.tile {
			background: hsl(var(--tile-h) 30% 22%);
			color: hsl(var(--tile-h) 35% 82%);
		}
	}

	.detail-media.tile span {
		font-family: var(--font-display);
		font-size: var(--fs-h2);
	}

	.favorite-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-md);
		background: transparent;
		color: var(--c-text-muted);
		cursor: pointer;
	}

	.favorite-toggle[aria-pressed='true'] {
		color: var(--c-accent);
		border-color: var(--c-accent-border);
		background: var(--c-accent-subtle);
	}

	.delete-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding-inline: var(--s-4);
		border-radius: var(--r-md);
		border: 1px solid var(--c-border-strong);
		background: transparent;
		color: var(--c-error);
		font-family: var(--font-text);
		font-size: var(--fs-sm);
		font-weight: 500;
		cursor: pointer;
	}

	.delete-trigger:hover {
		background: var(--c-error-subtle);
	}

	@media (width <= 767px) {
		.delete-trigger {
			min-height: 44px;
		}
	}

	.instructions-text {
		white-space: pre-line;
	}

	.source-links-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
	}

	.source-links-row a {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		font-size: var(--fs-sm);
		color: var(--c-accent);
		text-decoration: none;
	}

	.error-state {
		max-width: 32rem;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--s-3);
		padding: var(--s-5);
		background: var(--c-error-subtle);
		border: 1px solid color-mix(in srgb, var(--c-error) 30%, transparent);
		border-radius: var(--r-lg);
		color: var(--c-error);
	}

	.error-state h1 {
		font-size: var(--fs-h3);
		color: var(--c-text);
	}

	.error-state p {
		color: var(--c-text-muted);
		max-width: 44ch;
	}

	.btn-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding-inline: var(--s-4);
		border-radius: var(--r-md);
		font-size: var(--fs-sm);
		font-weight: 500;
		text-decoration: none;
	}

	.btn-link.primary {
		background: var(--c-accent);
		color: var(--c-on-accent);
	}

	.detail-skeleton {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.skel {
		background: var(--c-surface-sunken);
		border-radius: var(--r-md);
	}

	.skel-title {
		height: 2.5rem;
		width: 50%;
	}

	.skel-media {
		height: 0;
		padding-bottom: 75%;
	}

	.skel-line {
		height: 1rem;
		width: 100%;
	}

	.skel-line.short {
		width: 60%;
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
