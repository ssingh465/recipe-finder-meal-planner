<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends HTMLTextareaAttributes {
		label: string;
		error?: string;
		value?: string;
	}

	let { label, error, id, value = $bindable(''), ...rest }: Props = $props();
	const textareaId = $derived(id ?? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`);
	const errorId = $derived(`${textareaId}-error`);
</script>

<div class="field">
	<label for={textareaId}>{label}</label>
	<textarea
		{...rest}
		id={textareaId}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? errorId : undefined}
		class:invalid={!!error}
	></textarea>
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

	textarea {
		min-height: 10rem;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-sm);
		padding: var(--s-3);
		font-family: var(--font-text);
		font-size: var(--fs-body);
		color: var(--c-text);
		resize: vertical;
	}

	textarea:focus-visible {
		border-color: var(--c-accent);
	}

	textarea.invalid {
		border-color: var(--c-error);
	}

	.error {
		margin: 0;
		font-size: var(--fs-sm);
		color: var(--c-error);
	}
</style>
