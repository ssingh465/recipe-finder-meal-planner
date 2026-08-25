// Storage-fault signal — FLOWS.md §2.4. Phase 2's storage layer calls setStorageFault() on a
// guarded read/write failure; the global banner reacts. Starts clear: no storage work has run yet.

export type StorageFault = 'quota' | 'unavailable' | null;

export const storageStatus: { fault: StorageFault } = $state({ fault: null });

export function setStorageFault(fault: StorageFault): void {
	storageStatus.fault = fault;
}
