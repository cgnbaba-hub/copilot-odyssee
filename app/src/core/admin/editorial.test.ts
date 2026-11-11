import { ContentBundle } from '../content/types';
import { editorialOverview } from './editorial';
import { FeedbackRecord } from './stats';

const text = (de: string): { de: string; en: string } => ({ de, en: de });
const module = (id: string, reviewedAt: string | undefined, days: number | undefined, extra: object = {}): unknown => ({
  id,
  island: 'a',
  order: 1,
  status: 'active',
  title: text(id),
  reviewedAt,
  reviewIntervalDays: days,
  blocks: [
    { id: 'schritt-1', type: 'briefing' },
    { id: 'schritt-2', type: 'quiz', asOf: '2026-11-08' }
  ],
  ...extra
});
const content = {
  islands: [{ id: 'a', order: 0, name: text('Insel A') }],
  modules: [
    module('frisch', '2026-11-01', 180),
    module('bald', '2026-09-01', 90),
    module('ueberfaellig', '2026-06-01', 90),
    module('gemeldet', '2026-11-01', 180, { status: 'draft' }),
    module('ohne-datum', undefined, undefined),
    module('veraltet', '2026-01-01', 30, { status: 'deprecated' })
  ]
} as unknown as ContentBundle;
const now = new Date(2026, 10, 11, 10, 0);

const report = (context: string, created: string, message = 'Stimmt nicht mehr'): FeedbackRecord => ({ kind: 'Stimmt das noch? (Schritt prüfen)', message, context, created });

describe('editorialOverview', () => {
  it('works out when each stage is due and leaves out retired ones', () => {
    const overview = editorialOverview(content, [], now);
    const byId = (id: string): unknown => {
      const s = overview.stages.filter((x) => x.moduleId === id)[0];
      return s && [s.review, s.dueAt, s.daysLeft];
    };
    expect(byId('frisch')).toEqual(['ok', '2027-04-30', 170]);
    expect(byId('bald')).toEqual(['soon', '2026-11-30', 19]);
    expect(byId('ueberfaellig')).toEqual(['overdue', '2026-08-30', -73]);
    expect(byId('ohne-datum')).toEqual(['unknown', undefined, undefined]);
    expect(byId('veraltet')).toBeUndefined();
    expect([overview.overdue, overview.soon, overview.reported, overview.drafts]).toEqual([1, 1, 0, 1]);
  });

  it('matches reports to their stage and keeps them open until the stage or step is checked again', () => {
    const feedback = [
      report('Etappe «Gemeldet» · Schritt 1 (gemeldet/schritt-1)', '2026-11-05T09:00:00Z', 'Knopf heisst anders'),
      report('Stage “Gemeldet” · step 1 (gemeldet/schritt-1)', '2026-10-20T09:00:00Z', 'vor der Prüfung'),
      report('Etappe «Gemeldet» · Schritt 2 (gemeldet/schritt-2)', '2026-11-05T09:00:00Z', 'vor der Prüfung des Schritts'),
      report('Etappe «Gemeldet» · Schritt 2 (gemeldet/schritt-2)', '2026-11-09T09:00:00Z', 'danach'),
      report('Etappe «Unbekannt» · Schritt 1 (gibt-es-nicht/schritt-1)', '2026-11-09T09:00:00Z'),
      { kind: 'Lob', message: 'Danke', context: 'Startseite', created: '2026-11-09T09:00:00Z' }
    ];
    const overview = editorialOverview(content, feedback, now);
    expect(overview.reported).toBe(1);
    expect(overview.stages[0].moduleId).toBe('gemeldet');
    expect(overview.stages[0].reports.map((r) => [r.stepId, r.message])).toEqual([
      ['schritt-2', 'danach'],
      ['schritt-1', 'Knopf heisst anders']
    ]);
  });

  it('lists what needs attention first', () => {
    const feedback = [report('Etappe «Frisch» · Schritt 1 (frisch/schritt-1)', '2026-11-05T09:00:00Z')];
    expect(editorialOverview(content, feedback, now).stages.map((s) => s.moduleId)).toEqual(['frisch', 'ueberfaellig', 'bald', 'gemeldet', 'ohne-datum']);
  });
});
