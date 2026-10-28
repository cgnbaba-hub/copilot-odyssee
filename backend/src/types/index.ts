// ============================================================
// Shared Types for CoPilot Odyssey Backend
// ============================================================

export type UserRole = 'player' | 'content_admin' | 'super_admin';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type IslandStatus = 'locked' | 'available' | 'in_progress' | 'completed';
export type DuelStatus = 'pending' | 'waiting_for_b' | 'completed' | 'expired';
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'alltime';
export type ClassStatus = 'locked' | 'in_progress' | 'unlocked';
export type GuildMemberRole = 'leader' | 'officer' | 'member';
export type CutsceneTrigger = 'island_enter' | 'pre_guardian' | 'post_guardian' | 'milestone';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  branding_config: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  tenant_id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_config: AvatarConfig;
  current_level: number;
  total_xp: number;
  preferred_language: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface AvatarConfig {
  hair?: string;
  skin?: string;
  outfit?: string;
  accessory?: string;
  color_primary?: string;
  color_secondary?: string;
}

export interface Island {
  id: string;
  tenant_id: string;
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
  prerequisite_island_ids: string[];
  npc_name: string | null;
  npc_greeting_de: string | null;
  npc_greeting_en: string | null;
  guardian_name_de: string | null;
  guardian_name_en: string | null;
  guardian_description_de: string | null;
  guardian_description_en: string | null;
  xp_completion_bonus: number;
  created_at: Date;
  updated_at: Date;
}

export interface IslandProgress {
  id: string;
  user_id: string;
  island_id: string;
  status: IslandStatus;
  completion_percentage: number;
  guardian_defeated: boolean;
  quiz_completed: number;
  quiz_total: number;
  prompt_completed: number;
  prompt_total: number;
  started_at: Date | null;
  completed_at: Date | null;
}

export interface QuizQuestion {
  id: string;
  tenant_id: string;
  island_id: string;
  question_de: string;
  question_en: string;
  difficulty: DifficultyLevel;
  xp_reward: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuizOption {
  id: string;
  question_id: string;
  text_de: string;
  text_en: string;
  is_correct: boolean;
  explanation_de: string;
  explanation_en: string;
  sort_order: number;
}

export interface PromptChallenge {
  id: string;
  tenant_id: string;
  island_id: string;
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  scenario_de: string;
  scenario_en: string;
  ideal_prompt_de: string;
  ideal_prompt_en: string;
  evaluation_criteria: Record<string, unknown>;
  difficulty: DifficultyLevel;
  xp_reward_max: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PromptAttempt {
  id: string;
  user_id: string;
  challenge_id: string;
  prompt_text: string;
  score_clarity: number;
  score_context: number;
  score_accuracy: number;
  score_efficiency: number;
  total_score: number;
  ai_feedback_de: string | null;
  ai_feedback_en: string | null;
  xp_earned: number;
  ai_evaluated: boolean;
  attempted_at: Date;
}

export interface Duel {
  id: string;
  tenant_id: string;
  challenge_id: string;
  player_a_id: string;
  player_b_id: string | null;
  player_a_prompt: string | null;
  player_b_prompt: string | null;
  player_a_score: number | null;
  player_b_score: number | null;
  winner_id: string | null;
  status: DuelStatus;
  island_id: string | null;
  difficulty: DifficultyLevel | null;
  created_at: Date;
  expires_at: Date;
  completed_at: Date | null;
}

export interface Guild {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  emblem_config: Record<string, unknown>;
  leader_id: string | null;
  max_members: number;
  total_xp: number;
  level: number;
  created_at: Date;
}

export interface Badge {
  id: string;
  tenant_id: string;
  slug: string;
  name_de: string;
  name_en: string;
  description_de: string;
  description_en: string;
  icon_url: string | null;
  criteria: Record<string, unknown>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// XP Event
export interface XpEvent {
  type: 'level_up' | 'badge_earned' | 'class_unlocked';
  data: Record<string, unknown>;
}

export interface XpResult {
  xpEarned: number;
  newTotalXp: number;
  newLevel: number;
  oldLevel: number;
  leveledUp: boolean;
  events: XpEvent[];
}
