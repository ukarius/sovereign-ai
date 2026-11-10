package com.sovereign.controller;

import com.sovereign.service.AiInsightsService;
import com.sovereign.service.LandingPageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Phase 11 — Landing Page A/B Testing & AI Insights Controller.
 * Authenticated endpoints for managing A/B tests and viewing AI analytics digests.
 */
@RestController
@RequestMapping("/api/v1/landing-pages")
public class LandingPageController {

    private final LandingPageService landingPageService;
    private final AiInsightsService aiInsightsService;

    public LandingPageController(LandingPageService landingPageService,
                                  AiInsightsService aiInsightsService) {
        this.landingPageService = landingPageService;
        this.aiInsightsService = aiInsightsService;
    }

    /**
     * Get the current landing page configuration and A/B test data.
     */
    @GetMapping("/{creatorId}")
    public ResponseEntity<Map<String, Object>> getLandingPage(@PathVariable UUID creatorId) {
        return ResponseEntity.ok(landingPageService.getLandingPageData(creatorId));
    }

    /**
     * AI Copywriter — regenerate both A/B headline variants using AI.
     * Resets visit counters for a fresh test cycle.
     */
    @PostMapping("/{creatorId}/regenerate-copy")
    public ResponseEntity<Map<String, Object>> regenerateCopy(@PathVariable UUID creatorId) {
        return ResponseEntity.ok(landingPageService.regenerateCopy(creatorId));
    }

    /**
     * A/B Analysis — calculate conversion rates and get AI-powered strategic analysis.
     */
    @GetMapping("/{creatorId}/analyse-ab")
    public ResponseEntity<Map<String, Object>> analyseAB(@PathVariable UUID creatorId) {
        return ResponseEntity.ok(landingPageService.analyseAB(creatorId));
    }

    /**
     * AI Weekly Digest — generate funnel insights from the materialized view.
     */
    @GetMapping("/{creatorId}/insights")
    public ResponseEntity<Map<String, Object>> getInsights(@PathVariable UUID creatorId) {
        return ResponseEntity.ok(aiInsightsService.generateWeeklyDigest(creatorId));
    }
}
