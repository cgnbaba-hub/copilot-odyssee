/**
 * Checks the content packs in /content and bundles them for the app.
 *
 *   tsx tools/content-cli.ts check    validate only
 *   tsx tools/content-cli.ts bundle   validate, then write src/content/bundle.generated.ts
 *   tsx tools/content-cli.ts export   validate, then write dist-content/odyssee-content.json,
 *                                     the file provisioning/Publish-OdysseeContent.ps1 uploads
 *   tsx tools/content-cli.ts review   validate, then write dist-content/inhalte-review.md, a
 *                                     readable version of all German texts for content reviews
 */
import * as fs from 'fs';
import * as path from 'path';

import { sortedIslands } from '../src/core/content/bundle';
import { Block, ContentBundle } from '../src/core/content/types';
import { ContentFile, validateContent } from '../src/core/content/validate';
import { CONTENT_FILE_FORMAT } from '../src/data/content';
import { CONTENT_FILE_NAME } from '../src/data/sharepoint/names';

const CONTENT_DIR = path.resolve(__dirname, '../../content');
const BUNDLE_FILE = path.resolve(__dirname, '../src/content/bundle.generated.ts');
const EXPORT_FILE = path.resolve(__dirname, '../dist-content', CONTENT_FILE_NAME);
const REVIEW_FILE = path.resolve(__dirname, '../dist-content/inhalte-review.md');

const BLOCK_LABELS: Record<Block['type'], string> = {
  briefing: 'Briefing',
  quiz: 'Quiz',
  prompt: 'Prompt-Werkstatt',
  mission: 'Mission',
  usecase: 'Use-Case-Karte'
};

function quote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function blockMarkdown(block: Block): string {
  const head = `#### ${BLOCK_LABELS[block.type]}`;
  switch (block.type) {
    case 'briefing':
      return `${head}: ${block.title.de}\n\n${block.body.de}\n`;
    case 'quiz':
      return (
        `${head} (${block.difficulty}): ${block.question.de}\n\n` +
        block.options
          .map((o) => `- ${o.correct ? '✅' : '❌'} ${o.text.de}${o.explanation ? `  \n  _${o.explanation.de}_` : ''}`)
          .join('\n') +
        '\n'
      );
    case 'prompt':
      return (
        `${head} (${block.difficulty}): ${block.title.de}\n\n${block.scenario.de}\n\nBewertet: ${block.rubric.join(', ')}\n` +
        (block.examplePrompt ? `\nBeispiel:\n\n${quote(block.examplePrompt.de)}\n` : '')
      );
    case 'mission':
      return `${head}: ${block.title.de}\n\n${block.task.de}\n` + (block.tip ? `\nTipp: ${block.tip.de}\n` : '');
    case 'usecase':
      return `${head}\n\n${block.intro.de}\n`;
  }
}

function reviewMarkdown(bundle: ContentBundle): string {
  const lines: string[] = [
    '# Odyssee: Inhalte zum Review',
    '',
    `Stand ${new Date().toISOString().slice(0, 10)}. Erzeugt mit \`npm run content:review\` aus dem Ordner \`content/\`. Änderungswünsche bitte mit Modul und Baustein angeben.`,
    ''
  ];
  sortedIslands(bundle).forEach((island) => {
    const modules = bundle.modules.filter((m) => m.island === island.id).sort((a, b) => a.order - b.order);
    if (modules.length === 0) return;
    lines.push(`## ${island.name.de} (${island.tool.de}, ${island.license === 'basic' ? 'für alle' : 'Premium'})`, '');
    modules.forEach((m) => {
      lines.push(`### ${m.title.de}`, '', `\`${m.id}\` · Version ${m.version} · Status ${m.status} · ${m.estimatedMinutes} Min.` + (m.reviewedAt ? ` · geprüft ${m.reviewedAt}` : ''), '');
      lines.push(m.summary.de, '');
      if (m.notes) lines.push(`_Redaktion: ${m.notes}_`, '');
      m.blocks.forEach((b) => lines.push(blockMarkdown(b)));
    });
  });
  return lines.join('\n');
}

function readJson(relativePath: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, relativePath), 'utf8'));
}

/** Drops fields that only matter to editors. */
function stripEditorFields(bundle: ContentBundle): ContentBundle {
  return JSON.parse(JSON.stringify(bundle, (key, value) => (key === '$schema' || key === 'notes' ? undefined : value)));
}

function main(): void {
  const command = process.argv[2];
  if (['check', 'bundle', 'export', 'review'].indexOf(command) < 0) {
    console.error('Aufruf: content-cli.ts check|bundle|export|review');
    process.exit(2);
  }

  const moduleFiles: ContentFile<unknown>[] = fs
    .readdirSync(path.join(CONTENT_DIR, 'modules'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ path: `modules/${name}`, data: readJson(`modules/${name}`) }));

  // Notes are for editors and are part of the review, so they are read from the raw files.
  const result = validateContent(
    {
      common: readJson('schema/common.schema.json') as object,
      islands: readJson('schema/islands.schema.json') as object,
      module: readJson('schema/module.schema.json') as object
    },
    { path: 'islands.json', data: readJson('islands.json') },
    moduleFiles,
    new Date()
  );

  result.warnings.forEach((w) => console.warn(`Warnung  content/${w.file}: ${w.message}`));
  result.errors.forEach((e) => console.error(`Fehler   content/${e.file}: ${e.message}`));
  if (!result.bundle) {
    console.error(`\n${result.errors.length} Fehler in den Inhalten.`);
    process.exit(1);
  }

  console.log(`Inhalte ok: ${result.bundle.islands.length} Inseln, ${result.bundle.modules.length} Module.`);

  if (command === 'bundle') {
    const source =
      '// Generated by tools/content-cli.ts from /content. Do not edit; run "npm run content:bundle".\n' +
      '/* eslint-disable */\n' +
      "import { ContentBundle } from '../core/content/types';\n\n" +
      `const bundle: ContentBundle = ${JSON.stringify(stripEditorFields(result.bundle), undefined, 2)};\n\n` +
      'export default bundle;\n';
    fs.mkdirSync(path.dirname(BUNDLE_FILE), { recursive: true });
    fs.writeFileSync(BUNDLE_FILE, source);
    console.log(`Geschrieben: ${path.relative(process.cwd(), BUNDLE_FILE)}`);
  }

  if (command === 'export') {
    const file = { format: CONTENT_FILE_FORMAT, generatedAt: new Date().toISOString(), ...stripEditorFields(result.bundle) };
    fs.mkdirSync(path.dirname(EXPORT_FILE), { recursive: true });
    fs.writeFileSync(EXPORT_FILE, JSON.stringify(file, undefined, 2));
    console.log(`Geschrieben: ${path.relative(process.cwd(), EXPORT_FILE)}`);
  }

  if (command === 'review') {
    fs.mkdirSync(path.dirname(REVIEW_FILE), { recursive: true });
    fs.writeFileSync(REVIEW_FILE, reviewMarkdown(result.bundle));
    console.log(`Geschrieben: ${path.relative(process.cwd(), REVIEW_FILE)}`);
  }
}

main();
