package com.sovereign.listener;

import com.sovereign.dto.DashboardUpdate;
import com.sovereign.event.AnalyticsUpdatedEvent;
import com.sovereign.repository.ConversionEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Phase 5 — Async listener that pushes dashboard updates to WebSocket subscribers
 * when new conversion events are recorded.
 */
@Component
public class LiveDashboardListener {

    private static final Logger log = LoggerFactory.getLogger(LiveDashboardListener.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final ConversionEventRepository eventRepository;

    public LiveDashboardListener(SimpMessagingTemplate messagingTemplate,
                                 ConversionEventRepository eventRepository) {
        this.messagingTemplate = messagingTemplate;
        this.eventRepository = eventRepository;
    }

    @Async
    @EventListener
    public void handleAnalyticsUpdate(AnalyticsUpdatedEvent event) {
        UUID creatorId = event.getCreatorId();

        log.info("🔔 Dashboard update triggered for creator: {}", creatorId);

        // Build funnel data from the database
        Map<String, Long> funnelData = new LinkedHashMap<>();
        funnelData.put("IMPRESSION", eventRepository.countByCreatorIdAndEventType(creatorId, "IMPRESSION"));
        funnelData.put("CLICK", eventRepository.countByCreatorIdAndEventType(creatorId, "CLICK"));
        funnelData.put("LANDING_VIEW", eventRepository.countByCreatorIdAndEventType(creatorId, "LANDING_VIEW"));
        funnelData.put("SIGNUP", eventRepository.countByCreatorIdAndEventType(creatorId, "SIGNUP"));
        funnelData.put("PURCHASE", eventRepository.countByCreatorIdAndEventType(creatorId, "PURCHASE"));

        long totalEvents = funnelData.values().stream().mapToLong(Long::longValue).sum();

        DashboardUpdate update = new DashboardUpdate(
                creatorId, funnelData, totalEvents, event.getEventType()
        );

        // Push to WebSocket subscribers
        String destination = "/topic/dashboard/" + creatorId;
        messagingTemplate.convertAndSend(destination, update);

        log.info("📡 Dashboard update sent to {}", destination);
    }
}
