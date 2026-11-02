import { ContentBundle, LearningModule, QuizBlock } from '../content/types';
import { passportStamps } from './achievements';
import { EXAM_XP } from './rewards';
import { examOpen, examPassMark, examPassed, recordExam } from './exam';
import { finishModule, initialState, markBriefingRead, startModule } from './state';

const text = { de: 'x', en: 'x' };
const q = (id: string): QuizBlock => ({
  type: 'quiz',
  id,
  difficulty: 'beginner',
  question: text,
  options: [
    { id: 'a', text, correct: true },
    { id: 'b', text, correct: false }
  ]
});
const module: LearningModule = {
  id: 'm1',
  island: 'i1',
  order: 1,
  version: '1.0.0',
  owner: 'x',
  status: 'active',
  title: text,
  summary: text,
  estimatedMinutes: 5,
  blocks: [{ type: 'briefing', id: 'b1', title: text, body: text }]
} as LearningModule;
const content: ContentBundle = {
  islands: [{ id: 'i1', order: 0, license: 'basic', name: text, tool: text, summary: text, motif: text, map: { x: 1, y: 1 }, color: '#000000' }],
  modules: [module],
  exams: [{ island: 'i1', questions: [q('e1'), q('e2'), q('e3'), q('e4')] }]
};
const filter = { showDrafts: false };
const now = new Date('2026-11-02T10:00:00Z');

function islandDone(): ReturnType<typeof initialState> {
  let s = startModule(initialState('de'), module);
  s = markBriefingRead(s, 'm1', 'b1').state;
  return finishModule(s, module, now).state;
}

describe('island exam', () => {
  it('needs three of four right', () => {
    expect(examPassMark(4)).toBe(3);
    expect(examPassMark(3)).toBe(3);
    expect(examPassMark(5)).toBe(4);
  });

  it('opens only when every stage is done', () => {
    expect(examOpen(content, initialState('de'), 'i1', filter)).toBe(false);
    expect(examOpen(content, islandDone(), 'i1', filter)).toBe(true);
  });

  it('pays once, keeps the best result and stays passed after a weaker try', () => {
    const fail = recordExam(islandDone(), 'i1', 2, 4, now);
    expect(fail.passed).toBe(false);
    expect(fail.xpGained).toBe(0);
    const pass = recordExam(fail.state, 'i1', 4, 4, now);
    expect(pass.xpGained).toBe(EXAM_XP);
    const again = recordExam(pass.state, 'i1', 1, 4, now);
    expect(again.xpGained).toBe(0);
    expect(examPassed(again.state, 'i1')).toBe(true);
    expect(again.state.exams && again.state.exams.i1).toMatchObject({ best: 4, attempts: 3, passedAt: now.toISOString() });
  });

  it('withholds the stamp until the exam is passed', () => {
    const done = islandDone();
    expect(passportStamps(content, done, filter)).toEqual([]);
    const passed = recordExam(done, 'i1', 3, 4, new Date('2026-11-03T08:00:00Z')).state;
    expect(passportStamps(content, passed, filter)).toEqual([{ islandId: 'i1', date: '2026-11-03T08:00:00.000Z' }]);
  });
});
