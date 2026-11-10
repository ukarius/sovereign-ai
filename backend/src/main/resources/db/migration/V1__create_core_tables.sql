-- ══════════════════════════════════════════════════════════════
-- V1: Core tables — creators & brands
-- ══════════════════════════════════════════════════════════════

CREATE TABLE creators (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)   NOT NULL,
    email               VARCHAR(255)   NOT NULL UNIQUE,
    password_hash       VARCHAR(255)   NOT NULL,
    niche               VARCHAR(100),
    slug                VARCHAR(100)   UNIQUE,
    bio                 TEXT,
    conversion_rate     DECIMAL(5, 4)  DEFAULT 0.0,
    avg_engagement_rate DECIMAL(5, 4)  DEFAULT 0.0,
    top_platform        VARCHAR(50),
    monthly_revenue     DECIMAL(12, 2) DEFAULT 0.0,
    is_deleted          BOOLEAN        DEFAULT FALSE,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE brands (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)   NOT NULL,
    email               VARCHAR(255)   NOT NULL UNIQUE,
    password_hash       VARCHAR(255)   NOT NULL,
    industry            VARCHAR(100),
    budget              DECIMAL(12, 2) DEFAULT 0.0,
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_creators_email ON creators (email);
CREATE INDEX idx_creators_slug  ON creators (slug);
CREATE INDEX idx_creators_niche ON creators (niche);
CREATE INDEX idx_brands_email   ON brands (email);
