<script lang="ts">
	import { storageStatus, setStorageFault } from '$lib/stores/storage-status.svelte';

	const COPY = {
		quota: 'Browser storage is full. Your changes may not be saved.',
		unavailable:
			'Your browser has storage disabled. Favorites and meal plans will be lost when you close this tab.'
	} as const;

	let dismissed = $state(false);

	$effect(() => {
		if (storageStatus.fault) dismissed = false;
	});
</script>

{#if storageStatus.fault && !dismissed}
	<div class="banner" role="status">
		<p>{COPY[storageStatus.fault]}</p>
		<button
			type="button"
			aria-label="Dismiss"
			onclick={() => {
				dismissed = true;
				setStorageFault(null);
			}}
		>
			<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
				<path
					d="M6 6l12 12M18 6L6 18"
					stroke="currentColor"
					stroke-width="1.75"
					stroke-linecap="round"
				/>
			</svg>
		</button>
	</div>
{/if}

<style>
	.banner {
		background: var(--c-warning-subtle);
		color: var(--c-warning);
		border-bottom: 1px solid var(--c-border);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-4);
		padding: var(--s-3) var(--s-4);
		text-align: center;
	}

	.banner p {
		margin: 0;
		font-size: var(--fs-sm);
	}

	.banner button {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		border-radius: var(--r-sm);
	}
</style>
