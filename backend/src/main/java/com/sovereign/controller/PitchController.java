package com.sovereign.controller;

import com.sovereign.service.AiPitchService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Phase 12 (Prompt 16) — Outbound Pitch Generator Controller.
 * Endpoint for creators to generate AI-powered pitch emails to brands.
 */
@RestController
@RequestMapping("/api/v1/ai")
public class PitchController {

    private final AiPitchService aiPitchService;

    public PitchController(AiPitchService aiPitchService) {
        this.aiPitchService = aiPitchService;
    }

    /**
     * POST /api/v1/ai/generate-pitch
     * Generates a persuasive outbound sales email for a creator to send to a brand.
     *
     * Request Body:
     * - brandName: String
     * - brandIndustry: String
     * - brandTargetDemo: String
     * - brandEmail: String
     * - creatorId: UUID (optional, extracted from JWT if not provided)
     */
    @PostMapping("/generate-pitch")
    public ResponseEntity<Map<String, Object>> generatePitch(
            @Valid @RequestBody PitchRequest request,
            Authentication auth) {

        // Extract creatorId from JWT if not provided in request
        UUID creatorId = request.creatorId() != null
                ? request.creatorId()
                : extractCreatorIdFromAuth(auth);

        AiPitchService.PitchResult result = aiPitchService.generatePitch(
                creatorId,
                request.brandName(),
                request.brandIndustry(),
                request.brandTargetDemo(),
                request.brandEmail()
        );

        return ResponseEntity.ok(Map.of(
                "emailBody", result.emailBody(),
                "mailtoLink", result.mailtoLink(),
                "creatorName", result.creatorName(),
                "brandName", result.brandName(),
                "message", "Pitch generated successfully. Click the mailto link to open your email client."
        ));
    }

    private UUID extractCreatorIdFromAuth(Authentication auth) {
        // The JWT subject is the email; we'd need to look up the creator
        // For now, this is a placeholder that should be implemented based on your auth structure
        throw new UnsupportedOperationException(
            "Creator ID must be provided in request body when not deducible from authentication context"
        );
    }

    /**
     * Request DTO for pitch generation.
     */
    public record PitchRequest(
        String brandName,
        String brandIndustry,
        String brandTargetDemo,
        String brandEmail,
        UUID creatorId
    ) {}
}
