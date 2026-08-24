import js from '@eslint/js';
import ts from 'typescript-eslint';

export default ts.config(
  { ignores: ['dist/', 'www/', 'loader/', 'src/components.d.ts'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    rules: {
      // Stencil components render via JSX text children; innerHTML has no XSS protection
      // from shadow DOM.
      'no-restricted-properties': [
        'error',
        { object: 'document', property: 'write' },
      ],
      // `h` is the JSX pragma Stencil's compiler calls implicitly; it never appears
      // as a bare reference in component source.
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^h$' }],
    },
  },
);
