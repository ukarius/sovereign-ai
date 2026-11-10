package com.sovereign.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Phase 11 — Scheduled cron to refresh the mv_funnel_analytics materialized view.
 * Uses CONCURRENTLY to avoid locking reads during refresh.
 * Fires every 5 minutes.
 */
@Component
public class AnalyticsRefreshCron {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsRefreshCron.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Refreshes the materialized view every 5 minutes.
     * CONCURRENTLY requires a UNIQUE INDEX (created in V4 migration).
     * Note: First refresh after app startup will populate from raw data.
     */
    @Scheduled(cron = "0 0/5 * * * *")
    @Transactional
    public void refreshFunnelAnalytics() {
        log.info("⏰ Refreshing mv_funnel_analytics materialized view...");
        try {
            entityManager.createNativeQuery("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_funnel_analytics").executeUpdate();
            log.info("✅ mv_funnel_analytics refreshed successfully.");
        } catch (Exception e) {
            // CONCURRENTLY fails if the MV has no data yet — fall back to non-concurrent
            log.warn("⚠️ Concurrent refresh failed, falling back to standard refresh: {}", e.getMessage());
            try {
                entityManager.createNativeQuery("REFRESH MATERIALIZED VIEW mv_funnel_analytics").executeUpdate();
                log.info("✅ mv_funnel_analytics refreshed (non-concurrent fallback).");
            } catch (Exception fallback) {
                log.error("❌ Materialized view refresh failed completely.", fallback);
            }
        }
    }
}
