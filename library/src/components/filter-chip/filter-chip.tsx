import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import { XIcon } from '../../utils/icons';

/**
 * A chip only exists while its filter is active, so it has no `active` prop
 * and no separate clear event — removing it and clearing its dimension are
 * the same action.
 */
@Component({
  tag: 'filter-chip',
  styleUrl: 'filter-chip.css',
  shadow: true,
})
export class FilterChip {
  @Prop() label!: string;
  @Prop() value!: string;
  @Prop() dimension!: 'category' | 'area';

  @Event() chiptoggle: EventEmitter<{ dimension: 'category' | 'area'; value: string }>;

  private handleClick = () => {
    this.chiptoggle.emit({ dimension: this.dimension, value: this.value });
  };

  render() {
    return (
      <Host>
        <span part="chip" class="chip">
          <span class="label">{this.label}</span>
          <button
            type="button"
            part="remove"
            class="remove"
            aria-label={`Clear ${this.label} filter`}
            onClick={this.handleClick}
          >
            {XIcon()}
          </button>
        </span>
      </Host>
    );
  }
}
