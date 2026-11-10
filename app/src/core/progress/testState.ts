import { ContentFilter, modulesOfIsland } from '../content/bundle';
import { ContentBundle } from '../content/types';
import { recordExam } from './exam';
import { answerQuiz, completeMission, finishModule, initialState, markBriefingRead, PlayerState, saveUseCase, startModule, submitPrompt, updateProfile } from './state';

/**
 * Helper for tests and for the sample journeys of the demo: a player who has played every visible stage and passed every
 * exam of the given islands, through the real game functions so XP and dates
 * look like a real save. Long use case texts make it a worst case for size.
 */
export function playedState(content: ContentBundle, filter: ContentFilter, islandIds?: string[]): PlayerState {
  let state = updateProfile(initialState('de'), { license: 'premium', onboarded: true, area: 'marketing', toured: true });
  const now = new Date('2026-11-01T08:00:00Z');
  content.islands
    .filter((island) => !islandIds || islandIds.indexOf(island.id) >= 0)
    .forEach((island) => {
      modulesOfIsland(content, island.id, filter).forEach((module) => {
        state = startModule(state, module);
        module.blocks.forEach((block) => {
          if (block.type === 'briefing') state = markBriefingRead(state, module.id, block.id).state;
          else if (block.type === 'quiz') {
            const right = block.options.filter((o) => o.correct).map((o) => o.id);
            state = answerQuiz(state, module.id, block, right).state;
          } else if (block.type === 'prompt') state = submitPrompt(state, module.id, block.id, 100).state;
          else if (block.type === 'mission') state = completeMission(state, module.id, block.id, 4).state;
          else if (block.type === 'usecase') {
            const text = `Wochenbericht für das Team aus den Notizen und Mails der Woche zusammenstellen, ${module.id} `.repeat(4);
            state = saveUseCase(state, module.id, block.id, { task: text, frequency: 'weekly', minutesPerTime: 45, prompt: text }, now).state;
          }
        });
        state = finishModule(state, module, now).state;
      });
      const exam = (content.exams || []).filter((e) => e.island === island.id)[0];
      if (exam) state = recordExam(state, island.id, exam.questions.length, exam.questions.length, now).state;
    });
  return state;
}
