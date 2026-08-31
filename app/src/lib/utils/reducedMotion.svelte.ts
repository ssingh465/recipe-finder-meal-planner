// Svelte's transition:/animate: directives take JS duration numbers, not CSS
// custom properties, so tokens.css's `*, *::before, *::after` reduced-motion
// override can't reach them the way it reaches CSS transitions/animations.
// This is the one place every component-side transition checks the
// preference instead of each re-implementing `window.matchMedia`.
import { MediaQuery } from 'svelte/reactivity';

export const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)', false);
