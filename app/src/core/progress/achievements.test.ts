import { ContentBundle, LearningModule } from '../content/types';
import { earnedSouvenirs, passportStamps } from './achievements';
import { answerQuiz, finishModule, initialState, PlayerState, saveUseCase, startModule, submitPrompt } from './state';

function island(id: string, home?: boolean): ContentBundle['islands'][number] {
  const text = { de: id, en: id };
  return { id, order: 0, license: 'basic', name: text, tool: text, summary: text, motif: text, map: { x: 0, y: 0 }, color: '#000000', home };
}

function quizModule(id: string, islandId: string): LearningModule {
  const text = { de: id, en: id };
  return {
    id,
    island: islandId,
    order: 1,
    version: '1.0.0',
    owner: 'test',
    status: 'active',
    title: text,
    summary: text,
    estimatedMinutes: 1,
    blocks: [
      {
        type: 'quiz',
        id: 'q',
        difficulty: 'beginner',
        question: text,
        options: [
          { id: 'a', text, correct: true },
          { id: 'b', text, correct: false }
        ]
      }
    ]
  };
}

const content: ContentBundle = {
  islands: [island('a'), island('b'), island('c'), island('home', true)],
  modules: [quizModule('a1', 'a'), quizModule('a2', 'a'), quizModule('b1', 'b'), quizModule('c1', 'c'), quizModule('h1', 'home')]
};
const filter = { showDrafts: false };

function play(state: PlayerState, moduleId: string, firstAnswer: string, date: string): PlayerState {
  const module = content.modules.filter((m) => m.id === moduleId)[0];
  let s = startModule(state, module);
  s = answerQuiz(s, moduleId, module.blocks[0] as never, firstAnswer).state;
  if (firstAnswer !== 'a') s = answerQuiz(s, moduleId, module.blocks[0] as never, 'a').state;
  return finishModule(s, module, new Date(date)).state;
}

describe('passport stamps', () => {
  it('stamps an island once all its stages are completed, dated by the last one', () => {
    let state = play(initialState('de'), 'a1', 'a', '2026-10-01T00:00:00Z');
    expect(passportStamps(content, state, filter)).toEqual([]);

    state = play(state, 'a2', 'a', '2026-10-05T00:00:00Z');
    expect(passportStamps(content, state, filter)).toEqual([{ islandId: 'a', date: '2026-10-05T00:00:00.000Z' }]);
  });
});

describe('souvenirs', () => {
  it('starts with none', () => {
    expect(earnedSouvenirs(content, initialState('de'))).toEqual([]);
  });

  it('rewards a stage answered without mistakes but not one with a wrong first try', () => {
    expect(earnedSouvenirs(content, play(initialState('de'), 'a1', 'b', '2026-10-01T00:00:00Z'))).not.toContain('siren-proof');
    expect(earnedSouvenirs(content, play(initialState('de'), 'a1', 'a', '2026-10-01T00:00:00Z'))).toContain('siren-proof');
  });

  it('rewards visiting three islands, coming home and repeating a stage', () => {
    let state = initialState('de');
    ['a1', 'b1', 'h1'].forEach((id) => {
      state = play(state, id, 'a', '2026-10-01T00:00:00Z');
    });
    state = play(state, 'a1', 'a', '2026-10-02T00:00:00Z');
    expect(earnedSouvenirs(content, state)).toEqual(['island-hopper', 'siren-proof', 'homecoming', 'second-voyage']);
  });

  it('rewards the first use case and a perfect prompt', () => {
    let state = saveUseCase(initialState('de'), 'a1', 'u', { task: 'x', frequency: 'weekly', minutesPerTime: 5, prompt: '' }, new Date(0)).state;
    state = submitPrompt(state, 'a1', 'p', 100).state;
    expect(earnedSouvenirs(content, state)).toEqual(['first-postcard', 'aeolus-bag']);
  });
});
