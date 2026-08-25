import { Component, Prop, Host, h } from '@stencil/core';

/**
 * A responsive card grid with an explicit column count (DESIGN §6.3) —
 * never `auto-fill`, so the app decides the breakpoint behaviour instead of
 * the browser guessing it.
 */
@Component({
  tag: 'recipe-grid',
  styleUrl: 'recipe-grid.css',
  shadow: true,
})
export class RecipeGrid {
  @Prop() columns: 1 | 2 | 3 | 4 = 4;

  render() {
    return (
      <Host>
        <div part="grid" class="grid" style={{ '--columns': String(this.columns) }}>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
