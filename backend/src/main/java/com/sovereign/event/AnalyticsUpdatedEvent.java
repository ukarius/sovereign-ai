package com.sovereign.event;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

/**
 * Phase 5 — Internal Spring event published when a new conversion event is recorded.
 */
public class AnalyticsUpdatedEvent extends ApplicationEvent {

    private final UUID creatorId;
    private final String eventType;

    public AnalyticsUpdatedEvent(Object source, UUID creatorId, String eventType) {
        super(source);
        this.creatorId = creatorId;
        this.eventType = eventType;
    }

    public UUID getCreatorId() { return creatorId; }
    public String getEventType() { return eventType; }
}
