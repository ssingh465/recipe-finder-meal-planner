import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import type { DayOfWeek, PlannerEntry } from '../../utils/types';
import { ArrowRightLeftIcon, ChevronDownIcon, Trash2Icon } from '../../utils/icons';

/**
 * One day's column/section in the planner. Owns its complete accessible
 * name from its own props — `dayLabel` becomes the region's name because
 * ARIA relationships cannot cross the shadow boundary.
 *
 * Deliberately has no `today` prop: the planner is a dateless recurring
 * week, so there is nothing to derive "today" from.
 */
@Component({
  tag: 'planner-day',
  styleUrl: 'planner-day.css',
  shadow: true,
})
export class PlannerDay {
  @Prop() day!: DayOfWeek;
  @Prop() dayLabel!: string;
  @Prop() entries: PlannerEntry[] = [];
  @Prop() collapsed = false;

  @Event() entryremove: EventEmitter<{ recipeId: string; day: DayOfWeek }>;
  @Event() entrymoverequest: EventEmitter<{ recipeId: string; fromDay: DayOfWeek }>;
  @Event() daytoggle: EventEmitter<{ day: DayOfWeek; collapsed: boolean }>;
  @Event() recipeselect: EventEmitter<{ recipeId: string }>;

  private handleToggle = () => {
    this.daytoggle.emit({ day: this.day, collapsed: !this.collapsed });
  };

  private renderEntry(entry: PlannerEntry) {
    return (
      <li part="entry" class="entry" key={entry.recipeId}>
        {entry.thumbnail ? (
          <img class="thumb" src={entry.thumbnail} alt="" loading="lazy" decoding="async" />
        ) : (
          <span class="thumb placeholder" aria-hidden="true"></span>
        )}
        <button
          type="button"
          class="name"
          onClick={() => this.recipeselect.emit({ recipeId: entry.recipeId })}
        >
          {entry.name}
        </button>
        <div class="row-actions">
          <button
            type="button"
            class="icon-button"
            aria-label={`Move ${entry.name}`}
            onClick={() => this.entrymoverequest.emit({ recipeId: entry.recipeId, fromDay: this.day })}
          >
            {ArrowRightLeftIcon()}
          </button>
          <button
            type="button"
            class="icon-button"
            aria-label={`Remove ${entry.name} from ${this.dayLabel}`}
            onClick={() => this.entryremove.emit({ recipeId: entry.recipeId, day: this.day })}
          >
            {Trash2Icon()}
          </button>
        </div>
      </li>
    );
  }

  render() {
    const { collapsed, dayLabel } = this;
    // Svelte assigns array properties on custom elements only after they've
    // upgraded; a render in the narrow window before that must see an empty
    // list, never throw on a stringified attribute.
    const entries = Array.isArray(this.entries) ? this.entries : [];
    return (
      <Host>
        <section part="region" class="region" role="region" aria-label={dayLabel}>
          <div part="header" class="header">
            <h3 class="day-name">{dayLabel}</h3>
            <span class="count">{entries.length}</span>
            <button
              type="button"
              class={{ 'toggle': true, 'is-collapsed': collapsed }}
              aria-expanded={collapsed ? 'false' : 'true'}
              aria-label={collapsed ? `Expand ${dayLabel}` : `Collapse ${dayLabel}`}
              onClick={this.handleToggle}
            >
              {ChevronDownIcon()}
            </button>
          </div>
          {!collapsed &&
            (entries.length ? (
              <ul class="entries">{entries.map((entry) => this.renderEntry(entry))}</ul>
            ) : (
              <div class="empty">
                <slot name="empty"></slot>
              </div>
            ))}
        </section>
      </Host>
    );
  }
}
