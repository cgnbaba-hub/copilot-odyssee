import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

/**
 * Turns a Vite build into one HTML file that works on its own, also opened
 * straight from the disk: the stylesheet and the script are written into
 * the page. Usage: tsx tools/inline-html.ts <index.html> <out.html>
 */
const [source, target] = process.argv.slice(2);
if (!source || !target) throw new Error('Usage: inline-html <index.html> <out.html>');
const dir = dirname(source);
let html = readFileSync(source, 'utf8');

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/g, (_tag, file: string) => `<style>${readFileSync(join(dir, file), 'utf8')}</style>`);
html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (_tag, file: string) => {
  const code = readFileSync(join(dir, file), 'utf8');
  // A closing script tag inside the code would end the inline script early.
  return `<script type="module">${code.replace(/<\/script/gi, '<\\/script')}</script>`;
});
// An inline module script runs deferred like the original, after the page body is parsed.
if (/src="\.\//.test(html) || /href="\.\//.test(html)) throw new Error('Some assets were not inlined');
writeFileSync(target, html);
console.log(`${target}: ${Math.round(html.length / 1024)} KB`);
