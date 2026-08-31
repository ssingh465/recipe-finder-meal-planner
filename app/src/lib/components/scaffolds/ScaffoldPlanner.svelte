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

			/* minmax(0, 1fr), not a bare 1fr: a grid item's default minimum
			   width is its content's min-content size, and <planner-day> is a
			   host element the app can't add its own min-width: 0 inside of.
			   Without this, a day name that can't wrap (or any other
			   unshrinkable shadow-DOM content) forces its track wider than a
			   plain 1fr share — seven of those can add up to more than the
			   container's width, and since html/body block horizontal
			   scroll, the overflow was silently clipping the last day(s)
			   instead of ever becoming reachable. */
			grid-template-columns: repeat(7, minmax(0, 1fr));
			gap: var(--s-4);

			/* Belt-and-suspenders for any width this small a minmax(0, 1fr)
			   can't rescue on its own: scrolls inside its own container
			   rather than clipping or pushing the page itself wider. */
			overflow-x: auto;
		}
	}
</style>
