-- ══════════════════════════════════════════════════════════════
-- V3: Conversion events table for analytics
-- ══════════════════════════════════════════════════════════════

CREATE TABLE conversion_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id        UUID           NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    event_type        VARCHAR(50)    NOT NULL,  -- IMPRESSION, CLICK, LANDING_VIEW, SIGNUP, PURCHASE
    source            VARCHAR(100),
    metadata          JSONB,
    created_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversion_creator ON conversion_events (creator_id);
CREATE INDEX idx_conversion_type    ON conversion_events (event_type);
CREATE INDEX idx_conversion_time    ON conversion_events (created_at);
