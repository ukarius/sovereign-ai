package com.sovereign.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import com.sovereign.entity.LandingPage;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.repository.LandingPageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Phase 11 — AI Copywriter & A/B Testing Analysis Engine.
 * - Generates high-converting Link-in-Bio headlines using the LLM.
 * - Analyses A/B test results with statistical reasoning via the LLM.
 */
@Service
public class LandingPageService {

    private static final Logger log = LoggerFactory.getLogger(LandingPageService.class);

    private final LandingPageRepository landingPageRepository;
    private final CreatorRepository creatorRepository;
    private final LlmClient llmClient;

    public LandingPageService(LandingPageRepository landingPageRepository,
                              CreatorRepository creatorRepository,
                              LlmClient llmClient) {
        this.landingPageRepository = landingPageRepository;
        this.creatorRepository = creatorRepository;
        this.llmClient = llmClient;
    }

    /**
     * Get or create the landing page for a creator.
     */
    @Transactional
    public LandingPage getOrCreateLandingPage(UUID creatorId) {
        return landingPageRepository.findByCreatorId(creatorId)
                .orElseGet(() -> {
                    Creator creator = creatorRepository.findById(creatorId)
                            .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));
                    LandingPage page = new LandingPage();
                    page.setCreator(creator);
                    return landingPageRepository.save(page);
                });
    }

    /**
     * Fetch the landing page data as a response map.
     */
    public Map<String, Object> getLandingPageData(UUID creatorId) {
        LandingPage page = getOrCreateLandingPage(creatorId);
        return buildResponse(page);
    }

    /**
     * AI Copywriter — Regenerates both A/B headline variants using LLM,
     * optimized around the creator's specific niche.
     * Resets visit/conversion counters for a fresh test.
     */
    @Transactional
    public Map<String, Object> regenerateCopy(UUID creatorId) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));

        LandingPage page = getOrCreateLandingPage(creatorId);

        String niche = creator.getNiche() != null ? creator.getNiche() : "general content creation";

        String systemPrompt =
            "You are a world-class conversion copywriter specializing in Link-in-Bio landing pages. " +
            "Generate TWO distinct headline variants (A and B) for a creator's landing page. " +
            "Each variant should have a headline (max 60 chars) and a subtext (max 150 chars). " +
            "Optimize for high click-through and signups. " +
            "Respond in strict JSON format: {\"variant_a_headline\": \"...\", \"variant_a_subtext\": \"...\", \"variant_b_headline\": \"...\", \"variant_b_subtext\": \"...\"}";

        String userMessage = String.format(
            "Creator: %s\nNiche: %s\nBio: %s\n\nGenerate two high-converting headline variants for their Link-in-Bio page.",
            creator.getName(),
            niche,
            creator.getBio() != null ? creator.getBio() : "A passionate content creator"
        );

        JsonNode result = llmClient.chatAsJson(systemPrompt, userMessage);

        // Apply the AI-generated copy
        page.setVariantAHeadline(result.path("variant_a_headline").asText(page.getVariantAHeadline()));
        page.setVariantBHeadline(result.path("variant_b_headline").asText(page.getVariantBHeadline()));
        page.setVariantASubtext(result.path("variant_a_subtext").asText(page.getVariantASubtext()));
        page.setVariantBSubtext(result.path("variant_b_subtext").asText(page.getVariantBSubtext()));

        // Reset counters for a fresh A/B test
        page.setVisitsA(0L);
        page.setVisitsB(0L);
        page.setConversionsA(0L);
        page.setConversionsB(0L);
        page.setIsTestActive(true);

        landingPageRepository.save(page);
        log.info("✍️ AI copy regenerated for creator: {}", creatorId);

        return buildResponse(page);
    }

    /**
     * A/B Analysis Engine — Calculates conversion rates for both variants
     * and defers to the LLM for strategic analysis determining the champion.
     */
    public Map<String, Object> analyseAB(UUID creatorId) {
        LandingPage page = getOrCreateLandingPage(creatorId);

        long totalVisits = page.getVisitsA() + page.getVisitsB();
        if (totalVisits < 10) {
            return Map.of(
                "creatorId", creatorId.toString(),
                "analysis", "Insufficient data — need at least 10 visits total to run a meaningful A/B analysis. Current visits: " + totalVisits,
                "recommendation", "CONTINUE_TESTING",
                "landingPage", buildResponse(page)
            );
        }

        double convRateA = page.getVisitsA() > 0
                ? (double) page.getConversionsA() / page.getVisitsA() * 100 : 0;
        double convRateB = page.getVisitsB() > 0
                ? (double) page.getConversionsB() / page.getVisitsB() * 100 : 0;

        // Prepare statistical summary for LLM
        String statsContext = String.format(
            "A/B Test Results:\n" +
            "─────────────────────────────────\n" +
            "VARIANT A: \"%s\"\n" +
            "  Visits: %d | Conversions: %d | Conv Rate: %.2f%%\n\n" +
            "VARIANT B: \"%s\"\n" +
            "  Visits: %d | Conversions: %d | Conv Rate: %.2f%%\n" +
            "─────────────────────────────────\n" +
            "Total visits: %d | Sample size adequate: %s",
            page.getVariantAHeadline(),
            page.getVisitsA(), page.getConversionsA(), convRateA,
            page.getVariantBHeadline(),
            page.getVisitsB(), page.getConversionsB(), convRateB,
            totalVisits,
            totalVisits >= 100 ? "Yes" : "Need more data for high confidence"
        );

        String systemPrompt =
            "You are a data scientist specializing in A/B testing and conversion rate optimization. " +
            "Analyze the following A/B test results. Consider statistical significance and sample size. " +
            "Determine the champion variant (A or B), explain the reasoning, and provide specific " +
            "recommendations for the next test iteration. Be concise and data-driven. Max 200 words.";

        String analysis = llmClient.chat(systemPrompt, statsContext);

        // Determine simple winner
        String winner = convRateA >= convRateB ? "VARIANT_A" : "VARIANT_B";
        if (Math.abs(convRateA - convRateB) < 1.0 && totalVisits < 100) {
            winner = "INCONCLUSIVE";
        }

        log.info("🔬 A/B analysis complete for creator: {} — Winner: {}", creatorId, winner);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("creatorId", creatorId.toString());
        response.put("winner", winner);
        response.put("variantAConvRate", String.format("%.2f%%", convRateA));
        response.put("variantBConvRate", String.format("%.2f%%", convRateB));
        response.put("analysis", analysis);
        response.put("landingPage", buildResponse(page));
        return response;
    }

    /**
     * Server-side A/B routing — returns the appropriate variant for a public visitor.
     * Uses random 50/50 split and atomically increments the visit counter.
     */
    @Transactional
    public Map<String, Object> resolveVariantForVisitor(String slug) {
        LandingPage page = landingPageRepository.findByCreatorSlug(slug)
                .orElse(null);

        if (page == null) {
            return null; // No landing page configured — caller handles fallback
        }

        // 50/50 random split
        boolean showVariantA = Math.random() < 0.5;

        if (page.getIsTestActive()) {
            if (showVariantA) {
                landingPageRepository.incrementVisitsA(page.getId());
            } else {
                landingPageRepository.incrementVisitsB(page.getId());
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("variant", showVariantA ? "A" : "B");
        result.put("headline", showVariantA ? page.getVariantAHeadline() : page.getVariantBHeadline());
        result.put("subtext", showVariantA ? page.getVariantASubtext() : page.getVariantBSubtext());
        result.put("isTestActive", page.getIsTestActive());
        return result;
    }

    private Map<String, Object> buildResponse(LandingPage page) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", page.getId().toString());
        map.put("variantAHeadline", page.getVariantAHeadline());
        map.put("variantBHeadline", page.getVariantBHeadline());
        map.put("variantASubtext", page.getVariantASubtext());
        map.put("variantBSubtext", page.getVariantBSubtext());
        map.put("visitsA", page.getVisitsA());
        map.put("visitsB", page.getVisitsB());
        map.put("conversionsA", page.getConversionsA());
        map.put("conversionsB", page.getConversionsB());
        map.put("isTestActive", page.getIsTestActive());
        return map;
    }
}
