import { defineConfig } from 'vite';

// Builds the demo (demo/index.html) from the same sources as the web part.
// `vite build --mode team` builds the edition for colleagues: no sample
// evaluation and no sample harbour board, feedback goes by email.
export default defineConfig(({ mode }) => ({
  root: 'demo',
  base: './',
  define: {
    __ODYSSEE_EDITION__: JSON.stringify(mode === 'team' ? 'team' : 'demo')
  },
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
    outDir: mode === 'team' ? '../dist-team' : '../dist-demo',
    emptyOutDir: true
  }
}));
