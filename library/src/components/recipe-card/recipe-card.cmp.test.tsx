import { render, h, describe, it, expect, vi } from '@stencil/vitest';

const recipe = {
  id: '52772',
  source: 'api' as const,
  name: 'Teriyaki Chicken',
  thumbnail: 'https://example.com/thumb.jpg',
  category: 'Chicken',
  area: 'Japanese',
};

describe('recipe-card', () => {
  it('renders the recipe name, meta and href', async () => {
    const { root } = await render(<recipe-card recipe={recipe} href="/recipes/52772"></recipe-card>);
    const link = root.shadowRoot?.querySelector('a.title');
    expect(link?.textContent?.trim()).toBe('Teriyaki Chicken');
    expect(link?.getAttribute('href')).toBe('/recipes/52772');
    expect(root.shadowRoot?.querySelector('.meta')?.textContent).toBe('Chicken · Japanese');
  });

  it('renders an image when a thumbnail is present', async () => {
    const { root } = await render(<recipe-card recipe={recipe} href="/recipes/52772"></recipe-card>);
    expect(root.shadowRoot?.querySelector('img.media')?.getAttribute('src')).toBe(recipe.thumbnail);
  });

  it('renders a typographic tile when the thumbnail is null', async () => {
    const { root } = await render(
      <recipe-card recipe={{ ...recipe, thumbnail: null }} href="/recipes/usr_1"></recipe-card>,
    );
    expect(root.shadowRoot?.querySelector('img.media')).toBeNull();
    expect(root.shadowRoot?.querySelector('.tile-name')?.textContent).toBe('Teriyaki Chicken');
  });

  it('emits recipeselect on a plain title click and prevents default navigation', async () => {
    const { root, waitForChanges } = await render(<recipe-card recipe={recipe} href="/recipes/52772"></recipe-card>);
    const events: unknown[] = [];
    root.addEventListener('recipeselect', (event: Event) => events.push((event as CustomEvent).detail));
    const link = root.shadowRoot?.querySelector('a.title') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    link.dispatchEvent(event);
    await waitForChanges();
    expect(events).toEqual([{ recipeId: '52772' }]);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('reflects the favorited prop and emits favoritetoggle', async () => {
    const { root, waitForChanges } = await render(
      <recipe-card recipe={recipe} href="/recipes/52772" favorited={true}></recipe-card>,
    );
    const button = root.shadowRoot?.querySelector('button.favorite');
    expect(button?.getAttribute('aria-pressed')).toBe('true');

    const events: unknown[] = [];
    root.addEventListener('favoritetoggle', (event: Event) => events.push((event as CustomEvent).detail));
    (button as HTMLButtonElement).click();
    await waitForChanges();
    expect(events).toEqual([{ recipeId: '52772' }]);
  });

  it('projects content into the actions slot', async () => {
    const { root } = await render(
      <recipe-card recipe={recipe} href="/recipes/52772">
        <button slot="actions">Add to plan</button>
      </recipe-card>,
    );
    expect(root.querySelector('[slot="actions"]')?.textContent).toBe('Add to plan');
  });
});
