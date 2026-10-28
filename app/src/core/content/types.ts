/**
 * Types for the content packs in /content. They mirror the JSON schemas in
 * /content/schema; the schemas are the source of truth for validation.
 */

export type LangCode = string;

/** Text in several languages; "de" and "en" are always present. */
export interface Localized {
  de: string;
  en: string;
  [lang: string]: string;
}

export type License = 'basic' | 'premium';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ModuleStatus = 'draft' | 'active' | 'deprecated';
export type RubricCriterion = 'goal' | 'context' | 'source' | 'expectation';

export type Landmark = 'rocks' | 'wind' | 'temple' | 'letter' | 'amphora' | 'loom' | 'cave' | 'tower' | 'eye' | 'anvil';

export interface Island {
  id: string;
  landmark?: Landmark;
  order: number;
  license: License;
  name: Localized;
  tool: Localized;
  summary: Localized;
  motif: Localized;
  map: { x: number; y: number };
  color: string;
  /** Home port: shows the collected use case cards. */
  home?: boolean;
}

export interface BriefingBlock {
  type: 'briefing';
  id: string;
  title: Localized;
  body: Localized;
  links?: { label: Localized; url: string }[];
}

export interface QuizOption {
  id: string;
  text: Localized;
  correct: boolean;
  explanation?: Localized;
}

export interface QuizBlock {
  type: 'quiz';
  id: string;
  difficulty: Difficulty;
  question: Localized;
  options: QuizOption[];
}

export interface PromptBlock {
  type: 'prompt';
  id: string;
  difficulty: Difficulty;
  title: Localized;
  scenario: Localized;
  rubric: RubricCriterion[];
  examplePrompt?: Localized;
}

export interface MissionBlock {
  type: 'mission';
  id: string;
  title: Localized;
  task: Localized;
  tip?: Localized;
  /** Text to copy into Copilot with one click. */
  copyText?: Localized;
  /** false when the mission happens outside Copilot; defaults to true. */
  copilot?: boolean;
  /** The Microsoft 365 app the mission happens in; Copilot Chat when missing. */
  app?: MissionApp;
}

export type MissionApp = 'outlook' | 'teams' | 'word' | 'excel' | 'powerpoint';

export interface UseCaseBlock {
  type: 'usecase';
  id: string;
  intro: Localized;
}

export type Block = BriefingBlock | QuizBlock | PromptBlock | MissionBlock | UseCaseBlock;
export type BlockType = Block['type'];

export interface LearningModule {
  id: string;
  island: string;
  order: number;
  version: string;
  owner: string;
  status: ModuleStatus;
  reviewedAt?: string;
  reviewIntervalDays?: number;
  license?: License;
  title: Localized;
  summary: Localized;
  estimatedMinutes: number;
  notes?: string;
  blocks: Block[];
}

export interface HelpTopic {
  id: string;
  question: Localized;
  answer: Localized;
  illustration?: 'license';
}

/** A field of work. It selects prompt templates and use case ideas. */
export interface Area {
  id: string;
  name: Localized;
  hint: Localized;
  useCaseIdeas: Localized[];
}

/** A ready-made prompt for the cheat sheet. Placeholders are in [brackets]. */
export interface PromptTemplate {
  id: string;
  title: Localized;
  prompt: Localized;
  /** Area ids; missing means the template suits every area. */
  areas?: string[];
  /** Where the prompt is used; Copilot Chat when missing. */
  app?: MissionApp;
  license: License;
}

/** Everything the app needs to render the game world. */
export interface ContentBundle {
  islands: Island[];
  modules: LearningModule[];
  help?: HelpTopic[];
  areas?: Area[];
  prompts?: PromptTemplate[];
}
