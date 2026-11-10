package com.sovereign.dto;

import java.util.Map;
import java.util.UUID;

/**
 * WebSocket payload pushed to /topic/dashboard/{creatorId}.
 */
public class DashboardUpdate {

    private UUID creatorId;
    private Map<String, Long> funnelData;
    private long totalEvents;
    private String latestEventType;

    public DashboardUpdate() {}

    public DashboardUpdate(UUID creatorId, Map<String, Long> funnelData, long totalEvents, String latestEventType) {
        this.creatorId = creatorId;
        this.funnelData = funnelData;
        this.totalEvents = totalEvents;
        this.latestEventType = latestEventType;
    }

    // ───── Getters & Setters ─────

    public UUID getCreatorId() { return creatorId; }
    public void setCreatorId(UUID creatorId) { this.creatorId = creatorId; }

    public Map<String, Long> getFunnelData() { return funnelData; }
    public void setFunnelData(Map<String, Long> funnelData) { this.funnelData = funnelData; }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public String getLatestEventType() { return latestEventType; }
    public void setLatestEventType(String latestEventType) { this.latestEventType = latestEventType; }
}
