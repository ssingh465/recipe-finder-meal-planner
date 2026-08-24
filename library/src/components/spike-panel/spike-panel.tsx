import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';

export interface SpikeNote {
  from: string;
  message: string;
}

/**
 * Integration spike only. Proves the Stencil <-> SvelteKit seam (object
 * property, custom event, slot) end to end. Not part of the real component
 * set to come.
 */
@Component({
  tag: 'spike-panel',
  styleUrl: 'spike-panel.css',
  shadow: true,
})
export class SpikePanel {
  /** Arrives as an object property once the element has upgraded. */
  @Prop() note?: SpikeNote;

  /** Lowercase, so it binds as a plain Svelte `on*` attribute. */
  @Event() spikeaction: EventEmitter<SpikeNote>;

  private handleClick = () => {
    this.spikeaction.emit(this.note ?? { from: 'spike-panel', message: 'no note received' });
  };

  render() {
    return (
      <Host>
        <p>
          {this.note
            ? `From ${this.note.from}: ${this.note.message}`
            : 'Waiting for an object property...'}
        </p>
        <button type="button" onClick={this.handleClick}>
          Emit spikeaction
        </button>
        <div class="slot-wrap">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
