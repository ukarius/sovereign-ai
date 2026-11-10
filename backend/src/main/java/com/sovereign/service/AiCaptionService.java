package com.sovereign.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.sovereign.client.LlmClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiCaptionService {

    private final LlmClient llmClient;

    public AiCaptionService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    /**
     * Generates platform-specific captions for a given piece of content.
     * Retruns a map of platform (e.g., "linkedin", "instagram") to caption text.
     */
    public Map<String, String> generateCaptions(String content, String[] platforms) {
        String sysPrompt = "You are an expert social media copywriter. Generate tailored captions " +
                "for the content provided for the following platforms: " + String.join(", ", platforms) + ". " +
                "For LinkedIn, use a professional, insightful tone. For Instagram, use a casual, highly-engaging tone with emojis. " +
                "For X/Twitter, use brief, snappy hooks. " +
                "Return strictly valid JSON where keys are the platform names directly (lowercase) and values are the generated captions.";

        JsonNode responseNode = llmClient.chatAsJson(sysPrompt, content);

        Map<String, String> captions = new HashMap<>();
        if (responseNode.isObject()) {
            responseNode.fieldNames().forEachRemaining(key -> {
                captions.put(key, responseNode.get(key).asText());
            });
        }
        return captions;
    }
}
