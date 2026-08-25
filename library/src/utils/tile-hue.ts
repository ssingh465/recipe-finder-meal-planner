// Deterministic hue for the image-less recipe tile. Six curated hues keep
// every result on-palette; the sum-of-char-codes hash means a given recipe
// name always lands on the same hue.
const HUES = [18, 34, 96, 168, 262, 344] as const;

export function tileHue(name: string): number {
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return HUES[sum % HUES.length];
}
