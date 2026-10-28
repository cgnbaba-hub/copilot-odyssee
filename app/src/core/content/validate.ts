import Ajv2020, { ErrorObject } from 'ajv/dist/2020';

import { ContentBundle, Island, LearningModule } from './types';

/**
 * Validates content packs against the JSON schemas in /content/schema plus
 * rules a schema cannot express (references, uniqueness, Swiss spelling).
 * Used by the content CLI and the tests; it is not part of the app bundle.
 */

export interface ContentSchemas {
  common: object;
  islands: object;
  module: object;
}

export interface ContentFile<T> {
  /** Path relative to the content folder, used in messages and for the id check. */
  path: string;
  data: T;
}

export interface ValidationIssue {
  file: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  /** Only set when there are no errors. */
  bundle?: ContentBundle;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function formatSchemaError(error: ErrorObject): string {
  const where = error.instancePath || '/';
  if (error.keyword === 'additionalProperties') {
    return `${where}: unbekanntes Feld "${(error.params as { additionalProperty: string }).additionalProperty}"`;
  }
  if (error.keyword === 'enum') {
    return `${where}: muss einer der Werte ${JSON.stringify((error.params as { allowedValues: unknown[] }).allowedValues)} sein`;
  }
  return `${where}: ${error.message}`;
}

function fileBaseName(path: string): string {
  const name = path.split(/[\\/]/).pop() || path;
  return name.replace(/\.json$/, '');
}

/** Reports every German text that uses "ß" instead of the Swiss "ss". */
function findEszett(value: unknown, path: string, found: string[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findEszett(item, `${path}/${index}`, found));
  } else if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      const child = (value as Record<string, unknown>)[key];
      if (key === 'de' && typeof child === 'string' && child.indexOf('ß') >= 0) {
        found.push(`${path}/de`);
      } else {
        findEszett(child, `${path}/${key}`, found);
      }
    });
  }
}

function duplicates(values: string[]): string[] {
  const seen: Record<string, boolean> = {};
  const dupes: string[] = [];
  values.forEach((value) => {
    if (seen[value] && dupes.indexOf(value) < 0) dupes.push(value);
    seen[value] = true;
  });
  return dupes;
}

function checkModule(module: LearningModule, file: string, islandIds: string[], today: Date, result: ValidationResult): void {
  const error = (message: string): void => {
    result.errors.push({ file, message });
  };

  if (module.id !== fileBaseName(file)) {
    error(`Die id "${module.id}" muss dem Dateinamen entsprechen ("${fileBaseName(file)}.json").`);
  }
  if (islandIds.indexOf(module.island) < 0) {
    error(`Unbekannte Insel "${module.island}". Erlaubt: ${islandIds.join(', ')}.`);
  }
  duplicates(module.blocks.map((b) => b.id)).forEach((id) => error(`Baustein-id "${id}" kommt mehrfach vor.`));

  module.blocks.forEach((block) => {
    if (block.type !== 'quiz') return;
    if (!block.options.some((o) => o.correct)) {
      error(`Quiz "${block.id}" hat keine richtige Antwort.`);
    }
    duplicates(block.options.map((o) => o.id)).forEach((id) => error(`Quiz "${block.id}": Antwort-id "${id}" kommt mehrfach vor.`));
  });

  if (module.status === 'active' && module.reviewedAt && module.reviewIntervalDays) {
    const due = new Date(`${module.reviewedAt}T00:00:00Z`).getTime() + module.reviewIntervalDays * DAY_MS;
    if (due < today.getTime()) {
      result.warnings.push({ file, message: `Review überfällig seit ${new Date(due).toISOString().slice(0, 10)}.` });
    }
  }
}

export function validateContent(
  schemas: ContentSchemas,
  islandsFile: ContentFile<unknown>,
  moduleFiles: ContentFile<unknown>[],
  today: Date
): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [] };

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  ajv.addSchema(schemas.common, 'common.schema.json');
  const validateIslands = ajv.compile(schemas.islands);
  const validateModule = ajv.compile(schemas.module);

  const schemaErrors = (file: string, errors: ErrorObject[] | null | undefined): void => {
    (errors || [])
      .filter((e) => e.keyword !== 'if')
      .forEach((e) => result.errors.push({ file, message: formatSchemaError(e) }));
  };

  const eszett = (file: ContentFile<unknown>): void => {
    const found: string[] = [];
    findEszett(file.data, '', found);
    found.forEach((path) => result.errors.push({ file: file.path, message: `${path}: "ß" durch "ss" ersetzen (Schweizer Schreibweise).` }));
  };

  let islands: Island[] = [];
  if (validateIslands(islandsFile.data)) {
    islands = (islandsFile.data as { islands: Island[] }).islands;
    duplicates(islands.map((i) => i.id)).forEach((id) => result.errors.push({ file: islandsFile.path, message: `Insel-id "${id}" kommt mehrfach vor.` }));
  } else {
    schemaErrors(islandsFile.path, validateIslands.errors);
  }
  eszett(islandsFile);

  const islandIds = islands.map((i) => i.id);
  const modules: LearningModule[] = [];
  moduleFiles.forEach((file) => {
    if (!validateModule(file.data)) {
      schemaErrors(file.path, validateModule.errors);
      return;
    }
    const module = file.data as LearningModule;
    checkModule(module, file.path, islandIds, today, result);
    modules.push(module);
  });
  moduleFiles.forEach(eszett);

  duplicates(modules.map((m) => m.id)).forEach((id) => result.errors.push({ file: 'modules', message: `Modul-id "${id}" kommt mehrfach vor.` }));

  if (result.errors.length === 0) {
    result.bundle = { islands, modules };
  }
  return result;
}
