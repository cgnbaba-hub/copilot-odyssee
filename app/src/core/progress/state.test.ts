import { LearningModule, QuizBlock } from '../content/types';
import {
  answerQuiz,
  completeMission,
  finishModule,
  getModule,
  initialState,
  markBriefingRead,
  minutesPerMonth,
  moduleStatus,
  nextBlockIndex,
  saveUseCase,
  startModule,
  submitPrompt
} from './state';

const quiz: QuizBlock = {
  type: 'quiz',
  id: 'q1',
  difficulty: 'intermediate',
  question: { de: 'Frage?', en: 'Question?' },
  options: [
    { id: 'a', text: { de: 'Ja', en: 'Yes' }, correct: true },
    { id: 'b', text: { de: 'Nein', en: 'No' }, correct: false }
  ]
};

const module: LearningModule = {
  id: 'm1',
  island: 'aiolos',
  order: 1,
  version: '1.0.0',
  owner: 'test',
  status: 'active',
  title: { de: 'Modul', en: 'Module' },
  summary: { de: 'Text', en: 'Text' },
  estimatedMinutes: 5,
  blocks: [{ type: 'briefing', id: 'b1', title: { de: 'T', en: 'T' }, body: { de: 'B', en: 'B' } }, quiz]
};

describe('player state', () => {
  it('pays full quiz XP for a correct first attempt and nothing twice', () => {
    let outcome = answerQuiz(initialState('de'), 'm1', quiz, 'a');
    expect(outcome.correct).toBe(true);
    expect(outcome.xpGained).toBe(20);

    outcome = answerQuiz(outcome.state, 'm1', quiz, 'a');
    expect(outcome.xpGained).toBe(0);
    expect(outcome.state.xp).toBe(20);
  });

  it('pays half quiz XP after a wrong attempt', () => {
    const wrong = answerQuiz(initialState('de'), 'm1', quiz, 'b');
    expect(wrong.correct).toBe(false);
    expect(wrong.state.blocks['m1/q1'].done).toBe(false);

    const right = answerQuiz(wrong.state, 'm1', quiz, 'a');
    expect(right.xpGained).toBe(10);
  });

  it('pays the difference when a prompt scores better', () => {
    const first = submitPrompt(initialState('de'), 'm1', 'p1', 50);
    expect(first.xpGained).toBe(50);
    const better = submitPrompt(first.state, 'm1', 'p1', 75);
    expect(better.xpGained).toBe(25);
    const worse = submitPrompt(better.state, 'm1', 'p1', 25);
    expect(worse.xpGained).toBe(0);
    expect(worse.state.blocks['m1/p1'].bestScore).toBe(75);
  });

  it('stores missions and use case cards', () => {
    const mission = completeMission(initialState('de'), 'm1', 'mi', 4);
    expect(mission.state.blocks['m1/mi'].rating).toBe(4);

    const card = saveUseCase(mission.state, 'm1', 'u1', { task: 'Statusbericht', frequency: 'weekly', minutesPerTime: 30, prompt: '' }, new Date(0));
    expect(card.xpGained).toBe(50);
    expect(card.state.useCases).toHaveLength(1);
    expect(card.state.useCases[0].moduleId).toBe('m1');
  });

  it('counts repeated runs of a module without paying XP again', () => {
    let state = startModule(initialState('de'), module);
    expect(moduleStatus(state, module)).toBe('inProgress');
    state = markBriefingRead(state, 'm1', 'b1').state;
    expect(nextBlockIndex(state, module)).toBe(1);
    state = answerQuiz(state, 'm1', quiz, 'a').state;

    const finished = finishModule(state, module, new Date('2026-10-01T10:00:00Z'));
    expect(finished.xpGained).toBe(50);
    state = finished.state;
    expect(moduleStatus(state, module)).toBe('completed');
    const xpAfterFirstRun = state.xp;

    state = startModule(state, module);
    expect(nextBlockIndex(state, module)).toBe(0);
    state = markBriefingRead(state, 'm1', 'b1').state;
    state = answerQuiz(state, 'm1', quiz, 'a').state;
    state = finishModule(state, module, new Date('2026-10-02T10:00:00Z')).state;

    expect(state.xp).toBe(xpAfterFirstRun);
    expect(getModule(state, 'm1')).toEqual({ started: 2, completed: 2, inProgress: false, firstCompletedAt: '2026-10-01T10:00:00.000Z' });
  });

  it('resumes an unfinished run instead of starting a new one', () => {
    let state = startModule(initialState('de'), module);
    state = markBriefingRead(state, 'm1', 'b1').state;
    state = startModule(state, module);
    expect(getModule(state, 'm1').started).toBe(1);
    expect(nextBlockIndex(state, module)).toBe(1);
  });

  it('estimates the monthly time a use case takes', () => {
    expect(minutesPerMonth({ task: 'x', frequency: 'weekly', minutesPerTime: 30, prompt: '' })).toBe(120);
    expect(minutesPerMonth({ task: 'x', frequency: 'daily', minutesPerTime: 10, prompt: '' })).toBe(200);
  });
});
