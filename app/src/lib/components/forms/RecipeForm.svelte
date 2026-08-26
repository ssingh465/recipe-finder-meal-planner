<script lang="ts">
	import { tick } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import ScaffoldForm from '$lib/components/scaffolds/ScaffoldForm.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import { AREAS, CATEGORIES } from '$lib/domain/filter-options.generated';
	import type { Ingredient, Recipe, RecipeInput } from '$lib/domain/recipe';
	import type { FieldErrors, Result } from '$lib/domain/result';
	import { isValid, validateRecipeInput } from '$lib/services/validation';

	const MAX_INGREDIENTS = 20;

	interface Props {
		title: string;
		initial: RecipeInput;
		submitLabel: string;
		cancelHref: string;
		onsave: (input: RecipeInput) => Result<Recipe>;
	}

	let { title, initial, submitLabel, cancelHref, onsave }: Props = $props();

	const categoryOptions = [
		{ value: '', label: 'None' },
		...CATEGORIES.map((category) => ({ value: category, label: category }))
	];
	const areaOptions = [
		{ value: '', label: 'None' },
		...AREAS.map((area) => ({ value: area, label: area }))
	];

	let name = $state(initial.name);
	let category = $state(initial.category ?? '');
	let area = $state(initial.area ?? '');
	let instructions = $state(initial.instructions);
	let ingredients = $state<Ingredient[]>(
		initial.ingredients.length > 0 ? initial.ingredients.map((i) => ({ ...i })) : [{ name: '', measure: '' }]
	);

	let errors = $state<FieldErrors>({});
	let submitted = $state(false);
	let dirty = $state(false);
	let saving = $state(false);

	let ingredientNameInputs: HTMLInputElement[] = $state([]);

	let discardModalOpen = $state(false);
	let pendingUrl: URL | null = null;

	beforeNavigate((navigation) => {
		if (!dirty || !navigation.to) return;
		navigation.cancel();
		pendingUrl = navigation.to.url;
		discardModalOpen = true;
	});

	function currentInput(): RecipeInput {
		return {
			name,
			category: category || null,
			area: area || null,
			instructions,
			ingredients
		};
	}

	/** Trims every field and drops rows whose ingredient name is blank, matching normalize.ts. */
	function normalizeIngredients(rows: Ingredient[]): Ingredient[] {
		return rows
			.map((row) => ({ name: row.name.trim(), measure: row.measure.trim() }))
			.filter((row) => row.name.length > 0);
	}

	function markDirty() {
		dirty = true;
	}

	function revalidate() {
		if (submitted) errors = validateRecipeInput(currentInput());
	}

	function focusFirstInvalid() {
		tick().then(() => {
			if (errors.name) {
				document.getElementById('recipe-name')?.focus();
			} else if (errors.ingredients) {
				ingredientNameInputs[0]?.focus();
			} else if (errors.instructions) {
				document.getElementById('recipe-instructions')?.focus();
			}
		});
	}

	function addIngredient() {
		if (ingredients.length >= MAX_INGREDIENTS) return;
		ingredients = [...ingredients, { name: '', measure: '' }];
		dirty = true;
		revalidate();
		const newIndex = ingredients.length - 1;
		tick().then(() => ingredientNameInputs[newIndex]?.focus());
	}

	function removeIngredient(index: number) {
		if (ingredients.length <= 1) return;
		ingredients = ingredients.filter((_, i) => i !== index);
		dirty = true;
		revalidate();
		const focusIndex = Math.max(0, index - 1);
		tick().then(() => ingredientNameInputs[focusIndex]?.focus());
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		const input = currentInput();
		errors = validateRecipeInput(input);
		if (!isValid(errors)) {
			focusFirstInvalid();
			return;
		}

		saving = true;
		const normalized: RecipeInput = { ...input, ingredients: normalizeIngredients(input.ingredients) };
		const result = onsave(normalized);
		if (result.ok) {
			dirty = false;
			return;
		}
		saving = false;
		if (result.kind === 'validation') {
			errors = result.fields;
			focusFirstInvalid();
		}
	}

	function keepEditing() {
		discardModalOpen = false;
		pendingUrl = null;
	}

	function discardChanges() {
		dirty = false;
		discardModalOpen = false;
		if (pendingUrl) goto(pendingUrl);
	}
</script>

<form onsubmit={handleSubmit} novalidate>
	<ScaffoldForm {title}>
		{#snippet fields()}
			{#if submitted && !isValid(errors)}
				<p class="form-summary" role="alert">
					Fix {Object.keys(errors).length} field(s) to save.
				</p>
			{/if}

			<Input
				id="recipe-name"
				label="Name"
				bind:value={name}
				error={errors.name}
				oninput={markDirty}
				onblur={revalidate}
				maxlength={200}
			/>

			<div class="select-row">
				<Select
					label="Category"
					options={categoryOptions}
					bind:value={category}
					onchange={markDirty}
				/>
				<Select label="Area" options={areaOptions} bind:value={area} onchange={markDirty} />
			</div>

			<div class="ingredients-group" role="group" aria-labelledby="ingredients-heading">
				<h2 id="ingredients-heading">Ingredients</h2>

				{#each ingredients as ingredient, index (index)}
					<div class="ingredient-row">
						<label class="visually-hidden" for={`ingredient-measure-${index}`}>Measure</label>
						<input
							id={`ingredient-measure-${index}`}
							type="text"
							class="ingredient-measure"
							placeholder="Measure"
							bind:value={ingredient.measure}
							oninput={markDirty}
							onblur={revalidate}
						/>

						<label class="visually-hidden" for={`ingredient-name-${index}`}>Ingredient</label>
						<input
							id={`ingredient-name-${index}`}
							bind:this={ingredientNameInputs[index]}
							type="text"
							class="ingredient-name"
							placeholder="Ingredient"
							bind:value={ingredient.name}
							oninput={markDirty}
							onblur={revalidate}
						/>

						<button
							type="button"
							class="remove-ingredient"
							aria-label={`Remove ingredient ${index + 1}`}
							disabled={ingredients.length <= 1}
							onclick={() => removeIngredient(index)}
						>
							<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
								<path
									d="M6 6l12 12M18 6L6 18"
									stroke="currentColor"
									stroke-width="1.75"
									stroke-linecap="round"
								/>
							</svg>
						</button>
					</div>
				{/each}

				{#if errors.ingredients}
					<p class="error">{errors.ingredients}</p>
				{/if}

				<Button
					type="button"
					variant="secondary"
					size="sm"
					disabled={ingredients.length >= MAX_INGREDIENTS}
					onclick={addIngredient}
				>
					Add ingredient
				</Button>
			</div>

			<Textarea
				id="recipe-instructions"
				label="Instructions"
				bind:value={instructions}
				error={errors.instructions}
				oninput={markDirty}
				onblur={revalidate}
				maxlength={5000}
			/>
		{/snippet}

		{#snippet actionBar()}
			<Button type="button" variant="secondary" onclick={() => goto(cancelHref)}>Cancel</Button>
			<Button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
		{/snippet}
	</ScaffoldForm>
</form>

<Modal open={discardModalOpen} heading="Discard changes?" onclose={keepEditing}>
	<p>Your changes to this recipe will be lost.</p>
	{#snippet actions()}
		<Button variant="secondary" onclick={keepEditing}>Keep editing</Button>
		<Button variant="destructive" onclick={discardChanges}>Discard changes</Button>
	{/snippet}
</Modal>

<style>
	.form-summary {
		margin: 0;
		padding: var(--s-3) var(--s-4);
		background: var(--c-error-subtle);
		color: var(--c-error);
		border-radius: var(--r-sm);
		font-size: var(--fs-sm);
		font-weight: 500;
	}

	.select-row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-4);
	}

	.select-row :global(.field) {
		flex: 1;
		min-width: 10rem;
	}

	.ingredients-group {
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
	}

	.ingredients-group h2 {
		font-size: var(--fs-h3);
	}

	.ingredient-row {
		display: flex;
		gap: var(--s-2);
		align-items: center;
	}

	.ingredient-measure,
	.ingredient-name {
		min-height: 44px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-sm);
		padding-inline: var(--s-3);
		font-family: var(--font-text);
		font-size: var(--fs-body);
		color: var(--c-text);
	}

	.ingredient-measure {
		flex: 0 0 8rem;
	}

	.ingredient-name {
		flex: 1;
	}

	.ingredient-measure:focus-visible,
	.ingredient-name:focus-visible {
		border-color: var(--c-accent);
	}

	.remove-ingredient {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: transparent;
		border: 1px solid var(--c-border-strong);
		border-radius: var(--r-sm);
		color: var(--c-text-muted);
		cursor: pointer;
	}

	.remove-ingredient:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.error {
		margin: 0;
		font-size: var(--fs-sm);
		color: var(--c-error);
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
