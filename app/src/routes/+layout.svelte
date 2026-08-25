<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/global.css';
	import Header from '$lib/components/shell/Header.svelte';
	import StorageBanner from '$lib/components/shell/StorageBanner.svelte';
	import ToastLayer from '$lib/components/shell/ToastLayer.svelte';

	let { children } = $props();
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
