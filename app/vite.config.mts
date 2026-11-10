import { defineConfig } from 'vite';

// Builds the demo (demo/index.html) from the same sources as the web part.
// `vite build --mode team` builds the edition for colleagues: no sample
// evaluation and no sample harbour board, feedback goes by email.
// `vite build --mode scorm` builds the same for an LMS, which keeps the progress.
const EDITIONS: Record<string, { edition: string; outDir: string }> = {
  team: { edition: 'team', outDir: '../dist-team' },
  scorm: { edition: 'scorm', outDir: '../dist-scorm' }
};
const DEMO = { edition: 'demo', outDir: '../dist-demo' };

export default defineConfig(({ mode }) => ({
  root: 'demo',
  base: './',
  define: {
    __ODYSSEE_EDITION__: JSON.stringify((EDITIONS[mode] || DEMO).edition)
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
    outDir: (EDITIONS[mode] || DEMO).outDir,
    emptyOutDir: true
  }
}));
