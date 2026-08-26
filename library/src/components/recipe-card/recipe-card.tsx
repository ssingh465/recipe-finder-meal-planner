import { Component, Prop, Event, EventEmitter, Host, h } from '@stencil/core';
import type { RecipeSummary } from '../../utils/types';
import { tileHue } from '../../utils/tile-hue';
import { HeartIcon } from '../../utils/icons';

/**
 * The app's primary discovery/favorites/planner unit. Height is fixed
 * regardless of content, via --rc-card-height (falls back to 22rem) so a
 * consumer can size it while it stays a single value everywhere it's read —
 * recipe-card:not(:defined) must reserve the same value so an unregistered
 * element doesn't cause a layout jump.
 */
@Component({
  tag: 'recipe-card',
  styleUrl: 'recipe-card.css',
  shadow: true,
})
export class RecipeCard {
  @Prop() recipe!: RecipeSummary;
  @Prop() favorited = false;
  @Prop() href!: string;

  @Event() favoritetoggle: EventEmitter<{ recipeId: string }>;
  @Event() recipeselect: EventEmitter<{ recipeId: string }>;

  private handleTitleClick = (event: MouseEvent) => {
    // A plain left click is intercepted so the app can use client-side
    // routing; a modified click (new tab, middle-click) keeps native
    // anchor behaviour, which is the whole reason this is a real <a>.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    this.recipeselect.emit({ recipeId: this.recipe.id });
  };

  private handleFavoriteClick = () => {
    this.favoritetoggle.emit({ recipeId: this.recipe.id });
  };

  private renderMedia() {
    const { thumbnail, name } = this.recipe;
    if (thumbnail) {
      return <img part="media" class="media" src={thumbnail} alt="" loading="lazy" decoding="async" />;
    }
    const hue = tileHue(name);
    return (
      <div part="media" class="media tile" style={{ '--tile-h': String(hue) }}>
        <span class="tile-name">{name}</span>
      </div>
    );
  }

  render() {
    const { recipe, favorited, href } = this;
    // Svelte assigns object properties on custom elements only after they've
    // upgraded; a render in the narrow window before that (or a consumer
    // that hasn't set the prop yet) must degrade to nothing, never throw.
    if (!recipe || typeof recipe !== 'object') {
      return <Host></Host>;
    }
    return (
      <Host>
        <article part="card" class="card">
          {this.renderMedia()}
          <div class="body">
            <a part="title" class="title" href={href} onClick={this.handleTitleClick}>
              {recipe.name}
            </a>
            <p class="meta">{[recipe.category, recipe.area].filter(Boolean).join(' · ')}</p>
            <div class="actions-row">
              <button
                type="button"
                class="favorite"
                aria-pressed={favorited ? 'true' : 'false'}
                aria-label={favorited ? `Remove ${recipe.name} from favorites` : `Add ${recipe.name} to favorites`}
                onClick={this.handleFavoriteClick}
              >
                {HeartIcon(favorited)}
              </button>
              <div part="actions" class="actions">
                <slot name="actions"></slot>
              </div>
            </div>
          </div>
        </article>
      </Host>
    );
  }
}
