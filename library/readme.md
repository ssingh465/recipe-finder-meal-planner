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

## Components

| Component | Purpose |
|---|---|
| `<recipe-card>` | A single recipe summary — thumbnail or typographic tile, favorite toggle, `actions` slot |
| `<recipe-grid>` | Responsive card grid layout |
| `<filter-chip>` | A removable active-filter chip |
| `<day-picker>` | Assign a recipe to a day of the week |
| `<planner-day>` | One day's column/section in the weekly planner |
| `<empty-state>` | Empty/zero-result state with an optional action slot |
| `<skeleton-card>` | Loading placeholder matching `<recipe-card>`'s dimensions |

Every component reads its theme from `--rc-*` CSS custom properties, each with a built-in
fallback, so it renders correctly even when the consuming app defines none of them.
