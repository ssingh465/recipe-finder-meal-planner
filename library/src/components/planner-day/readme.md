# planner-day



<!-- Auto Generated Below -->


## Overview

One day's column/section in the planner. Owns its complete accessible
name from its own props — `dayLabel` becomes the region's name because
ARIA relationships cannot cross the shadow boundary.

Deliberately has no `today` prop: the planner is a dateless recurring
week, so there is nothing to derive "today" from.

## Properties

| Property                | Attribute   | Description | Type                                                          | Default     |
| ----------------------- | ----------- | ----------- | ------------------------------------------------------------- | ----------- |
| `collapsed`             | `collapsed` |             | `boolean`                                                     | `false`     |
| `day` _(required)_      | `day`       |             | `"fri" \| "mon" \| "sat" \| "sun" \| "thu" \| "tue" \| "wed"` | `undefined` |
| `dayLabel` _(required)_ | `day-label` |             | `string`                                                      | `undefined` |
| `entries`               | --          |             | `PlannerEntry[]`                                              | `[]`        |


## Events

| Event              | Description | Type                                                     |
| ------------------ | ----------- | -------------------------------------------------------- |
| `daytoggle`        |             | `CustomEvent<{ day: DayOfWeek; collapsed: boolean; }>`   |
| `entrymoverequest` |             | `CustomEvent<{ recipeId: string; fromDay: DayOfWeek; }>` |
| `entryremove`      |             | `CustomEvent<{ recipeId: string; day: DayOfWeek; }>`     |


## Slots

| Slot      | Description |
| --------- | ----------- |
| `"empty"` |             |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"entry"`  |             |
| `"header"` |             |
| `"region"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
