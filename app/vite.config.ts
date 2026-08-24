import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) => filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),

			// Content Security Policy, applied from the start so any gaps surface before
			// feature work builds on top of it.
			//
			// Finding, verified on the deployed URL: Stencil's shadow-root runtime style
			// injection IS blocked by `style-src 'self'` — the browser console reports a CSP
			// violation for the injected <style> and the component's own styles fail to
			// apply. 'unsafe-inline' is added below as a deliberate, recorded trade-off, not
			// a default that crept in.
			csp: {
				directives: {
					'default-src': ['self'],
					'img-src': ['self', 'https://www.themealdb.com', 'data:'],
					'connect-src': ['self', 'https://www.themealdb.com'],
					'style-src': ['self', 'https://fonts.googleapis.com', 'unsafe-inline'],
					'font-src': ['self', 'https://fonts.gstatic.com'],
					'frame-ancestors': ['none'],
					'object-src': ['none'],
					'base-uri': ['self']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
