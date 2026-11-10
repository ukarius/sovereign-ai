-- ══════════════════════════════════════════════════════════════
-- V4: Materialized View — Pre-computed funnel analytics per Creator
-- Enables non-blocking concurrent refresh via UNIQUE INDEX
-- ══════════════════════════════════════════════════════════════

CREATE MATERIALIZED VIEW mv_funnel_analytics AS
SELECT
    ce.creator_id,
    COUNT(*) FILTER (WHERE ce.event_type = 'IMPRESSION')   AS impressions,
    COUNT(*) FILTER (WHERE ce.event_type = 'CLICK')         AS clicks,
    COUNT(*) FILTER (WHERE ce.event_type = 'LANDING_VIEW')  AS landing_views,
    COUNT(*) FILTER (WHERE ce.event_type = 'SIGNUP')        AS signups,
    COUNT(*) FILTER (WHERE ce.event_type = 'PURCHASE')      AS purchases,
    COUNT(*)                                                 AS total_events,
    ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE ce.event_type = 'IMPRESSION') > 0
            THEN (COUNT(*) FILTER (WHERE ce.event_type = 'PURCHASE')::NUMERIC /
                  COUNT(*) FILTER (WHERE ce.event_type = 'IMPRESSION')::NUMERIC) * 100
            ELSE 0
        END, 4
    ) AS conversion_rate_pct,
    ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE ce.event_type = 'CLICK') > 0
            THEN (COUNT(*) FILTER (WHERE ce.event_type = 'PURCHASE')::NUMERIC /
                  COUNT(*) FILTER (WHERE ce.event_type = 'CLICK')::NUMERIC) * 100
            ELSE 0
        END, 4
    ) AS click_to_purchase_pct,
    MAX(ce.created_at) AS last_event_at
FROM conversion_events ce
GROUP BY ce.creator_id;

-- UNIQUE INDEX enables REFRESH MATERIALIZED VIEW CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_funnel_creator ON mv_funnel_analytics (creator_id);
