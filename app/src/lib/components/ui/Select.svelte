<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Option {
		value: string;
		label: string;
	}

	interface Props extends HTMLSelectAttributes {
		label: string;
		options: Option[];
		value?: string;
	}

	let { label, options, id, value = $bindable(''), ...rest }: Props = $props();
	const selectId = $derived(id ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`);
</script>

<div class="field">
	<label for={selectId}>{label}</label>
	<select {...rest} id={selectId} bind:value>
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	label {
		font-size: var(--fs-sm);
		font-weight: 500;
		color: var(--c-text);
	}

	select {
		min-height: 44px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-sm);
		padding-inline: var(--s-3);
		font-family: var(--font-text);
		font-size: var(--fs-body);
		color: var(--c-text);
	}

	select:focus-visible {
		border-color: var(--c-accent);
	}
</style>
