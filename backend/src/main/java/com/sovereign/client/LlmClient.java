package com.sovereign.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Advanced LLM client using OkHttp — supports ChatGPT structured JSON, Tool Calling, and standard prompts.
 */
@Component
public class LlmClient {

    private static final Logger log = LoggerFactory.getLogger(LlmClient.class);
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";
    private static final MediaType JSON_MEDIA = MediaType.parse("application/json; charset=utf-8");

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final int maxTokens;
    private final double temperature;

    public LlmClient(
            @Value("${app.openai.api-key}") String apiKey,
            @Value("${app.openai.model:gpt-4o-mini}") String model,
            @Value("${app.openai.max-tokens:500}") int maxTokens,
            @Value("${app.openai.temperature:0.3}") double temperature) {
        this.apiKey = apiKey;
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;
        this.objectMapper = new ObjectMapper();
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    /**
     * Internal generic method handler.
     */
    public JsonNode executeChat(List<Map<String, Object>> messages, boolean forceJson, List<Map<String, Object>> tools) {
        try {
            Map<String, Object> bodyObj = new HashMap<>();
            bodyObj.put("model", model);
            bodyObj.put("messages", messages);
            bodyObj.put("max_tokens", maxTokens);
            bodyObj.put("temperature", temperature);
            
            if (forceJson) {
                bodyObj.put("response_format", Map.of("type", "json_object"));
            }
            if (tools != null && !tools.isEmpty()) {
                bodyObj.put("tools", tools);
                bodyObj.put("tool_choice", "auto");
            }

            String requestBody = objectMapper.writeValueAsString(bodyObj);

            Request request = new Request.Builder()
                    .url(OPENAI_URL)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(requestBody, JSON_MEDIA))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    log.error("OpenAI API error: {} - {}", response.code(), response.message());
                    throw new RuntimeException("OpenAI API error: " + response.code() + " " + (response.body() != null ? response.body().string() : ""));
                }

                String responseBody = response.body() != null ? response.body().string() : "";
                return objectMapper.readTree(responseBody);
            }

        } catch (IOException e) {
            log.error("Failed to call OpenAI API", e);
            throw new RuntimeException("LLM API call failed", e);
        }
    }

    /**
     * Basic chat call
     */
    public String chat(String systemPrompt, String userMessage) {
        List<Map<String, Object>> msgs = List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userMessage)
        );
        JsonNode root = executeChat(msgs, false, null);
        return root.path("choices").path(0).path("message").path("content").asText("");
    }

    /**
     * Advanced chat with history / tools.
     * Use this for recursive tool-calling loop.
     */
    public JsonNode chatWithTools(List<Map<String, Object>> messages, List<Map<String, Object>> tools) {
        return executeChat(messages, false, tools);
    }

    /**
     * Chat returning forced JSON.
     */
    public JsonNode chatAsJson(String systemPrompt, String userMessage) {
        List<Map<String, Object>> msgs = List.of(
            Map.of("role", "system", "content", systemPrompt),
            Map.of("role", "user", "content", userMessage)
        );
        JsonNode root = executeChat(msgs, true, null);
        String content = root.path("choices").path(0).path("message").path("content").asText("");
        if (content.isEmpty()) {
            return objectMapper.createObjectNode();
        }
        try {
            return objectMapper.readTree(content);
        } catch (IOException e) {
            log.warn("Failed to parse fallback json string. returning empty.");
            return objectMapper.createObjectNode();
        }
    }
}
