import { render, h, describe, it, expect } from '@stencil/vitest';

describe('empty-state', () => {
  it('renders the heading', async () => {
    const { root } = await render(<empty-state heading="No favorites yet"></empty-state>);
    expect(root.shadowRoot?.querySelector('.heading')?.textContent).toBe('No favorites yet');
  });

  it('projects the default and action slots', async () => {
    const { root } = await render(
      <empty-state heading="No favorites yet">
        <p>Save recipes to see them here.</p>
        <button slot="action">Discover recipes</button>
      </empty-state>,
    );
    expect(root.querySelector('p')?.textContent).toBe('Save recipes to see them here.');
    expect(root.querySelector('[slot="action"]')?.textContent).toBe('Discover recipes');
  });
});
