import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			"no-undef": 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		rules: {
			// The app must consume the library from npm, never from source. A relative
			// or path-mapped import here would build locally while failing the isolation
			// build (`rm -rf library && npm ci && npm run build`).
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['**/library/**', '../library', '../library/*', '**/../library/**'],
							message: 'Import the published package (@ssingh465/recipe-ui), not the library source tree.',
						},
					],
				},
			],
			// {@html} is the XSS vector for upstream/user-authored strings.
			'svelte/no-at-html-tags': 'error',
			// localStorage, crypto, customElements and window must never be touched at
			// module scope (throws under SSR, where none of these exist). Scoped, guarded
			// access inside functions/effects is fine — disable per line there.
			'no-restricted-globals': [
				'error',
				{ name: 'localStorage', message: 'Guard with `browser` from $app/environment; never touch at module scope.' },
				{ name: 'crypto', message: 'Guard with `browser` from $app/environment; never touch at module scope.' },
				{ name: 'customElements', message: 'Guard with `browser` from $app/environment; never touch at module scope.' },
				{ name: 'window', message: 'Guard with `browser` from $app/environment; never touch at module scope.' },
			],
		},
	},
);
