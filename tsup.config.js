import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  treeshake: false,
  sourcemap: 'inline',
  minify: true,
  clean: true,
  dts: true,
  splitting: false,
  format: ['cjs', 'esm'],
  external: ['react'],
  injectStyle: false,
  esbuildOptions: (options) => {
    options.banner = {
      js: '"use client"',
    };
  },
});
