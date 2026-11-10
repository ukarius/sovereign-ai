package com.sovereign.service;

import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Phase 12 (Prompt 16) — Creator Outbound Pitch Generator.
 * Generates persuasive sales emails for creators to send to brands.
 */
@Service
public class AiPitchService {

    private static final Logger log = LoggerFactory.getLogger(AiPitchService.class);

    private final LlmClient llmClient;
    private final CreatorRepository creatorRepository;

    public AiPitchService(LlmClient llmClient, CreatorRepository creatorRepository) {
        this.llmClient = llmClient;
        this.creatorRepository = creatorRepository;
    }

    /**
     * Generates a 3-paragraph outbound sales email pitch from a creator to a brand.
     *
     * @param creatorId          The creator's UUID
     * @param brandName          The target brand name
     * @param brandIndustry      The target brand's industry
     * @param brandTargetDemo    The brand's target demographic
     * @param brandEmail         The brand's contact email (for mailto link)
     * @return PitchResult containing the generated email and mailto link
     */
    public PitchResult generatePitch(UUID creatorId, String brandName, String brandIndustry,
                                     String brandTargetDemo, String brandEmail) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));

        // Build metrics summary (top 3 metrics)
        String metricsSummary = String.format(
            "Conversion Rate: %s%% | Engagement Rate: %s%% | Monthly Revenue: $%s",
            creator.getConversionRate(),
            creator.getAvgEngagementRate(),
            creator.getMonthlyRevenue()
        );

        String systemPrompt = """
            You are an elite sales copywriter specializing in influencer marketing partnerships.
            Write a compelling, personalized 3-paragraph outbound sales email from a content creator to a brand.
            
            Structure:
            Paragraph 1: Hook — Catchy opening that shows you've done research on the brand
            Paragraph 2: Value — Present the creator's metrics and why their audience aligns with the brand
            Paragraph 3: CTA — Clear, low-friction call to action requesting a brief call or meeting
            
            Tone: Professional yet warm, confident but not arrogant. Avoid generic fluff.
            Keep total length under 250 words. No subject line needed.
            """;

        String userMessage = String.format("""
            Creator Profile:
            - Name: %s
            - Niche: %s
            - Top Platform: %s
            - Top 3 Metrics: %s
            
            Target Brand:
            - Brand Name: %s
            - Industry: %s
            - Target Demographic: %s
            """,
            creator.getName(),
            creator.getNiche(),
            creator.getTopPlatform(),
            metricsSummary,
            brandName,
            brandIndustry,
            brandTargetDemo
        );

        String emailBody = llmClient.chat(systemPrompt, userMessage);

        // Clean up the email body for mailto link (encode special characters)
        String encodedSubject = encodeUrlParam("Partnership Opportunity: " + creator.getName() + " x " + brandName);
        String encodedBody = encodeUrlParam(emailBody);

        String mailtoLink = String.format("mailto:%s?subject=%s&body=%s",
            brandEmail, encodedSubject, encodedBody);

        log.info("Generated outbound pitch for creator {} targeting brand {}", creatorId, brandName);

        return new PitchResult(emailBody, mailtoLink, creator.getName(), brandName);
    }

    private String encodeUrlParam(String value) {
        return value.replace("&", "%26")
                .replace("=", "%3D")
                .replace("?", "%3F")
                .replace(" ", "%20")
                .replace("\n", "%0A")
                .replace("\r", "")
                .replace("\"", "%22")
                .replace("'", "%27");
    }

    /**
     * DTO for pitch generation result.
     */
    public record PitchResult(
        String emailBody,
        String mailtoLink,
        String creatorName,
        String brandName
    ) {}
}
