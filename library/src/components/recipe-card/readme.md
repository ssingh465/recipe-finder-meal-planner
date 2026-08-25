# recipe-card



<!-- Auto Generated Below -->


## Overview

The app's primary discovery/favorites/planner unit (DESIGN §7.1). Fixed
22rem height regardless of content — recipe-card:not(:defined) must
reserve the same value (TRD §6.4b).

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
