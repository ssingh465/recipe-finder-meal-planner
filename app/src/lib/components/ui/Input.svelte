<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label: string;
		error?: string;
		value?: string;
	}

	let { label, error, id, value = $bindable(''), ...rest }: Props = $props();
	const inputId = $derived(id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`);
	const errorId = $derived(`${inputId}-error`);
</script>

<div class="field">
	<label for={inputId}>{label}</label>
	<input
		{...rest}
		id={inputId}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		class:invalid={!!error}
	/>
	{#if error}
		<p id={errorId} class="error">{error}</p>
	{/if}
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

	input {
		min-height: 44px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-sm);
		padding-inline: var(--s-3);
		font-family: var(--font-text);
		font-size: var(--fs-body);
		color: var(--c-text);
		transition: border-color var(--dur-base) var(--ease);
	}

	input:focus-visible {
		border-color: var(--c-accent);
	}

	input:hover:not(:focus-visible, :disabled) {
		border-color: var(--c-border-strong);
	}

	input.invalid {
		border-color: var(--c-error);
	}

	.error {
		margin: 0;
		font-size: var(--fs-sm);
		color: var(--c-error);
	}
</style>
