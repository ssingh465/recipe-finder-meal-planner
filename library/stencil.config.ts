import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'recipe-ui',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      // Emits defineCustomElements() from dist/components/index.js.
      customElementsExportBehavior: 'bundle',
      // Default; stated explicitly because it dictates the dependency requirement below.
      externalRuntime: true,
      generateTypeDeclarations: true,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
};
