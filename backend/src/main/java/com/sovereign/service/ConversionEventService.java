package com.sovereign.service;

import com.sovereign.entity.ConversionEvent;
import com.sovereign.entity.Creator;
import com.sovereign.event.AnalyticsUpdatedEvent;
import com.sovereign.repository.ConversionEventRepository;
import com.sovereign.repository.CreatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Phase 5 — Records conversion events and publishes internal Spring events
 * for the live dashboard WebSocket listener.
 */
@Service
public class ConversionEventService {

    private static final Logger log = LoggerFactory.getLogger(ConversionEventService.class);

    private final ConversionEventRepository eventRepository;
    private final CreatorRepository creatorRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ConversionEventService(ConversionEventRepository eventRepository,
                                  CreatorRepository creatorRepository,
                                  ApplicationEventPublisher eventPublisher) {
        this.eventRepository = eventRepository;
        this.creatorRepository = creatorRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Record a conversion event and trigger a dashboard update via ApplicationEvent.
     */
    public ConversionEvent recordEvent(UUID creatorId, String eventType, String source, String metadata) {
        Creator creator = creatorRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Creator not found: " + creatorId));

        ConversionEvent event = new ConversionEvent();
        event.setCreator(creator);
        event.setEventType(eventType);
        event.setSource(source);
        event.setMetadata(metadata);

        event = eventRepository.save(event);
        log.info("📊 Conversion event recorded: type={}, creator={}", eventType, creatorId);

        // Publish internal event — LiveDashboardListener picks this up
        eventPublisher.publishEvent(new AnalyticsUpdatedEvent(this, creatorId, eventType));

        return event;
    }
}
