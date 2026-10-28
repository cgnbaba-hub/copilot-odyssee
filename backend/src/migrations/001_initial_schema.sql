-- =============================================================
-- CoPilot Odyssey – Complete Database Schema
-- Migration: 001_initial_schema.sql
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TENANTS
-- =============================================================
CREATE TABLE tenants (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(100) NOT NULL UNIQUE,
    branding_config JSONB NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- USERS & AUTH
-- =============================================================
CREATE TYPE user_role AS ENUM ('player', 'content_admin', 'super_admin');

CREATE TABLE users (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username          VARCHAR(50) NOT NULL,
    email             VARCHAR(255) NOT NULL,
    password_hash     VARCHAR(255) NOT NULL,
    display_name      VARCHAR(100) NOT NULL,
    avatar_config     JSONB NOT NULL DEFAULT '{}',
    current_level     INTEGER NOT NULL DEFAULT 1,
    total_xp          BIGINT NOT NULL DEFAULT 0,
    preferred_language VARCHAR(2) NOT NULL DEFAULT 'de',
    role              user_role NOT NULL DEFAULT 'player',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, username),
    UNIQUE (tenant_id, email)
);

CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- =============================================================
-- ISLANDS / SPIELWELT
-- =============================================================
CREATE TABLE islands (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slug                    VARCHAR(100) NOT NULL,
    name_de                 VARCHAR(255) NOT NULL,
    name_en                 VARCHAR(255) NOT NULL,
    description_de          TEXT NOT NULL,
    description_en          TEXT NOT NULL,
    lore_de                 TEXT NOT NULL DEFAULT '',
    lore_en                 TEXT NOT NULL DEFAULT '',
    visual_theme            VARCHAR(50) NOT NULL DEFAULT 'default',
    color_primary           VARCHAR(7) NOT NULL DEFAULT '#7B68EE',
    color_secondary         VARCHAR(7) NOT NULL DEFAULT '#E0E0FF',
    sort_order              INTEGER NOT NULL DEFAULT 0,
    is_active               BOOLEAN NOT NULL DEFAULT true,
    prerequisite_island_ids JSONB NOT NULL DEFAULT '[]',
    npc_name                VARCHAR(100),
    npc_greeting_de         TEXT,
    npc_greeting_en         TEXT,
    guardian_name_de        VARCHAR(100),
    guardian_name_en        VARCHAR(100),
    guardian_description_de TEXT,
    guardian_description_en TEXT,
    xp_completion_bonus     INTEGER NOT NULL DEFAULT 500,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, slug)
);

CREATE TYPE island_status AS ENUM ('locked', 'available', 'in_progress', 'completed');

CREATE TABLE island_progress (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    island_id             UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    status                island_status NOT NULL DEFAULT 'locked',
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    guardian_defeated     BOOLEAN NOT NULL DEFAULT false,
    quiz_completed        INTEGER NOT NULL DEFAULT 0,
    quiz_total            INTEGER NOT NULL DEFAULT 0,
    prompt_completed      INTEGER NOT NULL DEFAULT 0,
    prompt_total          INTEGER NOT NULL DEFAULT 0,
    started_at            TIMESTAMPTZ,
    completed_at          TIMESTAMPTZ,
    UNIQUE (user_id, island_id)
);

-- =============================================================
-- CHARACTER CLASSES
-- =============================================================
CREATE TABLE character_classes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slug                VARCHAR(100) NOT NULL,
    name_de             VARCHAR(255) NOT NULL,
    name_en             VARCHAR(255) NOT NULL,
    description_de      TEXT NOT NULL,
    description_en      TEXT NOT NULL,
    required_island_ids JSONB NOT NULL DEFAULT '[]',
    bonus_type          VARCHAR(50),  -- 'xp_multiplier', 'quiz_hint', 'prompt_bonus'
    bonus_value         NUMERIC(5,2),
    icon_url            VARCHAR(500),
    UNIQUE (tenant_id, slug)
);

CREATE TYPE class_status AS ENUM ('locked', 'in_progress', 'unlocked');

CREATE TABLE user_classes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES character_classes(id) ON DELETE CASCADE,
    status      class_status NOT NULL DEFAULT 'locked',
    unlocked_at TIMESTAMPTZ,
    UNIQUE (user_id, class_id)
);

-- =============================================================
-- QUIZ SYSTEM
-- =============================================================
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

CREATE TABLE quiz_questions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    island_id   UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    question_de TEXT NOT NULL,
    question_en TEXT NOT NULL,
    difficulty  difficulty_level NOT NULL DEFAULT 'beginner',
    xp_reward   INTEGER NOT NULL DEFAULT 10,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_options (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id    UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    text_de        TEXT NOT NULL,
    text_en        TEXT NOT NULL,
    is_correct     BOOLEAN NOT NULL DEFAULT false,
    explanation_de TEXT NOT NULL DEFAULT '',
    explanation_en TEXT NOT NULL DEFAULT '',
    sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE quiz_attempts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id       UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES quiz_options(id),
    is_correct        BOOLEAN NOT NULL,
    xp_earned         INTEGER NOT NULL DEFAULT 0,
    attempted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_question ON quiz_attempts(question_id);

-- =============================================================
-- PROMPT CHALLENGES
-- =============================================================
CREATE TABLE prompt_challenges (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    island_id           UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    title_de            VARCHAR(255) NOT NULL,
    title_en            VARCHAR(255) NOT NULL,
    description_de      TEXT NOT NULL,
    description_en      TEXT NOT NULL,
    scenario_de         TEXT NOT NULL,
    scenario_en         TEXT NOT NULL,
    ideal_prompt_de     TEXT NOT NULL,
    ideal_prompt_en     TEXT NOT NULL,
    evaluation_criteria JSONB NOT NULL DEFAULT '{}',
    difficulty          difficulty_level NOT NULL DEFAULT 'beginner',
    xp_reward_max       INTEGER NOT NULL DEFAULT 100,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prompt_attempts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id    UUID NOT NULL REFERENCES prompt_challenges(id) ON DELETE CASCADE,
    prompt_text     TEXT NOT NULL,
    score_clarity   INTEGER NOT NULL DEFAULT 0,
    score_context   INTEGER NOT NULL DEFAULT 0,
    score_accuracy  INTEGER NOT NULL DEFAULT 0,
    score_efficiency INTEGER NOT NULL DEFAULT 0,
    total_score     INTEGER NOT NULL DEFAULT 0,
    ai_feedback_de  TEXT,
    ai_feedback_en  TEXT,
    xp_earned       INTEGER NOT NULL DEFAULT 0,
    ai_evaluated    BOOLEAN NOT NULL DEFAULT false,
    attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_attempts_user ON prompt_attempts(user_id);
CREATE INDEX idx_prompt_attempts_challenge ON prompt_attempts(challenge_id);

-- =============================================================
-- DUEL SYSTEM
-- =============================================================
CREATE TYPE duel_status AS ENUM ('pending', 'waiting_for_b', 'completed', 'expired');

CREATE TABLE duels (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    challenge_id     UUID NOT NULL REFERENCES prompt_challenges(id) ON DELETE CASCADE,
    player_a_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    player_b_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    player_a_prompt  TEXT,
    player_b_prompt  TEXT,
    player_a_score   INTEGER,
    player_b_score   INTEGER,
    winner_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    status           duel_status NOT NULL DEFAULT 'pending',
    island_id        UUID REFERENCES islands(id),
    difficulty       difficulty_level,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '48 hours'),
    completed_at     TIMESTAMPTZ
);

CREATE INDEX idx_duels_player_a ON duels(player_a_id);
CREATE INDEX idx_duels_player_b ON duels(player_b_id);
CREATE INDEX idx_duels_status ON duels(status);
CREATE INDEX idx_duels_expires ON duels(expires_at);

CREATE TABLE duel_queue (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    island_id   UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    difficulty  difficulty_level NOT NULL DEFAULT 'beginner',
    user_level  INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

-- =============================================================
-- GUILDS
-- =============================================================
CREATE TYPE guild_member_role AS ENUM ('leader', 'officer', 'member');

CREATE TABLE guilds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    emblem_config JSONB NOT NULL DEFAULT '{}',
    leader_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    max_members INTEGER NOT NULL DEFAULT 50,
    total_xp    BIGINT NOT NULL DEFAULT 0,
    level       INTEGER NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, name)
);

CREATE TABLE guild_members (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id   UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       guild_member_role NOT NULL DEFAULT 'member',
    joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)
);

-- =============================================================
-- LEADERBOARD & BADGES
-- =============================================================
CREATE TYPE period_type AS ENUM ('daily', 'weekly', 'monthly', 'alltime');

CREATE TABLE leaderboard_entries (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    period_type period_type NOT NULL,
    period_start DATE NOT NULL,
    xp_earned   BIGINT NOT NULL DEFAULT 0,
    duels_won   INTEGER NOT NULL DEFAULT 0,
    rank        INTEGER,
    UNIQUE (tenant_id, user_id, period_type, period_start)
);

CREATE INDEX idx_leaderboard_tenant_period ON leaderboard_entries(tenant_id, period_type, period_start, xp_earned DESC);

CREATE TABLE badges (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    slug           VARCHAR(100) NOT NULL,
    name_de        VARCHAR(255) NOT NULL,
    name_en        VARCHAR(255) NOT NULL,
    description_de TEXT NOT NULL,
    description_en TEXT NOT NULL,
    icon_url       VARCHAR(500),
    criteria       JSONB NOT NULL DEFAULT '{}',
    UNIQUE (tenant_id, slug)
);

CREATE TABLE user_badges (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id   UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

-- =============================================================
-- DAILY / WEEKLY QUESTS
-- =============================================================
CREATE TABLE daily_quests (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES prompt_challenges(id) ON DELETE CASCADE,
    quest_date   DATE NOT NULL,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (tenant_id, quest_date)
);

CREATE TABLE weekly_quests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title_de        VARCHAR(255) NOT NULL,
    title_en        VARCHAR(255) NOT NULL,
    description_de  TEXT NOT NULL,
    description_en  TEXT NOT NULL,
    challenge_ids   JSONB NOT NULL DEFAULT '[]',
    week_start      DATE NOT NULL,
    xp_reward_max   INTEGER NOT NULL DEFAULT 500,
    UNIQUE (tenant_id, week_start)
);

CREATE TABLE user_quest_completions (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id     UUID NOT NULL,
    quest_type   VARCHAR(20) NOT NULL,  -- 'daily' or 'weekly'
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    xp_earned    INTEGER NOT NULL DEFAULT 0,
    UNIQUE (user_id, quest_id, quest_type)
);

-- =============================================================
-- STORY / CUTSCENES
-- =============================================================
CREATE TYPE cutscene_trigger AS ENUM ('island_enter', 'pre_guardian', 'post_guardian', 'milestone');

CREATE TABLE cutscenes (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    island_id     UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    trigger_point cutscene_trigger NOT NULL,
    sort_order    INTEGER NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE cutscene_panels (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cutscene_id  UUID NOT NULL REFERENCES cutscenes(id) ON DELETE CASCADE,
    image_url    VARCHAR(500),
    dialogue_de  TEXT NOT NULL DEFAULT '',
    dialogue_en  TEXT NOT NULL DEFAULT '',
    speaker_name VARCHAR(100),
    sort_order   INTEGER NOT NULL DEFAULT 0
);

-- =============================================================
-- NPC DATA (per island)
-- =============================================================
CREATE TABLE npcs (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    island_id    UUID NOT NULL REFERENCES islands(id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    role         VARCHAR(100) NOT NULL DEFAULT 'guide',
    dialogue_de  JSONB NOT NULL DEFAULT '[]',
    dialogue_en  JSONB NOT NULL DEFAULT '[]',
    sprite_url   VARCHAR(500)
);

-- =============================================================
-- HELPER: Updated_at trigger
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tenants_updated_at    BEFORE UPDATE ON tenants           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at      BEFORE UPDATE ON users             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_islands_updated_at    BEFORE UPDATE ON islands           FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_updated_at       BEFORE UPDATE ON quiz_questions    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON prompt_challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- INDEXES for performance
-- =============================================================
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_username ON users(tenant_id, username);
CREATE INDEX idx_islands_tenant ON islands(tenant_id, sort_order);
CREATE INDEX idx_island_progress_user ON island_progress(user_id);
CREATE INDEX idx_quiz_island ON quiz_questions(island_id, is_active, difficulty);
CREATE INDEX idx_prompt_island ON prompt_challenges(island_id, is_active);
CREATE INDEX idx_badges_tenant ON badges(tenant_id);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
