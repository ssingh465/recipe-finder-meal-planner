import { Component, Prop, Host, h } from '@stencil/core';

/**
 * Loading placeholder that matches `recipe-card`'s geometry exactly, so the
 * reserved space for an undefined custom element holds and the grid does
 * not shift when real cards arrive.
 */
@Component({
  tag: 'skeleton-card',
  styleUrl: 'skeleton-card.css',
  shadow: true,
})
export class SkeletonCard {
  @Prop() count = 1;

  render() {
    const cards = Array.from({ length: Math.max(1, this.count) });
    return (
      <Host>
        {cards.map((_, index) => (
          <div part="skeleton" class="skeleton" key={index} aria-hidden="true">
            <div class="media"></div>
            <div class="body">
              <div class="line title"></div>
              <div class="line meta"></div>
            </div>
          </div>
        ))}
      </Host>
    );
  }
}
