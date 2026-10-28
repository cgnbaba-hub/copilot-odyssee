import { ContentFile, ContentSchemas, validateContent } from './validate';

declare const __dirname: string;

// The test runs from lib-commonjs/core/content, which sits as deep below app/ as
// src/core/content, so the relative path to /content works for both.
const CONTENT_DIR = `${__dirname}/../../../../content`;

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs') as {
  readdirSync(path: string): string[];
  readFileSync(path: string, encoding: string): string;
};
/* eslint-enable @typescript-eslint/no-require-imports */

function readJson(path: string): unknown {
  return JSON.parse(fs.readFileSync(`${CONTENT_DIR}/${path}`, 'utf8'));
}

const schemas: ContentSchemas = {
  common: readJson('schema/common.schema.json') as object,
  islands: readJson('schema/islands.schema.json') as object,
  module: readJson('schema/module.schema.json') as object
};

const islandsFile: ContentFile<unknown> = { path: 'islands.json', data: readJson('islands.json') };
const TODAY = new Date('2026-10-28T00:00:00Z');

function validModule(): Record<string, unknown> {
  return {
    id: 'test-modul',
    island: 'aiolos',
    order: 1,
    version: '1.0.0',
    owner: 'test',
    status: 'draft',
    title: { de: 'Titel', en: 'Title' },
    summary: { de: 'Zusammenfassung', en: 'Summary' },
    estimatedMinutes: 5,
    blocks: [
      {
        type: 'quiz',
        id: 'q1',
        difficulty: 'beginner',
        question: { de: 'Frage?', en: 'Question?' },
        options: [
          { id: 'a', text: { de: 'Ja', en: 'Yes' }, correct: true },
          { id: 'b', text: { de: 'Nein', en: 'No' }, correct: false }
        ]
      }
    ]
  };
}

function validate(module: Record<string, unknown>, path: string = 'modules/test-modul.json'): string[] {
  return validateContent(schemas, islandsFile, [{ path, data: module }], TODAY).errors.map((e) => e.message);
}

describe('validateContent', () => {
  it('accepts the content in the repository', () => {
    const moduleFiles = fs
      .readdirSync(`${CONTENT_DIR}/modules`)
      .filter((name) => /\.json$/.test(name))
      .map((name) => ({ path: `modules/${name}`, data: readJson(`modules/${name}`) }));

    const result = validateContent(schemas, islandsFile, moduleFiles, TODAY);

    expect(result.errors).toEqual([]);
    expect(result.bundle && result.bundle.modules.length).toBe(moduleFiles.length);
  });

  it('accepts a minimal module', () => {
    expect(validate(validModule())).toEqual([]);
  });

  it('requires both German and English texts', () => {
    const module = validModule();
    module.title = { de: 'Nur Deutsch' };
    expect(validate(module).join('\n')).toMatch(/\/title: must have required property 'en'/);
  });

  it('rejects "ß" in German texts', () => {
    const module = validModule();
    module.summary = { de: 'Grösse statt Größe', en: 'Size' };
    expect(validate(module)).toEqual(['/summary/de: "ß" durch "ss" ersetzen (Schweizer Schreibweise).']);
  });

  it('rejects unknown islands and ids that do not match the file name', () => {
    const module = validModule();
    module.island = 'atlantis';
    const errors = validate(module, 'modules/anderer-name.json').join('\n');
    expect(errors).toMatch(/Unbekannte Insel "atlantis"/);
    expect(errors).toMatch(/muss dem Dateinamen entsprechen/);
  });

  it('rejects a quiz without a correct answer', () => {
    const module = validModule();
    const quiz = (module.blocks as Array<{ options: Array<{ correct: boolean }> }>)[0];
    quiz.options[0].correct = false;
    expect(validate(module)).toEqual(['Quiz "q1" hat keine richtige Antwort.']);
  });

  it('rejects unknown block fields', () => {
    const module = validModule();
    (module.blocks as Array<Record<string, unknown>>)[0].hint = 'x';
    expect(validate(module).join('\n')).toMatch(/unbekanntes Feld "hint"/);
  });

  it('requires a review date for active modules and warns when it is overdue', () => {
    const module = validModule();
    module.status = 'active';
    expect(validate(module).join('\n')).toMatch(/must have required property 'reviewedAt'/);

    module.reviewedAt = '2026-01-01';
    module.reviewIntervalDays = 90;
    const result = validateContent(schemas, islandsFile, [{ path: 'modules/test-modul.json', data: module }], TODAY);
    expect(result.errors).toEqual([]);
    expect(result.warnings.map((w) => w.message)).toEqual(['Review überfällig seit 2026-04-01.']);
  });
});
