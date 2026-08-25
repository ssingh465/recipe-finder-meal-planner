<script lang="ts">
	import { toasts, dismissToast } from '$lib/stores/toast.svelte';
</script>

<div class="toast-layer" role="status" aria-live="polite">
	{#each toasts as toast (toast.id)}
		<div class="toast">
			<p>{toast.message}</p>
			<button type="button" aria-label="Dismiss" onclick={() => dismissToast(toast.id)}>
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
	{/each}
</div>

<style>
	.toast-layer {
		position: fixed;
		bottom: var(--s-5);
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--s-2);
		pointer-events: none;
	}

	.toast {
		pointer-events: auto;
		min-width: 280px;
		max-width: 420px;
		background: var(--c-surface);
		border: 1px solid var(--c-border);
		border-radius: var(--r-md);
		box-shadow: var(--sh-2);
		padding: var(--s-3) var(--s-4);
		display: flex;
		align-items: center;
		gap: var(--s-3);
		animation: toast-in var(--dur-base) var(--ease);
	}

	.toast p {
		margin: 0;
		font-size: var(--fs-sm);
		flex: 1;
	}

	.toast button {
		flex-shrink: 0;
		width: 32px;
		height: 32px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--c-text-muted);
		cursor: pointer;
		border-radius: var(--r-sm);
	}

	@keyframes toast-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
