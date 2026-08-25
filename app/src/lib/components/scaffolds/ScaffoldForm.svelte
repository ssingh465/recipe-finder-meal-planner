<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		fields: Snippet;
		actionBar: Snippet;
	}

	let { title, fields, actionBar }: Props = $props();
</script>

<div class="page">
	<h1>{title}</h1>

	<div class="fields">
		{@render fields()}
	</div>

	<div class="action-bar">
		{@render actionBar()}
	</div>
</div>

<style>
	.page {
		max-width: 640px;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	h1 {
		font-size: var(--fs-h1);
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
	}

	.action-bar {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-3);
	}

	@media (width <= 767px) {
		.action-bar {
			position: sticky;
			bottom: 0;
			background: var(--c-bg);
			padding-block: var(--s-4);
			border-top: 1px solid var(--c-border);
		}
	}
</style>
