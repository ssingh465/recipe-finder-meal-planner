# @ssingh465/recipe-ui

Stencil web component library for the **Recipe Finder & Meal Planner** app. Published to npm
and consumed by `../app` as a registry dependency — never linked from source.

## Local development

```bash
npm install
npm start      # dev server with live reload, http://localhost:3333
npm run build  # production build -> dist/
npm test       # Stencil/Vitest spec tests
```

## Consuming this package

```bash
npm i @ssingh465/recipe-ui
```

```ts
// app/src/hooks.client.ts
import { defineCustomElements } from '@ssingh465/recipe-ui/components';
defineCustomElements();
```

Register once, client-side only, before any consumer renders.

## Status

Currently ships a single throwaway component, `<spike-panel>`, that proves the publish →
install → render → event → slot pipeline end to end. The real component set (`recipe-card`,
`recipe-grid`, `filter-chip`, `day-picker`, `planner-day`, `empty-state`, `skeleton-card`) is
still to come.
