package com.sovereign.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sovereign.client.LlmClient;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.repository.ConversionEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiChatService {

    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);

    private final LlmClient llmClient;
    private final CreatorRepository creatorRepository;
    private final ConversionEventRepository conversionEventRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public AiChatService(LlmClient llmClient,
                         CreatorRepository creatorRepository,
                         ConversionEventRepository conversionEventRepository) {
        this.llmClient = llmClient;
        this.creatorRepository = creatorRepository;
        this.conversionEventRepository = conversionEventRepository;
    }

    private List<Map<String, Object>> getSupportedTools() {
        return List.of(
            Map.of(
                "type", "function",
                "function", Map.of(
                    "name", "get_funnel_metrics",
                    "description", "Get the live conversion funnel metrics for the creator.",
                    "parameters", Map.of(
                        "type", "object",
                        "properties", Collections.emptyMap()
                    )
                )
            ),
            Map.of(
                "type", "function",
                "function", Map.of(
                    "name", "get_active_contracts",
                    "description", "Get a list of active brand contracts for the creator.",
                    "parameters", Map.of(
                        "type", "object",
                        "properties", Collections.emptyMap()
                    )
                )
            )
        );
    }

    private String getFunnelMetrics(UUID creatorId) {
        long impressions = conversionEventRepository.countByCreatorIdAndEventType(creatorId, "IMPRESSION");
        long clicks = conversionEventRepository.countByCreatorIdAndEventType(creatorId, "CLICK");
        long purchases = conversionEventRepository.countByCreatorIdAndEventType(creatorId, "PURCHASE");
        return String.format("{\"IMPRESSIONS\": %d, \"CLICKS\": %d, \"PURCHASES\": %d}", impressions, clicks, purchases);
    }

    private String getActiveContracts() {
        return "[{\"brand\": \"Nike\", \"value\": 15000, \"status\": \"ACTIVE\"}, {\"brand\": \"Sony\", \"value\": 8000, \"status\": \"NEGOTIATION\"}]";
    }

    public String chat(UUID creatorId, String userMessage) {
        Creator creator = creatorRepository.findById(creatorId).orElseThrow();
        String sysPrompt = String.format("You are Sovereign AI, assistant to %s. Use tools to look up data when requested.", creator.getName());

        List<Map<String, Object>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", sysPrompt));
        messages.add(Map.of("role", "user", "content", userMessage));

        for (int i = 0; i < 5; i++) { // Max 5 turns
            JsonNode root = llmClient.chatWithTools(messages, getSupportedTools());
            JsonNode choice = root.path("choices").path(0);
            JsonNode messageNode = choice.path("message");
            String finishReason = choice.path("finish_reason").asText();

            if ("tool_calls".equals(finishReason)) {
                Map<String, Object> assistantMessage = new HashMap<>();
                assistantMessage.put("role", "assistant");
                if (!messageNode.path("content").isMissingNode() && !messageNode.path("content").isNull()) {
                    assistantMessage.put("content", messageNode.path("content").asText());
                }
                
                try {
                    // Pass the tool_calls exactly as received
                    assistantMessage.put("tool_calls", mapper.treeToValue(messageNode.path("tool_calls"), List.class));
                } catch (Exception e) {
                    log.error("Failed to map tool_calls", e);
                }
                
                messages.add(assistantMessage);

                // Execute each tool
                JsonNode toolCalls = messageNode.path("tool_calls");
                for (JsonNode toolCall : toolCalls) {
                    String toolCallId = toolCall.path("id").asText();
                    String functionName = toolCall.path("function").path("name").asText();
                    
                    String toolResult = "";
                    if ("get_funnel_metrics".equals(functionName)) {
                        toolResult = getFunnelMetrics(creatorId);
                    } else if ("get_active_contracts".equals(functionName)) {
                        toolResult = getActiveContracts();
                    } else {
                        toolResult = "{\"error\": \"unknown function\"}";
                    }

                    messages.add(Map.of(
                        "role", "tool",
                        "tool_call_id", toolCallId,
                        "name", functionName,
                        "content", toolResult
                    ));
                }
            } else {
                return messageNode.path("content").asText();
            }
        }
        return "Sorry, I took too many turns thinking about that.";
    }
}
