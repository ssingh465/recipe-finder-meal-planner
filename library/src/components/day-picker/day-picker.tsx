import { Component, Prop, State, Event, EventEmitter, Host, h } from '@stencil/core';
import type { DayOfWeek, DayOption } from '../../utils/types';
import { CalendarPlusIcon, CheckIcon } from '../../utils/icons';

/**
 * Assigns a recipe to a day of the plan. Stateless: occupancy is an input
 * (`DayOption.occupied`), never inferred from a store.
 *
 * The panel uses the native Popover API (`popover="manual"`) so it renders
 * in the browser's top layer — the one mechanism that reliably escapes a
 * card's `overflow: hidden` and any transformed ancestor's containing
 * block, which plain `position: fixed` inside a shadow tree does not.
 */
@Component({
  tag: 'day-picker',
  styleUrl: 'day-picker.css',
  shadow: true,
})
export class DayPicker {
  @Prop() recipeId!: string;
  @Prop() days!: DayOption[];
  @Prop() label!: string;

  @Event() planassign: EventEmitter<{ recipeId: string; day: DayOfWeek }>;
  @Event() pickerclose: EventEmitter<Record<string, never>>;

  @State() open = false;
  @State() activeIndex = 0;

  private triggerEl?: HTMLButtonElement;
  private panelEl?: HTMLElement;
  private dayEls: HTMLButtonElement[] = [];
  private reposition = () => this.positionPanel();
  private handleOutsideClick = (event: PointerEvent) => {
    const path = event.composedPath();
    if (!this.triggerEl || !this.panelEl) return;
    if (!path.includes(this.triggerEl) && !path.includes(this.panelEl)) {
      this.closePanel(false);
    }
  };

  disconnectedCallback() {
    window.removeEventListener('resize', this.reposition);
    window.removeEventListener('scroll', this.reposition, true);
    document.removeEventListener('pointerdown', this.handleOutsideClick, true);
  }

  private positionPanel() {
    if (!this.triggerEl || !this.panelEl) return;
    const rect = this.triggerEl.getBoundingClientRect();
    const panelHeight = this.panelEl.offsetHeight || 7 * 44 + 16;
    const flipAbove = window.innerHeight - rect.bottom < 320;
    const top = flipAbove ? rect.top - panelHeight - 4 : rect.bottom + 4;
    this.panelEl.style.left = `${rect.left}px`;
    this.panelEl.style.top = `${top}px`;
  }

  private openPanel = () => {
    this.open = true;
    this.activeIndex = 0;
    requestAnimationFrame(() => {
      this.panelEl?.showPopover?.();
      this.positionPanel();
      this.dayEls[0]?.focus();
      window.addEventListener('resize', this.reposition);
      window.addEventListener('scroll', this.reposition, true);
      document.addEventListener('pointerdown', this.handleOutsideClick, true);
    });
  };

  private closePanel = (returnFocus: boolean) => {
    if (!this.open) return;
    this.open = false;
    this.panelEl?.hidePopover?.();
    window.removeEventListener('resize', this.reposition);
    window.removeEventListener('scroll', this.reposition, true);
    document.removeEventListener('pointerdown', this.handleOutsideClick, true);
    this.pickerclose.emit({});
    if (returnFocus) this.triggerEl?.focus();
  };

  // Svelte assigns object/array properties on custom elements only after
  // they've upgraded; a render (or keyboard handler) in the narrow window
  // before that must see an empty list, never throw on a stringified attribute.
  private get safeDays(): DayOption[] {
    return Array.isArray(this.days) ? this.days : [];
  }

  private selectDay(option: DayOption) {
    if (option.occupied) return;
    this.planassign.emit({ recipeId: this.recipeId, day: option.day });
    this.closePanel(true);
  }

  private focusIndex(index: number) {
    const count = this.safeDays.length;
    if (count === 0) return;
    this.activeIndex = (index + count) % count;
    this.dayEls[this.activeIndex]?.focus();
  }

  private handlePanelKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusIndex(this.activeIndex + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusIndex(this.activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.focusIndex(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusIndex(this.safeDays.length - 1);
        break;
      case 'Tab':
        event.preventDefault();
        break;
      case 'Escape':
        event.preventDefault();
        this.closePanel(true);
        break;
      default:
        break;
    }
  };

  render() {
    const { open, activeIndex } = this;
    const days = this.safeDays;
    return (
      <Host>
        <button
          type="button"
          part="trigger"
          class="trigger"
          ref={(el) => (this.triggerEl = el)}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => (this.open ? this.closePanel(true) : this.openPanel())}
        >
          {CalendarPlusIcon()}
          <span>{this.label}</span>
        </button>
        <div
          part="panel"
          class="panel"
          popover="manual"
          role="group"
          aria-label={this.label}
          ref={(el) => (this.panelEl = el)}
          onKeyDown={this.handlePanelKeydown}
        >
          {days.map((option, index) => (
            <button
              type="button"
              part="day"
              class={{ day: true, occupied: option.occupied }}
              tabIndex={index === activeIndex ? 0 : -1}
              aria-disabled={option.occupied ? 'true' : 'false'}
              ref={(el) => {
                if (el) this.dayEls[index] = el;
              }}
              onClick={() => this.selectDay(option)}
            >
              <span class="day-label">{option.label}</span>
              {option.occupied && (
                <span class="occupied-tag">
                  {CheckIcon()}
                  Already added
                </span>
              )}
            </button>
          ))}
        </div>
      </Host>
    );
  }
}
