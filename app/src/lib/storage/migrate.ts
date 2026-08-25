// Schema versioning (TRD §4.5, DATA-MODEL §10). Each storage key wraps its data in its
// own `{ v, data }` envelope so one collection's shape change can't cascade into another's.
export const SCHEMA_VERSION = 1;

export interface Envelope<T> {
	v: number;
	data: T;
}

export function wrapEnvelope<T>(data: T): Envelope<T> {
	return { v: SCHEMA_VERSION, data };
}

/**
 * On a missing/unparseable envelope or a version mismatch, resets to `fallback` rather
 * than transforming — there is no prior released shape to migrate from (D-24).
 */
export function unwrapEnvelope<T>(parsed: unknown, fallback: T): T {
	if (
		typeof parsed !== 'object' ||
		parsed === null ||
		!('v' in parsed) ||
		!('data' in parsed) ||
		(parsed as Envelope<unknown>).v !== SCHEMA_VERSION
	) {
		return fallback;
	}
	return (parsed as Envelope<T>).data;
}
