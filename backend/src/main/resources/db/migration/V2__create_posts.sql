-- ══════════════════════════════════════════════════════════════
-- V2: Posts table with AI tagging fields
-- ══════════════════════════════════════════════════════════════

CREATE TABLE posts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id            UUID           NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title                 VARCHAR(500)   NOT NULL,
    body                  TEXT,
    target_platforms      TEXT[],
    status                VARCHAR(20)    NOT NULL DEFAULT 'DRAFT',

    -- AI-generated tags
    ai_niche_tag          VARCHAR(100),
    ai_tone_tag           VARCHAR(100),
    ai_target_demographic VARCHAR(100),
    ai_content_pillar     VARCHAR(100),

    created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_creator  ON posts (creator_id);
CREATE INDEX idx_posts_status   ON posts (status);
