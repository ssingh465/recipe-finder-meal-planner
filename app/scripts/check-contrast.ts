/**
 * Computes WCAG contrast ratios for every foreground/background token pair
 * actually used as text in the app, in both themes, and fails the build if
 * any body-text pair drops below 4.5:1. Ratios are never asserted by hand —
 * a hand-written number in the design spec once shipped wrong.
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
	for (const match of block.matchAll(/--(c-[a-z-]+):\s*(#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3}))(?![0-9a-fA-F])/g)) {
		tokens[match[1]] = normalizeHex(match[2]);
	}
	return tokens;
}

const rootIndex = css.indexOf(':root');
const lightTokens = parseTokens(extractBlock(css, rootIndex));

const darkMediaIndex = css.indexOf('prefers-color-scheme: dark');
const darkRootIndex = css.indexOf(':root', darkMediaIndex);
const darkOverrides = parseTokens(extractBlock(css, darkRootIndex));
const darkTokens = { ...lightTokens, ...darkOverrides };

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
		requirement: 'large-or-nontext',
		note: 'favorite icon fill on tinted background (non-text)'
	},
	{ fg: 'c-text', bg: 'c-accent-subtle', requirement: 'body', note: 'nav label on current-page tinted fill' },
	{ fg: 'c-on-accent', bg: 'c-accent', requirement: 'body', note: 'primary button text' },
	{ fg: 'c-on-error', bg: 'c-error', requirement: 'body', note: 'destructive button text' },
	{ fg: 'c-error', bg: 'c-error-subtle', requirement: 'body', note: 'error/validation text on tinted fill' },
	{ fg: 'c-warning', bg: 'c-warning-subtle', requirement: 'body', note: 'storage banner text' },
	{ fg: 'c-success', bg: 'c-success-subtle', requirement: 'body', note: 'success text on tinted fill' }
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

if (failed) {
	console.error('\nContrast check failed: at least one body-text pair is below 4.5:1.');
	process.exit(1);
}

console.log('\nAll body-text pairs pass 4.5:1 in both themes.');
