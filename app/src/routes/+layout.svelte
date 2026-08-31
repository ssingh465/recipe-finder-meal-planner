<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/global.css';
	import Header from '$lib/components/shell/Header.svelte';
	import StorageBanner from '$lib/components/shell/StorageBanner.svelte';
	import ToastLayer from '$lib/components/shell/ToastLayer.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	// $effect never runs during SSR, so this is the client-only hydration point for
	// all four stores — every route below can read them without racing storage.
	$effect(() => {
		favorites.hydrate();
		plan.hydrate();
		recipes.hydrate();
		theme.hydrate();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />
<StorageBanner />

<main>
	{@render children()}
</main>

<ToastLayer />

<style>
	main {
		max-width: 1200px;
		margin-inline: auto;
		padding-inline: var(--s-4);
		padding-block: var(--s-6);
	}

	@media (width >= 768px) {
		main {
			padding-inline: var(--s-5);
		}
	}

	@media (width >= 1024px) {
		main {
			padding-inline: var(--s-6);
		}
	}
</style>
