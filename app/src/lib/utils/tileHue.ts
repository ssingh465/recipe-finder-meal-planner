// Deterministic hue for the image-less recipe tile on the details page — same
// algorithm as the library's card tile, so a recipe keeps its colour everywhere.
const HUES = [18, 34, 96, 168, 262, 344] as const;

export function tileHue(name: string): number {
	let sum = 0;
	for (let i = 0; i < name.length; i++) {
		sum += name.charCodeAt(i);
	}
	return HUES[sum % HUES.length];
}
