import { defineConfig } from 'vite';

// Builds the demo (demo/index.html) from the same sources as the web part.
export default defineConfig({
  root: 'demo',
  base: './',
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' }
  },
  server: {
    fs: { allow: ['..'] }
  },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true
  }
});
