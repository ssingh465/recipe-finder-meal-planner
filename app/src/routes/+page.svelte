<script lang="ts">
	let panel: HTMLElement | undefined;
	let received = $state<{ from: string; message: string } | null>(null);

	const note = { from: 'SvelteKit /', message: 'component library integration spike' };

	$effect(() => {
		// Belt-and-suspenders: assign the property directly once the element is in the
		// DOM, on top of registration in hooks.client.ts.
		if (panel) {
			(panel as unknown as { note: typeof note }).note = note;
		}
	});

	function handleSpikeAction(event: Event) {
		received = (event as CustomEvent<{ from: string; message: string }>).detail;
	}
</script>

<svelte:head>
	<title>Integration spike</title>
</svelte:head>

<h1>Integration spike</h1>
<p>
	<code>@ssingh465/recipe-ui</code> installed from the npm registry, rendering
	<code>&lt;spike-panel&gt;</code> below with an object property, a lowercase custom event, and a
	slot.
</p>

<spike-panel bind:this={panel} onspikeaction={handleSpikeAction}>
	<p>Slotted content, projected from the SvelteKit app.</p>
</spike-panel>

{#if received}
	<p data-testid="spike-event-result">
		Event received: {received.from} says &ldquo;{received.message}&rdquo;
	</p>
{/if}

<style>
	/* Reserve space so an unregistered custom element doesn't cause a layout jump. */
	:global(spike-panel:not(:defined)) {
		display: block;
		min-height: 6rem;
		visibility: hidden;
	}
</style>
