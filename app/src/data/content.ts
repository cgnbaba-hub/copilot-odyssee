import { ContentBundle } from '../core/content/types';

/** Where the game content comes from. */
export interface ContentSource {
  load(): Promise<ContentBundle>;
}

/** Content compiled into the app package; always available. */
export class BundledContentSource implements ContentSource {
  public constructor(private readonly _bundle: ContentBundle) {}

  public load(): Promise<ContentBundle> {
    return Promise.resolve(this._bundle);
  }
}

/** Format of the exported content file (see tools/content-cli.ts export). */
export const CONTENT_FILE_FORMAT = 1;

export interface ContentFile extends ContentBundle {
  format: number;
  generatedAt: string;
}

function isObject(value: unknown): value is { [key: string]: unknown } {
  return !!value && typeof value === 'object';
}

/**
 * The file was fully validated when it was exported; this only guards
 * against a wrong or damaged file so the app never renders garbage.
 */
export function parseContentFile(data: unknown): ContentBundle {
  if (!isObject(data) || data.format !== CONTENT_FILE_FORMAT) throw new Error('Unbekanntes Format der Inhaltsdatei');
  const islands = data.islands;
  const modules = data.modules;
  if (!Array.isArray(islands) || islands.length === 0 || !Array.isArray(modules)) throw new Error('Inhaltsdatei unvollständig');
  const islandsOk = islands.every((i) => isObject(i) && typeof i.id === 'string' && isObject(i.map) && isObject(i.name));
  const modulesOk = modules.every((m) => isObject(m) && typeof m.id === 'string' && typeof m.island === 'string' && Array.isArray(m.blocks));
  if (!islandsOk || !modulesOk) throw new Error('Inhaltsdatei beschädigt');
  return { islands: islands as ContentBundle['islands'], modules: modules as ContentBundle['modules'] };
}
