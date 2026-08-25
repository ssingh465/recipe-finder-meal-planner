import { render, h, describe, it, expect } from '@stencil/vitest';

describe('filter-chip', () => {
  it('renders the label', async () => {
    const { root } = await render(<filter-chip label="Chicken" value="Chicken" dimension="category"></filter-chip>);
    expect(root.shadowRoot?.querySelector('.label')?.textContent).toBe('Chicken');
  });

  it('emits chiptoggle with the dimension and value on remove', async () => {
    const { root, waitForChanges } = await render(
      <filter-chip label="Japanese" value="Japanese" dimension="area"></filter-chip>,
    );
    const events: unknown[] = [];
    root.addEventListener('chiptoggle', (event: Event) => events.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelector('button.remove')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await waitForChanges();
    expect(events).toEqual([{ dimension: 'area', value: 'Japanese' }]);
  });
});
