import { render, h, describe, it, expect } from '@stencil/vitest';

describe('spike-panel', () => {
  it('renders without a note', async () => {
    const { root } = await render(<spike-panel></spike-panel>);
    expect(root.shadowRoot?.querySelector('p')?.textContent).toBe('Waiting for an object property...');
  });

  it('renders an object property and projects a slot', async () => {
    const { root } = await render(
      <spike-panel note={{ from: 'test', message: 'hello' }}>
        <span>projected</span>
      </spike-panel>,
    );
    expect(root.shadowRoot?.querySelector('p')?.textContent).toBe('From test: hello');
    expect(root.querySelector('span')?.textContent).toBe('projected');
  });

  it('emits spikeaction on click', async () => {
    const { root, waitForChanges } = await render(
      <spike-panel note={{ from: 'test', message: 'click me' }}></spike-panel>,
    );
    const events: unknown[] = [];
    root.addEventListener('spikeaction', (event: Event) => events.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelector('button')?.click();
    await waitForChanges();
    expect(events).toEqual([{ from: 'test', message: 'click me' }]);
  });
});
