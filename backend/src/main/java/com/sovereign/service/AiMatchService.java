package com.sovereign.service;

import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Phase 6 — Generates AI-powered rationale for why a creator matches a brand.
 */
@Service
public class AiMatchService {

    private static final Logger log = LoggerFactory.getLogger(AiMatchService.class);

    private final LlmClient llmClient;

    public AiMatchService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    /**
     * Generate a human-readable rationale explaining why this creator is a great match
     * for the given industry/brand.
     */
    public String generateRationale(Creator creator, String brandIndustry) {
        try {
            String systemPrompt = """
                    You are a brand partnership expert. Given a creator's profile and a brand's industry,
                    write a concise 2-3 sentence rationale explaining why this creator would be an excellent 
                    brand partner. Focus on audience alignment, engagement quality, and conversion potential.
                    """;

            String userMessage = String.format("""
                    Creator: %s
                    Niche: %s
                    Conversion Rate: %s
                    Engagement Rate: %s
                    Top Platform: %s
                    
                    Brand Industry: %s
                    """,
                    creator.getName(),
                    creator.getNiche(),
                    creator.getConversionRate(),
                    creator.getAvgEngagementRate(),
                    creator.getTopPlatform(),
                    brandIndustry
            );

            return llmClient.chat(systemPrompt, userMessage);
        } catch (Exception e) {
            log.warn("AI rationale generation failed for creator {}, using fallback", creator.getId(), e);
            return String.format("%s is a strong match for the %s industry with a %s conversion rate.",
                    creator.getName(), brandIndustry, creator.getConversionRate());
        }
    }
}
