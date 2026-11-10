package com.sovereign.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sovereign.client.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Phase 12 (Prompt 15) — Automate marketplace negotiations and convert jargon to creator briefs.
 */
@Service
public class AiContractService {

    private static final Logger log = LoggerFactory.getLogger(AiContractService.class);

    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;

    public AiContractService(LlmClient llmClient, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Recommends contract clauses given a deal value.
     */
    public List<Map<String, String>> generateContractClauses(Double dealValue) {
        String systemPrompt = """
                You are a legal AI expert representing a creator. Given a prospective deal value, 
                generate a JSON object containing an array called 'clauses'. 
                Each clause must have a 'title' string and a 'description' string. 
                Focus on payment terms, usage rights, and exclusivity clauses matching the deal size.
                """;
        
        String userMessage = String.format("Deal value is: $%.2f", dealValue);

        try {
            com.fasterxml.jackson.databind.JsonNode jsonResponse = llmClient.chatAsJson(systemPrompt, userMessage);
            Map<String, Object> parsed = objectMapper.readValue(jsonResponse.toString(), new TypeReference<>() {});
            
            // In a real scenario we'd use a typed DTO rather than raw map casting
            @SuppressWarnings("unchecked")
            List<Map<String, String>> clauses = (List<Map<String, String>>) parsed.get("clauses");
            
            return clauses;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse AI contract clauses", e);
            throw new RuntimeException("Failed to generate clauses");
        }
    }

    /**
     * Translates corporate brand brief jargon into a creator-friendly summary.
     */
    public String convertBrief(String corporateBrief) {
        String systemPrompt = """
                You are a creator marketing translator. Take the complex corporate brand brief 
                provided by the user and rewrite it into a clear, concise, 'creator-friendly' brief.
                Strip away buzzwords. Focus on exactly what the creator needs to do, the core message, 
                and the immediate deliverables.
                """;

        return llmClient.chat(systemPrompt, corporateBrief);
    }
}
