# spike-panel



<!-- Auto Generated Below -->


## Overview

Integration spike only. Proves the Stencil <-> SvelteKit seam (object
property, custom event, slot) end to end. Not part of the real component
set to come.

## Properties

| Property | Attribute | Description                                                  | Type        | Default     |
| -------- | --------- | ------------------------------------------------------------ | ----------- | ----------- |
| `note`   | --        | Arrives as an object property once the element has upgraded. | `SpikeNote` | `undefined` |


## Events

| Event         | Description                                               | Type                     |
| ------------- | --------------------------------------------------------- | ------------------------ |
| `spikeaction` | Lowercase, so it binds as a plain Svelte `on*` attribute. | `CustomEvent<SpikeNote>` |


## Slots

| Slot | Description      |
| ---- | ---------------- |
|      | The default slot |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
