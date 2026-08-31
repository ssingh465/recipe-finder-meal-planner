/**
 * Computes WCAG contrast ratios for every foreground/background token pair
 * actually used as text in the app, in both themes, and fails the build if
 * any body-text pair drops below 4.5:1. Ratios are never asserted by hand —
 * a hand-written number in the design spec once shipped wrong.
 *
 * Beyond the flat-token check, this also enforces the naming invariant that
 * keeps derived colours (gradients, glass) from becoming invisible to this
 * script: every --c-* token must be a bare hex literal, and every gradient
 * that carries text must declare a --c-*-floor token whose contrast this
 * script both checks AND verifies against the actual rendered ramp — not
 * just its stops, since interpolation across hues can render a pixel darker
 * than either endpoint.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const tokensPath = fileURLToPath(new URL('../src/lib/styles/tokens.css', import.meta.url));
const css = readFileSync(tokensPath, 'utf-8');

function extractBlock(source: string, startIndex: number): string {
	const braceStart = source.indexOf('{', startIndex);
	let depth = 0;
	for (let i = braceStart; i < source.length; i++) {
		if (source[i] === '{') depth++;
		else if (source[i] === '}') {
			depth--;
			if (depth === 0) return source.slice(braceStart + 1, i);
		}
	}
	throw new Error('Unterminated block in tokens.css');
}

function normalizeHex(hex: string): string {
	if (hex.length === 4) {
		return '#' + [...hex.slice(1)].map((c) => c + c).join('');
	}
	return hex;
}

function parseTokens(block: string): Record<string, string> {
	const tokens: Record<string, string> = {};
	for (const match of block.matchAll(/--(c-[a-z0-9-]+):\s*(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))(?![0-9a-fA-F])/g)) {
		tokens[match[1]] = normalizeHex(match[2]);
	}
	return tokens;
}

/**
 * Any --c-* declaration that is not a bare hex literal is invisible to
 * parseTokens above — silently. Derived colours (gradients, color-mix, alpha)
 * must be named --cx-* instead, so that invisibility is legible in the name
 * rather than a trap for the next person editing this file.
 */
function assertFlatHex(block: string, label: string): void {
	for (const m of block.matchAll(/--(c-[a-z0-9-]+):\s*([^;]+);/g)) {
		if (!/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(m[2].trim())) {
			throw new Error(
				`--${m[1]} in ${label} is not a flat hex ("${m[2].trim()}"). Derived colours ` +
					`must be named --cx-* so it is obvious the contrast gate cannot see them.`
			);
		}
	}
}

const rootIndex = css.indexOf(':root');
const rootBlock = extractBlock(css, rootIndex);
const lightTokens = parseTokens(rootBlock);
assertFlatHex(rootBlock, ':root');

const darkMediaIndex = css.indexOf('prefers-color-scheme: dark');
const darkRootIndex = css.indexOf(':root', darkMediaIndex);
const darkBlock = extractBlock(css, darkRootIndex);
const darkOverrides = parseTokens(darkBlock);
assertFlatHex(darkBlock, 'prefers-color-scheme: dark');
const darkTokens = { ...lightTokens, ...darkOverrides };

// The explicit dark-mode override (a user's stored choice, independent of the
// OS) is a SEPARATE block from the media-query one above — CSS can't make one
// selector straddle a media query. Both must declare identical values, or an
// explicit choice and the system preference would silently render different
// colours. This is checked, not just documented, because the alternative
// (routing values through var() indirection so there's only one copy) would
// make them unreadable to this very script.
// A plain indexOf would also match this selector's text inside a prose
// comment (e.g. one explaining the specificity of both dark blocks) — so this
// requires the selector to be immediately followed by "{", which only a real
// rule satisfies.
const explicitDarkSelector = ":root[data-theme='dark']";
const explicitSelectorMatch = css.match(/:root\[data-theme=['"]dark['"]\]\s*\{/);
if (!explicitSelectorMatch || explicitSelectorMatch.index === undefined) {
	throw new Error(`Missing ${explicitDarkSelector} block in tokens.css`);
}
const explicitIndex = explicitSelectorMatch.index;
if (explicitIndex < darkRootIndex) {
	throw new Error(
		`The ${explicitDarkSelector} block must come AFTER the prefers-color-scheme block — ` +
			'both selectors are specificity (0,2,0), so source order decides which wins.'
	);
}
const explicitBlock = extractBlock(css, explicitIndex);
const explicitOverrides = parseTokens(explicitBlock);
assertFlatHex(explicitBlock, explicitDarkSelector);

for (const key of new Set([...Object.keys(darkOverrides), ...Object.keys(explicitOverrides)])) {
	if (darkOverrides[key] !== explicitOverrides[key]) {
		throw new Error(
			`Dark palette drift: --${key} is "${darkOverrides[key] ?? 'absent'}" under ` +
				`prefers-color-scheme but "${explicitOverrides[key] ?? 'absent'}" under ` +
				`${explicitDarkSelector}. The two blocks must be identical.`
		);
	}
}

function relativeLuminance(hex: string): number {
	const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
	const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
	const lA = relativeLuminance(hexA);
	const lB = relativeLuminance(hexB);
	const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
	return (lighter + 0.05) / (darker + 0.05);
}

type Requirement = 'body' | 'large-or-nontext';

interface Pair {
	fg: string;
	bg: string;
	requirement: Requirement;
	note: string;
}

const pairs: Pair[] = [
	{ fg: 'c-text', bg: 'c-bg', requirement: 'body', note: 'default page text' },
	{ fg: 'c-text', bg: 'c-surface', requirement: 'body', note: 'text on cards/modals/toasts' },
	{ fg: 'c-text', bg: 'c-surface-sunken', requirement: 'body', note: 'text on planner columns/wells' },
	{ fg: 'c-text-muted', bg: 'c-bg', requirement: 'body', note: 'secondary text on page' },
	{ fg: 'c-text-muted', bg: 'c-surface', requirement: 'body', note: 'secondary text on cards' },
	{ fg: 'c-text-muted', bg: 'c-surface-sunken', requirement: 'body', note: 'secondary text on wells' },
	{ fg: 'c-text-subtle', bg: 'c-bg', requirement: 'large-or-nontext', note: 'subtle text/icons on page' },
	{ fg: 'c-text-subtle', bg: 'c-surface', requirement: 'large-or-nontext', note: 'subtle text/icons on cards' },
	{ fg: 'c-accent', bg: 'c-bg', requirement: 'body', note: 'accent text/links on page' },
	{ fg: 'c-accent', bg: 'c-surface', requirement: 'body', note: 'accent text/links on cards' },
	{
		fg: 'c-accent',
		bg: 'c-accent-subtle',
		requirement: 'body',
		note: 'filter-chip label text on tinted fill (also reused as the favorite icon fill, which only needs non-text contrast, but the stricter requirement here is the one that governs)'
	},
	{ fg: 'c-text', bg: 'c-accent-subtle', requirement: 'body', note: 'nav label on current-page tinted fill' },
	{ fg: 'c-on-accent', bg: 'c-accent', requirement: 'body', note: 'primary button text' },
	{ fg: 'c-on-error', bg: 'c-error', requirement: 'body', note: 'destructive button text' },
	{ fg: 'c-error', bg: 'c-error-subtle', requirement: 'body', note: 'error/validation text on tinted fill' },
	{ fg: 'c-warning', bg: 'c-warning-subtle', requirement: 'body', note: 'storage banner text' },
	{ fg: 'c-success', bg: 'c-success-subtle', requirement: 'body', note: 'success text on tinted fill' },

	// --- coverage gaps in the original set ---
	{ fg: 'c-accent', bg: 'c-surface-sunken', requirement: 'body', note: 'accent text/links in planner wells' },
	{ fg: 'c-on-accent', bg: 'c-accent-hover', requirement: 'body', note: 'primary button text, hover' },
	{
		fg: 'c-text-subtle',
		bg: 'c-glass-floor',
		requirement: 'large-or-nontext',
		note: 'subtle icons on the glass header'
	},

	// --- gradient floors: the worst pixel actually rendered by each text-carrying ramp ---
	{ fg: 'c-on-accent', bg: 'c-grad-accent-floor', requirement: 'body', note: 'CTA text on the accent gradient' },
	{ fg: 'c-on-vivid', bg: 'c-grad-hero-floor', requirement: 'body', note: 'hero display type on the hero gradient' },
	{ fg: 'c-text', bg: 'c-grad-surface-floor', requirement: 'body', note: 'card text on the surface gradient' },
	{
		fg: 'c-text-muted',
		bg: 'c-grad-surface-floor',
		requirement: 'body',
		note: 'card meta on the surface gradient'
	},

	// --- glass floor: --c-surface at --gl-alpha composited over the most adverse possible backdrop ---
	{ fg: 'c-text', bg: 'c-glass-floor', requirement: 'body', note: 'header text on glass, worst-case backdrop' },
	{
		fg: 'c-text-muted',
		bg: 'c-glass-floor',
		requirement: 'body',
		note: 'inactive nav label on glass, worst-case backdrop'
	},

	// --- library's procedural hsl() name tile, worst of its six curated hues ---
	{ fg: 'c-tile-floor-fg', bg: 'c-tile-floor-bg', requirement: 'body', note: 'name-tile text, worst hue' },

	// --- focus-ring inner-band adjacency (WCAG 1.4.11 / 2.4.11) ---
	{
		fg: 'c-bg',
		bg: 'c-accent',
		requirement: 'large-or-nontext',
		note: 'focus ring inner band vs a filled accent control'
	},
	{
		fg: 'c-bg',
		bg: 'c-grad-accent-floor',
		requirement: 'large-or-nontext',
		note: 'focus ring inner band vs a gradient CTA'
	},

	// --- control boundaries (WCAG 1.4.11) ---
	{
		fg: 'c-border-strong',
		bg: 'c-surface',
		requirement: 'large-or-nontext',
		note: 'input/secondary-button boundary on cards'
	},
	{
		fg: 'c-border-strong',
		bg: 'c-bg',
		requirement: 'large-or-nontext',
		note: 'input/secondary-button boundary on page'
	},
	{
		fg: 'c-accent-border',
		bg: 'c-accent-subtle',
		requirement: 'large-or-nontext',
		note: 'active filter-chip boundary'
	}
];

let failed = false;

for (const theme of [
	{ name: 'light', tokens: lightTokens },
	{ name: 'dark', tokens: darkTokens }
]) {
	console.log(`\n${theme.name} theme`);
	for (const pair of pairs) {
		const fgHex = theme.tokens[pair.fg];
		const bgHex = theme.tokens[pair.bg];
		if (!fgHex || !bgHex) {
			throw new Error(`Missing token --${!fgHex ? pair.fg : pair.bg} in ${theme.name} theme`);
		}
		const ratio = contrastRatio(fgHex, bgHex);
		const threshold = pair.requirement === 'body' ? 4.5 : 3.0;
		const pass = ratio >= threshold;
		if (pair.requirement === 'body' && !pass) failed = true;
		const status = pass ? 'PASS' : 'FAIL';
		console.log(
			`  [${status}] --${pair.fg} on --${pair.bg}: ${ratio.toFixed(2)}:1 (needs ${threshold}:1, ${pair.requirement}) — ${pair.note}`
		);
	}
}

/**
 * A floor token claims to be the worst pixel of its gradient's rendered ramp.
 * Verify that by sampling, rather than trusting it — sRGB interpolation of a
 * hue-crossing gradient can dip BELOW its darkest stop (#0000ff -> #ff0000
 * bottoms out at a lower luminance than either endpoint). Stop POSITIONS are
 * irrelevant to this: they change where a colour appears along the ramp, not
 * which colours exist on it — so the gradient() string itself is never read,
 * only the stop tokens, which are already parsed hex.
 */
interface Gradient {
	name: string;
	stops: string[];
	floor: string;
	ink: string[];
}

const gradients: Gradient[] = [
	{
		name: 'grad-accent',
		stops: ['c-grad-accent-1', 'c-grad-accent-2', 'c-grad-accent-3'],
		floor: 'c-grad-accent-floor',
		ink: ['c-on-accent']
	},
	{
		name: 'grad-hero',
		stops: ['c-grad-hero-1', 'c-grad-hero-2', 'c-grad-hero-3'],
		floor: 'c-grad-hero-floor',
		ink: ['c-on-vivid']
	},
	{
		name: 'grad-surface',
		stops: ['c-grad-surface-1', 'c-grad-surface-2', 'c-grad-surface-3'],
		floor: 'c-grad-surface-floor',
		ink: ['c-text', 'c-text-muted']
	}
];

const SAMPLES_PER_SEGMENT = 128;
const FLOOR_TOLERANCE = 0.02;

function channels(hex: string): number[] {
	return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

/** Luminance from float channels, so sampling introduces no rounding error. */
function luminanceOfChannels(rgb: number[]): number {
	const [r, g, b] = rgb.map((v) => v / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratioFromLuminance(lA: number, lB: number): number {
	const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
	return (lighter + 0.05) / (darker + 0.05);
}

for (const theme of [
	{ name: 'light', tokens: lightTokens },
	{ name: 'dark', tokens: darkTokens }
]) {
	for (const grad of gradients) {
		const stopChannels = grad.stops.map((s) => {
			const hex = theme.tokens[s];
			if (!hex) throw new Error(`Missing gradient stop --${s} in ${theme.name} theme`);
			return channels(hex);
		});
		for (const ink of grad.ink) {
			const inkHex = theme.tokens[ink];
			if (!inkHex) throw new Error(`Missing ink token --${ink} in ${theme.name} theme`);
			const inkLuminance = relativeLuminance(inkHex);
			let min = Infinity;
			for (let s = 0; s < stopChannels.length - 1; s++) {
				for (let i = 0; i <= SAMPLES_PER_SEGMENT; i++) {
					const t = i / SAMPLES_PER_SEGMENT;
					const mixed = stopChannels[s].map((v, c) => v + (stopChannels[s + 1][c] - v) * t);
					min = Math.min(min, ratioFromLuminance(inkLuminance, luminanceOfChannels(mixed)));
				}
			}
			const floorHex = theme.tokens[grad.floor];
			if (!floorHex) throw new Error(`Missing floor token --${grad.floor} in ${theme.name} theme`);
			const declared = contrastRatio(inkHex, floorHex);
			if (declared > min + FLOOR_TOLERANCE) {
				console.error(
					`\n--${grad.floor} claims ${declared.toFixed(2)}:1 against --${ink} in the ` +
						`${theme.name} theme, but the ramp actually renders a pixel at ${min.toFixed(2)}:1 ` +
						`(sRGB interpolation across a hue change can dip below every stop). ` +
						`Set --${grad.floor} to that worst pixel.`
				);
				failed = true;
			} else {
				console.log(
					`  [OK] ${theme.name} --${grad.floor} vs --${ink}: declared ${declared.toFixed(2)}:1 <= ramp min ${min.toFixed(2)}:1`
				);
			}
		}
	}
}

if (failed) {
	console.error('\nContrast check failed: at least one body-text pair is below 4.5:1, or a floor token understates its ramp.');
	process.exit(1);
}

console.log('\nAll body-text pairs pass 4.5:1 in both themes, and every gradient floor is sound.');
