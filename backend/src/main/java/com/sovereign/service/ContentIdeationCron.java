package com.sovereign.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentIdeationCron {

    private static final Logger log = LoggerFactory.getLogger(ContentIdeationCron.class);

    private final CreatorRepository creatorRepository;
    private final LlmClient llmClient;

    public ContentIdeationCron(CreatorRepository creatorRepository, LlmClient llmClient) {
        this.creatorRepository = creatorRepository;
        this.llmClient = llmClient;
    }

    /**
     * Runs every Monday at 9:00 AM server time.
     * Generates a weekly content strategy for active creators.
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklyIdeation() {
        log.info("Starting Weekly Content Ideation Cron...");

        List<Creator> activeCreators = creatorRepository.findAll().stream()
                .filter(c -> c.getIsDeleted() == null || !c.getIsDeleted())
                .toList();

        for (Creator creator : activeCreators) {
            String sysPrompt = "You are a top-tier social media strategist. Generate 5 highly-engaging " +
                    "content ideas for a creator in the '" + creator.getNiche() + "' niche whose top platform is " +
                    creator.getTopPlatform() + ". Return exactly a JSON object mapping 'ideas' to an array of objects. " +
                    "Each idea object must contain strictly: { 'format': 'value', 'hook_line': 'value', 'potential': 'value' }.";

            try {
                // By forcing chatAsJson, we guarantee json_object response format
                JsonNode response = llmClient.chatAsJson(sysPrompt, "Generate my weekly strategy.");
                
                log.info("Generated ideation for creator {}: {}", creator.getId(), response.toString());
                
                // In a true system, we'd save this to `content_strategies` table.
            } catch (Exception e) {
                log.error("Failed to generate ideation for creator {}", creator.getId(), e);
            }
        }
    }
}
