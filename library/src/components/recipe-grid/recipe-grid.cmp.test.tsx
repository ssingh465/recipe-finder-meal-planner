import { render, h, describe, it, expect } from '@stencil/vitest';

describe('recipe-grid', () => {
  it('defaults to 4 columns', async () => {
    const { root } = await render(<recipe-grid></recipe-grid>);
    expect(root.shadowRoot?.querySelector('.grid')?.getAttribute('style')).toContain('--columns: 4');
  });

  it('reflects the columns prop', async () => {
    const { root } = await render(<recipe-grid columns={2}></recipe-grid>);
    expect(root.shadowRoot?.querySelector('.grid')?.getAttribute('style')).toContain('--columns: 2');
  });

  it('projects the default slot', async () => {
    const { root } = await render(
      <recipe-grid>
        <div class="card-stub">card</div>
      </recipe-grid>,
    );
    expect(root.querySelector('.card-stub')?.textContent).toBe('card');
  });
});
