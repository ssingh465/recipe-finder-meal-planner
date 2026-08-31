// Explicit light/dark/system theme choice, layered on top of the system
// `prefers-color-scheme` the app already followed. Stored as an object (not a
// bare string) so a later preference can be added without a schema version
// bump — matches the envelope convention every other store already uses.
import { readKey, writeKey } from '$lib/storage/local';

const KEY = 'rfmp:theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeData {
	mode: ThemeMode;
}

const DEFAULT: ThemeData = { mode: 'system' };

function isThemeMode(value: unknown): value is ThemeMode {
	return value === 'light' || value === 'dark' || value === 'system';
}

let mode = $state<ThemeMode>('system');
let hydrated = $state(false);

/**
 * Mirrors the choice onto <html data-theme> so tokens.css's explicit-override
 * block picks it up. The blocking script in app.html already sets this
 * before first paint — this call repairs the attribute if that script was
 * blocked (storage disabled, script blocked) and keeps it in sync afterward.
 */
function applyToDocument(next: ThemeMode): void {
	document.documentElement.dataset.theme = next;
}

export const theme = {
	get mode() {
		return mode;
	},
	get hydrated() {
		return hydrated;
	},

	hydrate() {
		if (hydrated) return; // readKey is a no-op on the server
		const stored = readKey<ThemeData>(KEY, DEFAULT);
		mode = isThemeMode(stored.mode) ? stored.mode : 'system';
		applyToDocument(mode);
		hydrated = true;
	},

	setMode(next: ThemeMode) {
		mode = next;
		applyToDocument(next);
		writeKey(KEY, { mode: next });
	}
};
