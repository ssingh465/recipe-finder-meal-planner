<script lang="ts">
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';

	interface Props {
		backHref: string;
		backLabel: string;
		title: string;
		meta?: Snippet;
		media?: Snippet;
		actions?: Snippet;
		ingredients: Snippet;
		instructions: Snippet;
		sourceLinks?: Snippet;
	}

	let { backHref, backLabel, title, meta, media, actions, ingredients, instructions, sourceLinks }: Props =
		$props();

	// Uses browser history so "Back" returns to wherever the user actually came
	// from (a filtered discovery view, favorites, the planner); falls back to
	// backHref when there is no history entry to return to, e.g. a direct visit.
	function handleBackClick(event: MouseEvent): void {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		// A click handler only ever runs in the browser, so `window` is safe here.
		// eslint-disable-next-line no-restricted-globals
		if (window.history.length > 1) {
			// eslint-disable-next-line no-restricted-globals
			window.history.back();
		} else {
			goto(backHref);
		}
	}
</script>

<div class="page">
	<a href={backHref} class="back" onclick={handleBackClick}>
		<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
			<path d="M19 12H5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
			<path
				d="m12 19-7-7 7-7"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
		</svg>
		{backLabel}
	</a>

	<h1>{title}</h1>

	{#if meta}
		<div class="meta">{@render meta()}</div>
	{/if}

	{#if media}
		<div class="media">{@render media()}</div>
	{/if}

	{#if actions}
		<div class="actions">{@render actions()}</div>
	{/if}

	<div class="body">
		<div class="ingredients">{@render ingredients()}</div>
		<div class="instructions">{@render instructions()}</div>
	</div>

	{#if sourceLinks}
		<div class="source-links">{@render sourceLinks()}</div>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		font-size: var(--fs-sm);
		color: var(--c-text-muted);
		text-decoration: none;
		align-self: flex-start;
	}

	h1 {
		font-size: var(--fs-display);
	}

	.meta,
	.actions {
		display: flex;
		gap: var(--s-3);
		flex-wrap: wrap;
	}

	.body {
		display: grid;
		gap: var(--s-6);
		grid-template-columns: 1fr;
	}

	.instructions {
		max-width: 68ch;
		font-size: var(--fs-body-lg);
		line-height: 1.65;
	}

	.ingredients {
		max-width: 48ch;
	}

	@media (width >= 1024px) {
		.body {
			grid-template-columns: 4fr 8fr;
		}
	}
</style>
