import { Difficulty } from '../content/types';

/** XP ("Seemeilen" in the Odyssee theme) per activity. */
export const QUIZ_XP: Record<Difficulty, number> = {
  beginner: 10,
  intermediate: 20,
  advanced: 40,
  expert: 80
};

export const BRIEFING_XP = 5;
/** A prompt scored 0–100 earns up to this much. */
export const PROMPT_MAX_XP = 100;
export const MISSION_XP = 30;
export const USECASE_XP = 50;
/** Bonus for finishing a module the first time. */
export const MODULE_BONUS_XP = 50;
