// The dist-custom-elements target with customElementsExportBehavior 'bundle'
// exposes defineCustomElements() from dist/components, not from a loader/ target.
import { defineCustomElements } from './dist/components/index.js';

defineCustomElements();