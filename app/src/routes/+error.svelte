<script lang="ts">
	import ScaffoldMessage from '$lib/components/scaffolds/ScaffoldMessage.svelte';
</script>

<svelte:head>
	<title>Page not found · Recipe Finder</title>
</svelte:head>

<ScaffoldMessage
	heading="Page not found"
	body="The page you're looking for doesn't exist."
>
	{#snippet actions()}
		<a href="/" class="btn primary">Go to Discover</a>
		<a href="/my-recipes" class="btn secondary">Go to My Recipes</a>
	{/snippet}
</ScaffoldMessage>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		padding-inline: var(--s-4);
		border-radius: var(--r-md);
		font-size: var(--fs-sm);
		font-weight: 500;
		text-decoration: none;
	}

	.primary {
		background: var(--c-accent);
		color: var(--c-on-accent);
	}

	.secondary {
		background: transparent;
		color: var(--c-text);
		border: 1px solid var(--c-border-strong);
	}
</style>
