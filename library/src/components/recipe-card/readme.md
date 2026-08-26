# recipe-card



<!-- Auto Generated Below -->


## Overview

The app's primary discovery/favorites/planner unit. Height is fixed
regardless of content, via --rc-card-height (falls back to 22rem) so a
consumer can size it while it stays a single value everywhere it's read —
recipe-card:not(:defined) must reserve the same value so an unregistered
element doesn't cause a layout jump.

## Properties

| Property              | Attribute   | Description | Type            | Default     |
| --------------------- | ----------- | ----------- | --------------- | ----------- |
| `favorited`           | `favorited` |             | `boolean`       | `false`     |
| `href` _(required)_   | `href`      |             | `string`        | `undefined` |
| `recipe` _(required)_ | --          |             | `RecipeSummary` | `undefined` |


## Events

| Event            | Description | Type                                 |
| ---------------- | ----------- | ------------------------------------ |
| `favoritetoggle` |             | `CustomEvent<{ recipeId: string; }>` |
| `recipeselect`   |             | `CustomEvent<{ recipeId: string; }>` |


## Slots

| Slot        | Description |
| ----------- | ----------- |
| `"actions"` |             |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"actions"` |             |
| `"card"`    |             |
| `"media"`   |             |
| `"title"`   |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
