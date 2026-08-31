<script lang="ts">
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/forms/RecipeForm.svelte';
	import ScaffoldMessage from '$lib/components/scaffolds/ScaffoldMessage.svelte';
	import type { Recipe, RecipeInput } from '$lib/domain/recipe';
	import type { Result } from '$lib/domain/result';
	import { recipeService } from '$lib/services/recipeService';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const recipe = $derived(recipes.byId(data.id));

	const viewState = $derived.by((): 'loading' | 'editing' | 'notfound' => {
		if (!recipes.hydrated) return 'loading';
		return recipe ? 'editing' : 'notfound';
	});

	function handleSave(input: RecipeInput): Result<Recipe> {
		const result = recipeService.update(data.id, input);
		if (result.ok) {
			goto(`/recipes/${data.id}`);
			addToast('Changes saved.');
		}
		return result;
	}
</script>

<svelte:head>
	<title>Edit recipe · Recipe Finder</title>
</svelte:head>

{#if viewState === 'loading'}
	<div class="form-skeleton">
		<span class="visually-hidden" role="status">Loading recipe…</span>
		<div class="skel skeleton-shimmer skel-title" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-line" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-line" aria-hidden="true"></div>
		<div class="skel skeleton-shimmer skel-line short" aria-hidden="true"></div>
	</div>
{:else if viewState === 'notfound'}
	<ScaffoldMessage heading="Recipe not found" body="This recipe may have been deleted.">
		{#snippet actions()}
			<a href="/my-recipes" class="btn-link primary">Go to My Recipes</a>
		{/snippet}
	</ScaffoldMessage>
{:else if recipe}
	{#key recipe.id}
		<RecipeForm
			title="Edit recipe"
			initial={{
				name: recipe.name,
				category: recipe.category,
				area: recipe.area,
				instructions: recipe.instructions,
				ingredients: recipe.ingredients
			}}
			submitLabel="Save changes"
			cancelHref={`/recipes/${recipe.id}`}
			onsave={handleSave}
		/>
	{/key}
{/if}

<style>
	.form-skeleton {
		max-width: 640px;
		margin-inline: auto;
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

	.skel-line {
		height: 2.75rem;
		width: 100%;
	}

	.skel-line.short {
		width: 60%;
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
		background: var(--c-accent);
		color: var(--c-on-accent);
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
