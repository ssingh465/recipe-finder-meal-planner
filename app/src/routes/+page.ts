// This page only renders Stencil custom elements with locally-owned mock
// data — there's nothing for the server to fetch or render. SSR would place
// them in the initial HTML, where the browser upgrades them the instant
// hooks.client.ts registers the tags, racing Svelte's own property
// assignment on the same elements.
export const ssr = false;
