# day-picker



<!-- Auto Generated Below -->


## Overview

Assigns a recipe to a day of the plan. Stateless: occupancy is an input
(`DayOption.occupied`), never inferred from a store.

The panel uses the native Popover API (`popover="manual"`) so it renders
in the browser's top layer — the one mechanism that reliably escapes a
card's `overflow: hidden` and any transformed ancestor's containing
block, which plain `position: fixed` inside a shadow tree does not.

`open()` lets a host open the panel without a user click on the trigger —
needed when the picker is surfaced in response to some other control (the
planner's `Move` action) rather than being the primary affordance on screen.

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


## Methods

### `open() => Promise<void>`

Opens the panel programmatically, exactly as a trigger click would.

#### Returns

Type: `Promise<void>`




## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"day"`     |             |
| `"panel"`   |             |
| `"trigger"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
