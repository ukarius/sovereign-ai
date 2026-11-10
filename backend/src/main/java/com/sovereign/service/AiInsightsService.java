package com.sovereign.service;

import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Phase 11 — AI-powered analytics insights service.
 * Reads pre-computed data from mv_funnel_analytics and generates
 * human-readable weekly strategy digests via the LLM.
 */
@Service
public class AiInsightsService {

    private static final Logger log = LoggerFactory.getLogger(AiInsightsService.class);

    @PersistenceContext
    private EntityManager entityManager;

    private final LlmClient llmClient;
    private final CreatorRepository creatorRepository;

    public AiInsightsService(LlmClient llmClient, CreatorRepository creatorRepository) {
        this.llmClient = llmClient;
        this.creatorRepository = creatorRepository;
    }

    /**
     * Retrieves materialized funnel data for a creator, then asks the LLM
     * to produce a plain-English weekly digest with strategic recommendations.
     */
    public Map<String, Object> generateWeeklyDigest(UUID creatorId) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));

        // Query the materialized view
        Map<String, Object> funnelData = fetchFunnelData(creatorId);

        if (funnelData.isEmpty()) {
            return Map.of(
                "creatorId", creatorId.toString(),
                "digest", "No analytics data available yet. Start sharing your content to generate insights!",
                "funnelData", Map.of()
            );
        }

        // Build context for the LLM
        String analyticsContext = String.format(
            "Creator: %s | Niche: %s\n" +
            "Impressions: %s | Clicks: %s | Landing Views: %s | Signups: %s | Purchases: %s\n" +
            "Overall Conversion Rate: %s%% | Click-to-Purchase: %s%%\n" +
            "Total Events: %s",
            creator.getName(),
            creator.getNiche() != null ? creator.getNiche() : "General",
            funnelData.getOrDefault("impressions", 0),
            funnelData.getOrDefault("clicks", 0),
            funnelData.getOrDefault("landingViews", 0),
            funnelData.getOrDefault("signups", 0),
            funnelData.getOrDefault("purchases", 0),
            funnelData.getOrDefault("conversionRatePct", 0),
            funnelData.getOrDefault("clickToPurchasePct", 0),
            funnelData.getOrDefault("totalEvents", 0)
        );

        String systemPrompt =
            "You are a senior growth strategist for content creators. " +
            "Analyze the following funnel analytics data and produce a concise Weekly Digest. " +
            "Identify exactly where the funnel is leaking (e.g., high impressions but low clicks means poor CTA copy). " +
            "Give 3 specific, actionable recommendations tailored to the creator's niche. " +
            "Use bullet points. Be direct and data-driven. Max 300 words.";

        String digest = llmClient.chat(systemPrompt, analyticsContext);

        log.info("📊 Generated weekly digest for creator: {}", creatorId);

        return Map.of(
            "creatorId", creatorId.toString(),
            "creatorName", creator.getName(),
            "funnelData", funnelData,
            "digest", digest
        );
    }

    /**
     * Fetches the pre-computed row from mv_funnel_analytics for a given Creator.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchFunnelData(UUID creatorId) {
        try {
            List<Object[]> results = entityManager.createNativeQuery(
                "SELECT impressions, clicks, landing_views, signups, purchases, " +
                "total_events, conversion_rate_pct, click_to_purchase_pct " +
                "FROM mv_funnel_analytics WHERE creator_id = :creatorId"
            ).setParameter("creatorId", creatorId).getResultList();

            if (results.isEmpty()) {
                return Map.of();
            }

            Object[] row = results.get(0);
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("impressions", row[0]);
            data.put("clicks", row[1]);
            data.put("landingViews", row[2]);
            data.put("signups", row[3]);
            data.put("purchases", row[4]);
            data.put("totalEvents", row[5]);
            data.put("conversionRatePct", row[6]);
            data.put("clickToPurchasePct", row[7]);
            return data;
        } catch (Exception e) {
            log.warn("⚠️ Failed to read mv_funnel_analytics — MV may not be populated yet: {}", e.getMessage());
            return Map.of();
        }
    }
}
