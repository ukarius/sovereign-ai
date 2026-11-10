package com.sovereign.controller;

import com.sovereign.service.ConversionEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/conversions")
public class ConversionController {

    private final ConversionEventService conversionEventService;

    public ConversionController(ConversionEventService conversionEventService) {
        this.conversionEventService = conversionEventService;
    }

    /**
     * Record a conversion event. Can be called from the frontend or webhooks.
     * This is a public endpoint so landing pages can track events without auth.
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> recordEvent(@RequestBody Map<String, String> body) {
        UUID creatorId = UUID.fromString(body.get("creatorId"));
        String eventType = body.get("eventType");
        String source = body.getOrDefault("source", "web");
        String metadata = body.getOrDefault("metadata", "{}");

        conversionEventService.recordEvent(creatorId, eventType, source, metadata);

        return ResponseEntity.ok(Map.of("status", "Event recorded"));
    }
}
