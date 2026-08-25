# day-picker



<!-- Auto Generated Below -->


## Overview

The most-used component in the system (DESIGN §7.10) — assigns a recipe
to a day of the plan. Stateless: occupancy is an input (`DayOption.occupied`),
never inferred from a store.

The panel uses the native Popover API (`popover="manual"`) so it renders
in the browser's top layer — the one mechanism that reliably escapes a
card's `overflow: hidden` and any transformed ancestor's containing
block, which plain `position: fixed` inside a shadow tree does not.

## Properties

| Property                | Attribute   | Description | Type          | Default     |
| ----------------------- | ----------- | ----------- | ------------- | ----------- |
| `days` _(required)_     | --          |             | `DayOption[]` | `undefined` |
| `label` _(required)_    | `label`     |             | `string`      | `undefined` |
| `recipeId` _(required)_ | `recipe-id` |             | `string`      | `undefined` |


## Events

| Event         | Description | Type                                                 |
| ------------- | ----------- | ---------------------------------------------------- |
| `pickerclose` |             | `CustomEvent<never \| string>`                       |
| `planassign`  |             | `CustomEvent<{ recipeId: string; day: DayOfWeek; }>` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"day"`     |             |
| `"panel"`   |             |
| `"trigger"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
