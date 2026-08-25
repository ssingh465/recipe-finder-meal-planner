<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		heading: string;
		body: string;
		actions?: Snippet;
	}

	let { heading, body, actions }: Props = $props();
</script>

<div class="page">
	<h1>{heading}</h1>
	<p>{body}</p>
	{#if actions}
		<div class="actions">{@render actions()}</div>
	{/if}
</div>

<style>
	.page {
		max-width: 32rem;
		margin-inline: auto;
		padding-block: var(--s-8);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-4);
	}

	h1 {
		font-size: var(--fs-h1);
	}

	p {
		color: var(--c-text-muted);
		max-width: 44ch;
	}

	.actions {
		display: flex;
		gap: var(--s-3);
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
