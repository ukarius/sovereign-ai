package com.sovereign.service;

import com.sovereign.repository.ConversionEventRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AiSchedulerService {

    private final ConversionEventRepository conversionEventRepository;

    public AiSchedulerService(ConversionEventRepository conversionEventRepository) {
        this.conversionEventRepository = conversionEventRepository;
    }

    /**
     * Calculates a sliding window average of the best posting hour over the last 90 days.
     * Uses DB-native aggregations for performance.
     * Starts at 0 (Midnight), ends at 23 (11 PM).
     */
    public int getBestPostingHour(UUID creatorId) {
        Integer bestHour = conversionEventRepository.findBestPostingHourNative(creatorId);
        // Default to 18 (6 PM) if no historical conversions data is available
        return bestHour != null ? bestHour : 18;
    }
}
