<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		heading: string;
		children: Snippet;
		actions?: Snippet;
		onclose: () => void;
	}

	let { open, heading, children, actions, onclose }: Props = $props();

	let dialog: HTMLDivElement | undefined = $state();
	let triggerElement: Element | null = null;

	$effect(() => {
		if (open) {
			triggerElement = document.activeElement;
			// The first focusable control (typically the safe action, e.g. Cancel)
			// rather than the dialog shell itself, so opening the modal puts focus
			// somewhere a keyboard user can immediately act on.
			const focusable = dialog?.querySelector<HTMLElement>(
				'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);
			(focusable ?? dialog)?.focus();
		} else if (triggerElement instanceof HTMLElement) {
			triggerElement.focus();
		}
	});

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onclose();
			return;
		}
		if (event.key !== 'Tab' || !dialog) return;
		const focusable = dialog.querySelectorAll<HTMLElement>(
			'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

{#if open}
	<div class="backdrop" onclick={onclose} role="presentation">
		<div
			bind:this={dialog}
			class="dialog"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-heading"
			tabindex="-1"
			onkeydown={handleKeydown}
			onclick={(event) => event.stopPropagation()}
		>
			<h2 id="modal-heading">{heading}</h2>
			<div class="body">
				{@render children()}
			</div>
			{#if actions}
				<div class="actions">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-modal-backdrop);
		background: rgb(42 36 32 / 50%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--s-4);
	}

	@media (prefers-color-scheme: dark) {
		.backdrop {
			background: rgb(0 0 0 / 65%);
		}
	}

	.dialog {
		z-index: var(--z-modal);
		width: 100%;
		max-width: 420px;
		background: var(--c-surface);
		border-radius: var(--r-lg);
		box-shadow: var(--sh-3);
		padding: var(--s-5);
		animation: modal-in var(--dur-modal) var(--ease);
	}

	.dialog h2 {
		font-size: var(--fs-h2);
		margin-bottom: var(--s-4);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-3);
		margin-top: var(--s-5);
	}

	@media (width <= 767px) {
		.actions {
			flex-direction: column-reverse;
		}
	}

	@keyframes modal-in {
		from {
			opacity: 0;
			transform: scale(0.98);
		}

		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
