// Runs once, client-only, before the first render of any consumer.
// Registering here — rather than a layout's onMount — closes the race where an
// object property is assigned before the custom element has upgraded and silently
// degrades to the attribute string "[object Object]".
import { defineCustomElements } from '@ssingh465/recipe-ui/components';

defineCustomElements();
