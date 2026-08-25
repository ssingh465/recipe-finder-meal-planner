// The only module that touches `localStorage`. Every store reaches persistence
// through readKey/writeKey — never localStorage directly — so the SSR guard, the
// try/catch, the corrupt-JSON reset, and the storage-fault signal all live in
// exactly one place.
import { browser } from '$app/environment';
import { setStorageFault, storageStatus, type StorageFault } from '$lib/stores/storage-status.svelte';
import { unwrapEnvelope, wrapEnvelope } from './migrate';

export function readKey<T>(key: string, fallback: T): T {
	if (!browser) return fallback;

	let raw: string | null;
	try {
		// eslint-disable-next-line no-restricted-globals -- guarded by `browser` above
		raw = localStorage.getItem(key);
	} catch {
		return fallback;
	}
	if (raw === null) return fallback;

	try {
		return unwrapEnvelope<T>(JSON.parse(raw), fallback);
	} catch {
		return fallback;
	}
}

export function writeKey(key: string, value: unknown): void {
	if (!browser) return;

	try {
		const payload = JSON.stringify(wrapEnvelope(value));
		// eslint-disable-next-line no-restricted-globals -- guarded by `browser` above
		localStorage.setItem(key, payload);
		setStorageFault(null);
	} catch (err) {
		const isQuotaError =
			err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
		setStorageFault(isQuotaError ? 'quota' : 'unavailable');
	}
}

export function storageFault(): StorageFault {
	return storageStatus.fault;
}
