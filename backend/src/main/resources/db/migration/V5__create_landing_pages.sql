-- ══════════════════════════════════════════════════════════════
-- V5: Landing Pages table for A/B Testing Engine
-- Each Creator has one landing page with two headline variants
-- ══════════════════════════════════════════════════════════════

CREATE TABLE landing_pages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id          UUID           NOT NULL UNIQUE REFERENCES creators(id) ON DELETE CASCADE,
    variant_a_headline  VARCHAR(500)   NOT NULL DEFAULT 'Welcome to my page',
    variant_b_headline  VARCHAR(500)   NOT NULL DEFAULT 'Discover my content',
    variant_a_subtext   VARCHAR(1000),
    variant_b_subtext   VARCHAR(1000),
    visits_a            BIGINT         NOT NULL DEFAULT 0,
    visits_b            BIGINT         NOT NULL DEFAULT 0,
    conversions_a       BIGINT         NOT NULL DEFAULT 0,
    conversions_b       BIGINT         NOT NULL DEFAULT 0,
    is_test_active      BOOLEAN        NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_landing_page_creator ON landing_pages (creator_id);
