import { ContentBundle } from '../core/content/types';
import { initialState } from '../core/progress/state';
import { MemoryProgressStore } from '../core/progress/store';
import { connect } from './connect';
import { CONTENT_FILE_FORMAT, parseContentFile } from './content';
import { FakeSharePoint } from './FakeSharePoint';
import { SharePointProgressStore } from './sharepoint/SharePointProgressStore';

const WEB = 'https://contoso.sharepoint.com/sites/odyssee';

const text = { de: 'x', en: 'x' };
const bundled: ContentBundle = {
  islands: [{ id: 'mitgeliefert', order: 0, license: 'basic', name: text, tool: text, summary: text, motif: text, map: { x: 1, y: 1 }, color: '#000000' }],
  modules: []
};
const remote: ContentBundle = { ...bundled, islands: [{ ...bundled.islands[0], id: 'aus-sharepoint' }] };
const remoteFile = JSON.stringify({ format: CONTENT_FILE_FORMAT, generatedAt: '2026-10-28T00:00:00Z', ...remote });

describe('SharePointProgressStore', () => {
  it('creates one item per player and updates it afterwards', async () => {
    const sp = new FakeSharePoint(WEB);
    const store = new SharePointProgressStore(sp, WEB, 'spieler-1');
    expect(await store.load()).toBeUndefined();

    await store.save({ ...initialState('de'), xp: 10 });
    await store.save({ ...initialState('de'), xp: 20 });
    expect(sp.items).toHaveLength(1);
    expect(sp.items[0].Title).toBe('spieler-1');

    const reloaded = await new SharePointProgressStore(sp, WEB, 'spieler-1').load();
    expect(reloaded && reloaded.xp).toBe(20);
    expect(await new SharePointProgressStore(sp, WEB, 'spieler-2').load()).toBeUndefined();
  });

  it('ignores a damaged state and deletes the item on clear', async () => {
    const sp = new FakeSharePoint(WEB);
    sp.items.push({ Id: 5, Title: 'spieler-1', OdysseeState: '{kaputt' });
    const store = new SharePointProgressStore(sp, WEB, 'spieler-1');
    expect(await store.load()).toBeUndefined();
    await store.clear();
    expect(sp.items).toEqual([]);
  });

  it('escapes quotes in the player key', async () => {
    const sp = new FakeSharePoint(WEB);
    await new SharePointProgressStore(sp, WEB, "o'brien").load();
    expect(decodeURIComponent(sp.requests[0])).toContain("Title eq 'o''brien'");
  });
});

describe('parseContentFile', () => {
  it('accepts an exported file and rejects anything else', () => {
    expect(parseContentFile(JSON.parse(remoteFile)).islands[0].id).toBe('aus-sharepoint');
    expect(() => parseContentFile({ format: 99 })).toThrow('Unbekanntes Format');
    expect(() => parseContentFile({ format: CONTENT_FILE_FORMAT, islands: [{}], modules: [] })).toThrow('beschädigt');
  });
});

describe('connect', () => {
  const options = (sp: FakeSharePoint, browserStore = new MemoryProgressStore()): Parameters<typeof connect>[0] => ({
    client: sp,
    webUrl: WEB,
    playerKey: 'spieler-1',
    bundledContent: bundled,
    browserStore,
    saveDelayMs: 0
  });

  it('uses SharePoint when library and list exist', async () => {
    const sp = new FakeSharePoint(WEB);
    sp.setContentFile(remoteFile);
    const connection = await connect(options(sp));
    expect(connection.contentSource).toBe('sharepoint');
    expect(connection.content.islands[0].id).toBe('aus-sharepoint');
    expect(connection.storage).toBe('sharepoint');
  });

  it('falls back to bundled content and the browser before provisioning', async () => {
    const sp = new FakeSharePoint(WEB);
    sp.listExists = false;
    const browserStore = new MemoryProgressStore();
    const connection = await connect(options(sp, browserStore));
    expect(connection.contentSource).toBe('bundled');
    expect(connection.content).toBe(bundled);
    expect(connection.storage).toBe('browser');
    expect(connection.store).toBe(browserStore);
  });

  it('moves progress from the browser to SharePoint once the list exists', async () => {
    const sp = new FakeSharePoint(WEB);
    const browserStore = new MemoryProgressStore();
    await browserStore.save({ ...initialState('de'), xp: 42 });

    await connect(options(sp, browserStore));

    expect(sp.items).toHaveLength(1);
    expect(JSON.parse(sp.items[0].OdysseeState as string).xp).toBe(42);
    expect(await browserStore.load()).toBeUndefined();
  });

  it('keeps SharePoint progress when both exist', async () => {
    const sp = new FakeSharePoint(WEB);
    await new SharePointProgressStore(sp, WEB, 'spieler-1').save({ ...initialState('de'), xp: 7 });
    const browserStore = new MemoryProgressStore();
    await browserStore.save({ ...initialState('de'), xp: 99 });

    const connection = await connect(options(sp, browserStore));
    const loaded = await connection.store.load();
    expect(loaded && loaded.xp).toBe(7);
  });
});
