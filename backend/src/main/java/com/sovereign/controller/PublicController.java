package com.sovereign.controller;

import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.service.LandingPageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public endpoints for the landing page / discovery funnel (no auth required).
 * Phase 11: Now includes server-side A/B variant routing.
 */
@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    private final CreatorRepository creatorRepository;
    private final LandingPageService landingPageService;

    public PublicController(CreatorRepository creatorRepository,
                            LandingPageService landingPageService) {
        this.creatorRepository = creatorRepository;
        this.landingPageService = landingPageService;
    }

    /**
     * Fetch a creator's public profile by slug for the landing page.
     * Phase 11: Now includes A/B variant data — the backend randomly selects
     * variant A or B and atomically tracks the visit. Frontend simply renders
     * whichever headline/subtext is returned.
     */
    @GetMapping("/creators/{slug}")
    public ResponseEntity<Map<String, Object>> getCreatorBySlug(@PathVariable String slug) {
        Creator creator = creatorRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", creator.getId());
        response.put("name", creator.getName());
        response.put("niche", creator.getNiche() != null ? creator.getNiche() : "");
        response.put("slug", creator.getSlug());
        response.put("bio", creator.getBio() != null ? creator.getBio() : "");

        // A/B variant injection — server decides which variant to show
        Map<String, Object> abVariant = landingPageService.resolveVariantForVisitor(slug);
        if (abVariant != null) {
            response.put("abTest", abVariant);
        }

        return ResponseEntity.ok(response);
    }
}
