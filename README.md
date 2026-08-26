# Recipe Finder & Meal Planner

Search and browse recipes, save favorites, create and manage your own recipes, and build a
weekly meal plan. Built as two independently published packages: a SvelteKit application and a
Stencil web component library consumed from npm.

- **Deployed app:** https://recipe-finder-meal-planner-eight.vercel.app
- **Component library on npm:** https://www.npmjs.com/package/@ssingh465/recipe-ui
- **GitHub repository:** https://github.com/ssingh465/recipe-finder-meal-planner

---

## Repository layout

Two sibling folders, each with its own manifest and no shared root package:

| Folder | What it is |
|---|---|
| `app/` | The SvelteKit application. Installs `@ssingh465/recipe-ui` **from npm**, never from source. |
| `library/` | The Stencil component library, published as `@ssingh465/recipe-ui`. |

The app never imports from `library/` directly — that's enforced by a lint rule and by a CI
build step that deletes the `library` folder before building the app, proving the two packages
are genuinely decoupled.

---

## Setup instructions

Requires **Node.js 20+**.

```bash
git clone https://github.com/ssingh465/recipe-finder-meal-planner.git
cd recipe-finder-meal-planner/app
npm install
```

That's all that's needed to run the app — it installs the published component library as a
regular npm dependency. You do not need to build or link `library/` locally to run the app.

To work on the component library itself:

```bash
cd library
npm install
```

---

## Starting the development server

From `app/`:

```bash
npm run dev
```

The app is served at `http://localhost:5173`.

Other useful scripts in `app/`:

```bash
npm run build   # production build
npm run preview # preview the production build locally
npm run test    # unit tests
npm run lint    # eslint + stylelint
npm run check   # svelte-check
```

To develop the component library with live reload (`http://localhost:3333`):

```bash
cd library
npm start
```

---

## Assumptions made

No auth, sign-up, or backend of any kind exists or was required — there is exactly one user per
browser, and "recipes you created" means "recipes in that browser's local storage."

**Recipe data.** [TheMealDB](https://www.themealdb.com/api.php)'s free, keyless test endpoint is
the recipe source. It needs no signup, no API key, and no secret to manage in the deployed app,
so there's no quota that can expire mid-review. Its list endpoints cap at 100 results with no
total count in the response, which shapes two further decisions below.

**Filtering.** Two filter dimensions are exposed — category and cuisine/area — not ingredient,
so the filter UI stays a couple of dropdowns rather than a large multi-select with hundreds of
options and no stated requirement for it. Search and the two filters compose: exactly one server
request resolves a candidate set (search takes priority when present, otherwise category, otherwise
area), and any other active filter is applied to that set in memory. Two separate filtered
requests are never intersected, because each one individually caps at 100 results and
intersecting two capped, truncated sets would silently drop valid matches. The cuisine dropdown
itself is generated at build time by probing each candidate cuisine once and keeping only the
ones that return results — most of the API's ~190 listed countries return nothing.

**Weekly plan.** Each day holds a list of recipes with no named meal slots (breakfast/lunch/
dinner) — the plural "assign recipes to days" in the brief, and the fact that the recipe API has
no per-slot data to filter by, both point away from fixed slots.

**Deleting a recipe you created** cascades: it's removed from favorites and every day it was
planned for, and the confirmation dialog names exactly what will be removed before you confirm,
rather than deleting silently or leaving orphaned references behind.

**Persistence.** State lives in the browser's local storage behind a small reactive layer, since
there's no backend to persist it to. Every access is guarded against running during
server-side rendering (where local storage doesn't exist), and a storage failure — quota
exceeded, storage disabled — degrades to an in-memory session with a visible banner rather than
crashing.

**Recipe ownership and ids.** With no accounts, "your recipe" simply means "stored locally."
Locally created recipes get a prefixed id and a `source` field distinguishing them from
read-only API recipes, so edit/delete controls only ever appear on recipes you actually created.

**Package and versioning.** The component library is published under a scoped npm name
(`@ssingh465/recipe-ui`) and follows semantic versioning — pre-1.0 while the component API was
still changing, `1.0.0` once it was final.

**Hosting.** The app deploys to Vercel with server-side rendering enabled, since it has no
server-side secrets to hide and SSR keeps direct/refreshed URLs working without an SPA fallback.

**A few interaction details** not specified anywhere else: loading states show 8 skeleton cards
rather than a full page of them; toasts appear bottom-center, auto-dismiss after 4 seconds, stay
manually dismissible, and are announced politely to screen readers; and destructive actions (like
deleting a recipe) use a focus-trapped confirmation dialog that states its consequences, rather
than a plain browser confirm popup.

---

## Testing

```bash
cd app && npm test       # domain-logic unit tests (ingredient normalization, filter resolution)
cd library && npm test   # component spec tests — props, events, slots
```

Both are exercised in CI on every push and pull request, alongside linting, type-checking, and
the isolation build described above.
