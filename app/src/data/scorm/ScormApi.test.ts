import { fakeApi } from './fakeApi';
import { ApiWindow, connectScorm, findScormApi, ScormConnection } from './ScormApi';

/** A chain of frames: the first is the course, the last the top window. */
function frames(count: number): ApiWindow[] {
  const chain: ApiWindow[] = [];
  for (let i = 0; i < count; i++) chain.push({});
  chain.forEach((win, i) => {
    win.parent = chain[i + 1] || win;
  });
  return chain;
}

describe('findScormApi', () => {
  it('finds the API in the window itself or a parent frame', () => {
    const api = fakeApi();
    const chain = frames(4);
    chain[3].API = api;
    expect(findScormApi(chain[0])).toBe(api);
    expect(findScormApi(chain[3])).toBe(api);
  });

  it('gives up after ten parents', () => {
    const chain = frames(13);
    chain[12].API = fakeApi();
    expect(findScormApi(chain[0])).toBeUndefined();
    expect(findScormApi(chain[2])).toBeDefined();
  });

  it('looks in the opener of a pop-up and its parents', () => {
    const api = fakeApi();
    const lms = frames(2);
    lms[1].API = api;
    const popup = frames(1)[0];
    popup.opener = lms[0];
    expect(findScormApi(popup)).toBe(api);
  });

  it('skips frames of other origins and objects that are not the API', () => {
    const api = fakeApi();
    const chain = frames(3);
    Object.defineProperty(chain[1], 'API', {
      get: () => {
        throw new Error('cross-origin');
      }
    });
    chain[0].API = { name: 'something else' };
    chain[2].API = api;
    expect(findScormApi(chain[0])).toBe(api);
  });

  it('returns undefined outside an LMS', () => {
    expect(findScormApi(frames(1)[0])).toBeUndefined();
    expect(connectScorm(frames(1)[0])).toBeUndefined();
  });
});

describe('ScormConnection', () => {
  it('initialises when connecting', () => {
    const api = fakeApi();
    const win: ApiWindow = { API: api };
    win.parent = win;
    expect(connectScorm(win)).toBeInstanceOf(ScormConnection);
    expect(api.calls).toEqual(['init']);
  });

  it('never throws, even when the LMS does', () => {
    const fail = (): string => {
      throw new Error('LMS down');
    };
    const connection = new ScormConnection({ LMSInitialize: fail, LMSFinish: fail, LMSGetValue: fail, LMSSetValue: fail, LMSCommit: fail });
    expect(connection.initialize()).toBe(false);
    expect(connection.get('cmi.suspend_data')).toBe('');
    expect(connection.set('cmi.suspend_data', 'x')).toBe(false);
    expect(connection.commit()).toBe(false);
    expect(connection.finish()).toBe(false);
  });

  it('finishes once and ignores calls afterwards', () => {
    const api = fakeApi();
    const connection = new ScormConnection(api);
    expect(connection.finish()).toBe(true);
    expect(connection.finish()).toBe(false);
    expect(connection.set('cmi.core.lesson_status', 'completed')).toBe(false);
    expect(connection.commit()).toBe(false);
    expect(api.calls).toEqual(['finish']);
  });
});
