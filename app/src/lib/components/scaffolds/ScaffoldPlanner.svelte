<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		emptyState?: Snippet;
		days: Snippet;
	}

	let { title, emptyState, days }: Props = $props();
</script>

<div class="page">
	<h1>{title}</h1>

	{#if emptyState}
		<div class="empty-state">{@render emptyState()}</div>
	{/if}

	<div class="week">
		{@render days()}
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	h1 {
		font-size: var(--fs-h1);
	}

	/* Same DOM at every width — grid on desktop, stacked flex below 1024px.
	   Each child is one <planner-day>, always seven of them. */
	.week {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	@media (width >= 1024px) {
		.week {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			gap: var(--s-4);
		}
	}
</style>
