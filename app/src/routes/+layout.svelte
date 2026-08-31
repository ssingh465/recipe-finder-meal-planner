<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/global.css';
	import { onNavigate } from '$app/navigation';
	import Header from '$lib/components/shell/Header.svelte';
	import StorageBanner from '$lib/components/shell/StorageBanner.svelte';
	import ToastLayer from '$lib/components/shell/ToastLayer.svelte';
	import { favorites } from '$lib/stores/favorites.svelte';
	import { plan } from '$lib/stores/planner.svelte';
	import { recipes } from '$lib/stores/recipes.svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { reducedMotion } from '$lib/utils/reducedMotion.svelte';

	let { children } = $props();

	// $effect never runs during SSR, so this is the client-only hydration point for
	// all four stores — every route below can read them without racing storage.
	$effect(() => {
		favorites.hydrate();
		plan.hydrate();
		recipes.hydrate();
		theme.hydrate();
	});

	// A page-level cross-fade between routes — but never for a same-route
	// navigation. `/`'s search/filter/pagination state lives in the URL
	// (?q, ?category, ?area, ?page), so every filter tweak is technically a
	// "navigation" too; wrapping those in a full-page transition would make
	// picking a category feel like leaving the page. from.route.id ===
	// to.route.id is exactly "same route, only params changed" — the content
	// swap inside it stays instant, only real navigations between routes
	// cross-fade.
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		if (reducedMotion.current) return;
		if (navigation.from?.route.id === navigation.to?.route.id) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
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
