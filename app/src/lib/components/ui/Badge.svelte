<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<span class="badge">{@render children()}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		border-radius: var(--r-sm);
		background: var(--c-surface-sunken);
		color: var(--c-text-muted);
		font-size: var(--fs-xs);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: var(--s-1) var(--s-2);
	}
</style>
