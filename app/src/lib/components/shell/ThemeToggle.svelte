<script lang="ts">
	import { theme, type ThemeMode } from '$lib/stores/theme.svelte';

	const OPTIONS: { mode: ThemeMode; label: string }[] = [
		{ mode: 'light', label: 'Light' },
		{ mode: 'system', label: 'System' },
		{ mode: 'dark', label: 'Dark' }
	];

	let buttons: HTMLButtonElement[] = $state([]);

	function handleKeydown(event: KeyboardEvent, index: number): void {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const delta = event.key === 'ArrowRight' ? 1 : -1;
		const next = (index + delta + OPTIONS.length) % OPTIONS.length;
		theme.setMode(OPTIONS[next].mode);
		buttons[next]?.focus();
	}
</script>

<div class="toggle" role="radiogroup" aria-label="Theme">
	{#each OPTIONS as option, index (option.mode)}
		<button
			bind:this={buttons[index]}
			type="button"
			role="radio"
			aria-checked={theme.mode === option.mode}
			class:active={theme.mode === option.mode}
			tabindex={theme.mode === option.mode ? 0 : -1}
			onclick={() => theme.setMode(option.mode)}
			onkeydown={(event) => handleKeydown(event, index)}
		>
			<!-- The check glyph is the non-colour cue for the selected segment — the
			     gradient fill reinforces it but is never the only signal. -->
			{#if theme.mode === option.mode}
				<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
					<path
						d="M5 13l4 4L19 7"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						fill="none"
					/>
				</svg>
			{/if}
			<span>{option.label}</span>
		</button>
	{/each}
</div>

<style>
	.toggle {
		display: inline-flex;
		gap: var(--s-1);
		padding: var(--s-1);
		border-radius: var(--r-full);
		background: var(--c-surface-sunken);
		border: 1px solid var(--c-border);
	}

	button {
		display: inline-flex;
		align-items: center;
		gap: var(--s-1);
		height: 32px;
		padding-inline: var(--s-3);
		border: none;
		border-radius: var(--r-full);
		background: transparent;
		color: var(--c-text-muted);
		font-family: var(--font-text);
		font-size: var(--fs-xs);
		font-weight: var(--fw-medium);
		cursor: pointer;
		transition:
			background var(--dur-base) var(--ease),
			color var(--dur-base) var(--ease);
	}

	button:hover {
		color: var(--c-text);
	}

	button.active {
		background: var(--cx-grad-accent);
		color: var(--c-on-vivid);
	}

	button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	@media (width <= 767px) {
		.toggle {
			padding: var(--s-2);
		}

		button {
			height: 44px;
		}
	}
</style>
