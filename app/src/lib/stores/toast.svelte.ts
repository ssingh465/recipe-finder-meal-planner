// Toast system — bottom-centre, 4s auto-dismiss, manually dismissible,
// role="status" aria-live="polite", max 3 stacked. Call addToast() from anywhere;
// the layout renders whatever is here.

export interface Toast {
	id: number;
	message: string;
}

const AUTO_DISMISS_MS = 4000;
const MAX_STACKED = 3;

let nextId = 1;
export const toasts: Toast[] = $state([]);

export function addToast(message: string): void {
	const toast: Toast = { id: nextId++, message };
	toasts.push(toast);
	if (toasts.length > MAX_STACKED) {
		toasts.shift();
	}
	setTimeout(() => dismissToast(toast.id), AUTO_DISMISS_MS);
}

export function dismissToast(id: number): void {
	const index = toasts.findIndex((t) => t.id === id);
	if (index !== -1) {
		toasts.splice(index, 1);
	}
}
