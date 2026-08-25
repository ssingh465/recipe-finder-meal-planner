<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		primaryAction?: Snippet;
		controls?: Snippet;
		notice?: Snippet;
		content: Snippet;
		pagination?: Snippet;
	}

	let { title, primaryAction, controls, notice, content, pagination }: Props = $props();
</script>

<div class="page">
	<div class="page-header">
		<h1>{title}</h1>
		{#if primaryAction}
			<div class="primary-action">{@render primaryAction()}</div>
		{/if}
	</div>

	{#if controls}
		<div class="controls">{@render controls()}</div>
	{/if}

	{#if notice}
		<div class="notice">{@render notice()}</div>
	{/if}

	<div class="content">
		{@render content()}
	</div>

	{#if pagination}
		<div class="pagination">{@render pagination()}</div>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
	}

	.page-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-4);
		flex-wrap: wrap;
	}

	.page-header h1 {
		font-size: var(--fs-h1);
	}

	.pagination {
		display: flex;
		justify-content: center;
	}
</style>
