import {defineConfig} from 'vite';
import base from './lib.baseconfig';

// Browser bundle build (successor of webpack.config.js + ts-loader, which do
// not work with TypeScript 7). The npm package entry (dist/index.js and .d.ts)
// is still emitted by tsc; this only produces the UMD bundle.
export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: base.libName,
      formats: ['umd'],
      fileName: () => `${base.libName}.bundle.js`,
    },
    outDir: 'dist',
    // Keep the tsc output (dist/*.js, *.d.ts) emitted before this build runs.
    emptyOutDir: false,
    rollupOptions: {
      external: ['crypto', 'js-crypto-hmac', 'js-crypto-hash'],
      output: {
        // Same shape as the former webpack UMD output: named exports on the
        // global object, with the default export available as `.default`.
        exports: 'named',
        globals: {
          'crypto': 'crypto',
          'js-crypto-hmac': 'js-crypto-hmac',
          'js-crypto-hash': 'js-crypto-hash',
        },
      },
    },
  },
});
