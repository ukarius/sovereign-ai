package com.sovereign.controller;

import com.sovereign.dto.MatchResult;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.service.AiMatchService;
import com.sovereign.service.MatchingService;
import com.sovereign.service.PdfGeneratorService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

    private final MatchingService matchingService;
    private final CreatorRepository creatorRepository;
    private final AiMatchService aiMatchService;
    private final PdfGeneratorService pdfGeneratorService;

    public MatchController(MatchingService matchingService, CreatorRepository creatorRepository,
                           AiMatchService aiMatchService, PdfGeneratorService pdfGeneratorService) {
        this.matchingService = matchingService;
        this.creatorRepository = creatorRepository;
        this.aiMatchService = aiMatchService;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    /**
     * Find top creator matches for a brand's industry.
     * GET /api/v1/matches?industry=fitness&limit=10
     */
    @GetMapping
    public ResponseEntity<List<MatchResult>> findMatches(
            @RequestParam String industry,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(matchingService.findMatches(industry, limit));
    }

    /**
     * Generate an AI-powered PDF pitch deck for a specified creator and brand industry.
     */
    @GetMapping("/{creatorId}/pitch-pdf")
    public ResponseEntity<byte[]> generatePitchPdf(
            @PathVariable UUID creatorId,
            @RequestParam String industry) {

        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Creator not found"));

        String aiRationale = aiMatchService.generateRationale(creator, industry);
        byte[] pdfBytes = pdfGeneratorService.generatePitchPdf(creator, industry, aiRationale);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "pitch-" + creator.getSlug() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
