// ============================================================
// Frontend Types for CoPilot Odyssey
// ============================================================

export type UserRole = 'player' | 'content_admin' | 'super_admin';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type IslandStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type DuelStatus = 'pending' | 'waiting_for_b' | 'completed' | 'expired';
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'alltime';

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  current_level: number;
  total_xp: number;
  preferred_language: string;
  role: UserRole;
  avatar_config: AvatarConfig;
  badges?: Badge[];
}

export interface AvatarConfig {
  character?: string;
  hair?: string;
  skin?: string;
  outfit?: string;
  accessory?: string;
  color_primary?: string;
  color_secondary?: string;
}

export interface Island {
  id: string;
  slug: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  lore_de: string;
  lore_en: string;
  visual_theme: string;
  color_primary: string;
  color_secondary: string;
  sort_order: number;
  is_active: boolean;
  npc_name: string | null;
  npc_greeting_de: string | null;
  npc_greeting_en: string | null;
  guardian_name_de: string | null;
  guardian_name_en: string | null;
  xp_completion_bonus: number;
  // Progress
  status?: IslandStatus;
  completion_percentage?: number;
  guardian_defeated?: boolean;
  quiz_completed?: number;
  quiz_total?: number;
  prompt_completed?: number;
  prompt_total?: number;
}

export interface QuizQuestion {
  id: string;
  question_de: string;
  question_en: string;
  difficulty: DifficultyLevel;
  xp_reward: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  text_de: string;
  text_en: string;
  is_correct?: boolean;
  explanation_de?: string;
  explanation_en?: string;
}

export interface PromptChallenge {
  id: string;
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  scenario_de: string;
  scenario_en: string;
  difficulty: DifficultyLevel;
  xp_reward_max: number;
  evaluation_criteria: Record<string, unknown>;
}

export interface PromptEvaluation {
  clarity: number;
  context: number;
  accuracy: number;
  efficiency: number;
  total: number;
  feedback_de: string;
  feedback_en: string;
  ai_evaluated: boolean;
}

export interface Duel {
  id: string;
  challenge_id: string;
  player_a_id: string;
  player_b_id: string | null;
  player_a_name?: string;
  player_b_name?: string;
  player_a_prompt?: string | null;
  player_b_prompt?: string | null;
  player_a_score?: number | null;
  player_b_score?: number | null;
  winner_id?: string | null;
  winner_name?: string | null;
  status: DuelStatus;
  title_de?: string;
  title_en?: string;
  island_slug?: string;
  island_name_de?: string;
  island_name_en?: string;
  difficulty?: DifficultyLevel;
  created_at: string;
  expires_at: string;
  completed_at?: string | null;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  current_level: number;
  avatar_config: AvatarConfig;
  xp_earned: number;
  duels_won?: number;
  rank: number;
}

export interface Badge {
  id?: string;
  slug: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  icon_url?: string | null;
  earned_at?: string;
}

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  emblem_config: Record<string, unknown>;
  level: number;
  total_xp: number;
  member_count: number;
  max_members: number;
  leader_name?: string;
  members?: GuildMember[];
}

export interface GuildMember {
  id: string;
  display_name: string;
  current_level: number;
  avatar_config: AvatarConfig;
  role: 'leader' | 'officer' | 'member';
  joined_at: string;
  total_xp: number;
}

export interface XpResult {
  xpEarned: number;
  newTotalXp: number;
  newLevel: number;
  oldLevel: number;
  leveledUp: boolean;
  events: XpEvent[];
}

export interface XpEvent {
  type: 'level_up' | 'badge_earned' | 'class_unlocked';
  data: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
