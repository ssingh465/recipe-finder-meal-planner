<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		emptyState?: Snippet;
		/** The vertical list of day rows — always a list, at every width. */
		dayList: Snippet;
		/** The single currently-selected day's content. */
		selectedDay: Snippet;
	}

	let { title, emptyState, dayList, selectedDay }: Props = $props();
</script>

<div class="page">
	<h1>{title}</h1>

	{#if emptyState}
		<div class="empty-state">{@render emptyState()}</div>
	{/if}

	<div class="layout">
		<div class="day-nav">
			{@render dayList()}
		</div>

		<div class="day-panel">
			{@render selectedDay()}
		</div>
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

	/* The day list is a vertical list of rows at every width — what changes is
	   only whether it sits above the selected day's content (narrow) or
	   beside it as a persistent column (wide). Never a grid of all seven
	   panels at once — exactly one day's content renders at a time. */
	.layout {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.day-nav {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	.day-panel {
		min-width: 0;
	}

	@media (width >= 768px) {
		.layout {
			flex-direction: row;
			align-items: flex-start;
		}

		.day-nav {
			flex: 0 0 14rem;
		}

		.day-panel {
			flex: 1;
		}
	}
</style>
