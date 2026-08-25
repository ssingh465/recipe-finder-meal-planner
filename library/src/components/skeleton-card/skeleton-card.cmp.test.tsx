import { render, h, describe, it, expect } from '@stencil/vitest';

describe('skeleton-card', () => {
  it('renders one placeholder by default', async () => {
    const { root } = await render(<skeleton-card></skeleton-card>);
    expect(root.shadowRoot?.querySelectorAll('.skeleton').length).toBe(1);
  });

  it('renders `count` placeholders', async () => {
    const { root } = await render(<skeleton-card count={8}></skeleton-card>);
    expect(root.shadowRoot?.querySelectorAll('.skeleton').length).toBe(8);
  });
});
