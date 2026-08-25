import { Component, Prop, Host, h } from '@stencil/core';

/**
 * A generic shell for empty results — the app slots in the wording and,
 * optionally, a call-to-action button.
 */
@Component({
  tag: 'empty-state',
  styleUrl: 'empty-state.css',
  shadow: true,
})
export class EmptyState {
  @Prop() heading!: string;

  render() {
    return (
      <Host>
        <div part="container" class="container">
          <h2 part="heading" class="heading">
            {this.heading}
          </h2>
          <div class="body">
            <slot></slot>
          </div>
          <div class="action">
            <slot name="action"></slot>
          </div>
        </div>
      </Host>
    );
  }
}
