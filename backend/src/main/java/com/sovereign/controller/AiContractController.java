package com.sovereign.controller;

import com.sovereign.service.AiContractService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiContractController {

    private final AiContractService aiContractService;

    public AiContractController(AiContractService aiContractService) {
        this.aiContractService = aiContractService;
    }

    /**
     * POST /api/v1/ai/contract-clauses
     * Sends a deal_value and returns a structured JSON array of recommended contract clauses.
     */
    @PostMapping("/contract-clauses")
    public ResponseEntity<List<Map<String, String>>> generateContractClauses(@RequestBody Map<String, Double> payload) {
        Double dealValue = payload.get("deal_value");
        if (dealValue == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(aiContractService.generateContractClauses(dealValue));
    }

    /**
     * POST /api/v1/ai/convert-brief
     * Instruct the LLM to strip corporate jargon from brand text and output a creator-friendly brief.
     */
    @PostMapping("/convert-brief")
    public ResponseEntity<Map<String, String>> convertBrief(@RequestBody Map<String, String> payload) {
        String brandBrief = payload.get("brand_brief");
        if (brandBrief == null || brandBrief.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        String cleanBrief = aiContractService.convertBrief(brandBrief);
        return ResponseEntity.ok(Map.of("creator_brief", cleanBrief));
    }
}
