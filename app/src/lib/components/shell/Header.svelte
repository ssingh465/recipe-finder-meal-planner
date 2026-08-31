<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from './ThemeToggle.svelte';

	const NAV_LINKS = [
		{ label: 'Discover', href: '/' },
		{ label: 'My Recipes', href: '/my-recipes' },
		{ label: 'Favorites', href: '/favorites' },
		{ label: 'Planner', href: '/planner' }
	];

	let drawerOpen = $state(false);
	let hamburger: HTMLButtonElement | undefined;

	function isActive(href: string): boolean {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}

	function closeDrawer(): void {
		if (!drawerOpen) return;
		drawerOpen = false;
		hamburger?.focus();
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') closeDrawer();
	}
</script>

<svelte:window onkeydown={drawerOpen ? handleKeydown : undefined} />

<header class="header">
	<div class="bar">
		<a href="/" class="wordmark">Recipe Finder</a>

		<nav class="nav-desktop" aria-label="Main">
			{#each NAV_LINKS as link (link.href)}
				<a href={link.href} aria-current={isActive(link.href) ? 'page' : undefined}>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="controls">
			<ThemeToggle />

			<button
				bind:this={hamburger}
				class="hamburger"
				type="button"
				aria-expanded={drawerOpen}
				aria-label="Menu"
				onclick={() => (drawerOpen = !drawerOpen)}
			>
				<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
					<path
						d="M4 6h16M4 12h16M4 18h16"
						stroke="currentColor"
						stroke-width="1.75"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</div>

	{#if drawerOpen}
		<nav class="drawer" aria-label="Main">
			{#each NAV_LINKS as link (link.href)}
				<a
					href={link.href}
					aria-current={isActive(link.href) ? 'page' : undefined}
					onclick={closeDrawer}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		background: var(--c-surface);
		border-bottom: 1px solid var(--c-border);
	}

	.bar {
		max-width: 1200px;
		margin-inline: auto;
		padding-inline: var(--s-4);
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
	}

	@media (width >= 768px) {
		.bar {
			height: 64px;
			padding-inline: var(--s-5);
		}
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: var(--fs-h3);
		font-weight: 600;
		text-decoration: none;
		color: var(--c-text);
	}

	.nav-desktop {
		display: none;
		gap: var(--s-5);
	}

	.nav-desktop a,
	.drawer a {
		font-family: var(--font-text);
		font-size: var(--fs-sm);
		font-weight: 500;
		text-decoration: none;
		color: var(--c-text-muted);
		padding-block: var(--s-2);
		border-bottom: 2px solid transparent;
	}

	.nav-desktop a[aria-current='page'],
	.drawer a[aria-current='page'] {
		color: var(--c-text);
		font-weight: 700;
		border-bottom-color: var(--c-accent);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-3);
	}

	.hamburger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		background: transparent;
		border: none;
		color: var(--c-text);
		cursor: pointer;
		border-radius: var(--r-md);
	}

	.drawer {
		display: flex;
		flex-direction: column;
		gap: var(--s-1);
		padding: var(--s-4);
		border-top: 1px solid var(--c-border);
	}

	.drawer a {
		padding: var(--s-3);
		border-radius: var(--r-sm);
		border-bottom-style: none;
	}

	.drawer a[aria-current='page'] {
		background: var(--c-accent-subtle);
		border-bottom-style: solid;
	}

	@media (width >= 768px) {
		.nav-desktop {
			display: flex;
		}

		.hamburger {
			display: none;
		}
	}
</style>
