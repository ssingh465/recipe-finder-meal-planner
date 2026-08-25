# filter-chip



<!-- Auto Generated Below -->


## Overview

A chip only exists while its filter is active (TRD §7.1), so it has no
`active` prop and no separate `chipclear` event — removing it and
clearing its dimension are the same action.

## Properties

| Property                 | Attribute   | Description | Type                   | Default     |
| ------------------------ | ----------- | ----------- | ---------------------- | ----------- |
| `dimension` _(required)_ | `dimension` |             | `"area" \| "category"` | `undefined` |
| `label` _(required)_     | `label`     |             | `string`               | `undefined` |
| `value` _(required)_     | `value`     |             | `string`               | `undefined` |


## Events

| Event        | Description | Type                                                               |
| ------------ | ----------- | ------------------------------------------------------------------ |
| `chiptoggle` |             | `CustomEvent<{ dimension: "category" \| "area"; value: string; }>` |


## Shadow Parts

| Part       | Description |
| ---------- | ----------- |
| `"chip"`   |             |
| `"remove"` |             |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
