import type { RecipeInput } from './recipe';

export type FieldErrors = Partial<Record<keyof RecipeInput | 'ingredients', string>>;

export type Failure =
	| { kind: 'network'; message: string } // request failed or was aborted
	| { kind: 'upstream'; message: string } // non-2xx or unparseable response
	| { kind: 'notfound'; message: string } // a specific id does not resolve
	| { kind: 'validation'; message: string; fields: FieldErrors }
	| { kind: 'storage'; message: string }; // quota exceeded / storage unavailable

export type Result<T> =
	| { ok: true; data: T; truncated?: boolean } // truncated: response held exactly 100 (TRD §8.2)
	| ({ ok: false } & Failure);
