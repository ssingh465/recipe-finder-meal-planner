<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
		size?: 'sm' | 'default' | 'lg';
		children: Snippet;
	}

	let { variant = 'primary', size = 'default', children, ...rest }: Props = $props();
</script>

<button {...rest} class="btn {variant} {size}">
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		border-radius: var(--r-md);
		font-family: var(--font-text);
		font-size: var(--fs-sm);
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		padding-inline: var(--s-4);
	}

	.btn:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.sm {
		height: 36px;
	}

	.default {
		height: 40px;
	}

	.lg {
		height: 48px;
	}

	@media (width <= 767px) {
		.btn {
			min-height: 44px;
		}
	}

	.primary {
		background: var(--c-accent);
		color: var(--c-on-accent);
	}

	.primary:hover:not(:disabled) {
		background: var(--c-accent-hover);
	}

	.secondary {
		background: transparent;
		color: var(--c-text);
		border-color: var(--c-border-strong);
	}

	.secondary:hover:not(:disabled) {
		background: var(--c-surface-sunken);
	}

	.ghost {
		background: transparent;
		color: var(--c-text-muted);
	}

	.ghost:hover:not(:disabled) {
		background: var(--c-surface-sunken);
	}

	.destructive {
		background: var(--c-error);
		color: var(--c-on-error);
	}

	.destructive:hover:not(:disabled) {
		opacity: 0.9;
	}
</style>
