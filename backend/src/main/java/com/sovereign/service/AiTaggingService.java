package com.sovereign.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sovereign.client.LlmClient;
import com.sovereign.entity.Post;
import com.sovereign.repository.PostRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Phase 2 — AI Content Tagging with Resilience4j Circuit Breaker and Retry.
 * Runs asynchronously to avoid blocking the ingestion pipeline.
 */
@Service
public class AiTaggingService {

    private static final Logger log = LoggerFactory.getLogger(AiTaggingService.class);

    private final PostRepository postRepository;
    private final LlmClient llmClient;

    public AiTaggingService(PostRepository postRepository, LlmClient llmClient) {
        this.postRepository = postRepository;
        this.llmClient = llmClient;
    }

    /**
     * Asynchronously tag a post with AI-generated metadata.
     * Uses circuit breaker to prevent cascading failures from OpenAI outages.
     */
    @Async
    @CircuitBreaker(name = "aiTagging", fallbackMethod = "tagPostFallback")
    @Retry(name = "aiTagging")
    public void tagPost(UUID postId) {
        log.info("Starting AI tagging for post: {}", postId);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        String systemPrompt = """
                You are a content analysis AI. Analyze the given content and return a JSON object with exactly these keys:
                - niche_tag: The content niche (e.g., "fitness", "tech", "beauty", "finance", "travel")
                - tone_tag: The tone of the content (e.g., "educational", "entertaining", "inspirational", "casual", "professional")
                - target_demographic: The target audience (e.g., "18-24 college students", "30-45 professionals", "25-35 health enthusiasts")
                - content_pillar: The content pillar category (e.g., "how-to", "listicle", "case-study", "review", "personal-story")
                
                Return ONLY valid JSON, no markdown formatting.
                """;

        String userMessage = String.format("Title: %s\n\nBody: %s", post.getTitle(), post.getBody());

        JsonNode tags = llmClient.chatAsJson(systemPrompt, userMessage);

        post.setAiNicheTag(tags.path("niche_tag").asText("UNTAGGED"));
        post.setAiToneTag(tags.path("tone_tag").asText("UNTAGGED"));
        post.setAiTargetDemographic(tags.path("target_demographic").asText("UNTAGGED"));
        post.setAiContentPillar(tags.path("content_pillar").asText("UNTAGGED"));

        postRepository.save(post);
        log.info("AI tagging complete for post: {} — niche={}, tone={}", postId, post.getAiNicheTag(), post.getAiToneTag());
    }

    /**
     * Fallback when the circuit breaker is open or retries exhausted.
     * Sets all tags to "UNTAGGED" so the pipeline continues.
     */
    @SuppressWarnings("unused")
    private void tagPostFallback(UUID postId, Throwable t) {
        log.warn("AI tagging fallback triggered for post: {} — reason: {}", postId, t.getMessage());

        postRepository.findById(postId).ifPresent(post -> {
            post.setAiNicheTag("UNTAGGED");
            post.setAiToneTag("UNTAGGED");
            post.setAiTargetDemographic("UNTAGGED");
            post.setAiContentPillar("UNTAGGED");
            postRepository.save(post);
        });
    }
}
