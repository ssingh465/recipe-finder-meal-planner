<script lang="ts">
	import { goto } from '$app/navigation';
	import RecipeForm from '$lib/components/forms/RecipeForm.svelte';
	import type { Recipe, RecipeInput } from '$lib/domain/recipe';
	import type { Result } from '$lib/domain/result';
	import { recipeService } from '$lib/services/recipeService';
	import { addToast } from '$lib/stores/toast.svelte';

	const emptyInput: RecipeInput = {
		name: '',
		category: null,
		area: null,
		instructions: '',
		ingredients: [{ name: '', measure: '' }]
	};

	function handleSave(input: RecipeInput): Result<Recipe> {
		const result = recipeService.create(input);
		if (result.ok) {
			goto(`/recipes/${result.data.id}`);
			addToast('Recipe created.');
		}
		return result;
	}
</script>

<svelte:head>
	<title>New recipe · Recipe Finder</title>
</svelte:head>

<RecipeForm
	title="New recipe"
	initial={emptyInput}
	submitLabel="Save recipe"
	cancelHref="/my-recipes"
	onsave={handleSave}
/>
