package com.sovereign.service;

import com.sovereign.dto.MatchResult;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Phase 6 — Sponsor Matchmaker using DB-native weighted ranking.
 */
@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    private final CreatorRepository creatorRepository;
    private final AiMatchService aiMatchService;

    public MatchingService(CreatorRepository creatorRepository, AiMatchService aiMatchService) {
        this.creatorRepository = creatorRepository;
        this.aiMatchService = aiMatchService;
    }

    /**
     * Find the top matched creators for a brand's industry.
     * Uses DB-native scoring: (conversion_rate * 0.5) + (avg_engagement_rate * 0.3)
     */
    public List<MatchResult> findMatches(String industry, int maxResults) {
        log.info("🔍 Finding top {} creator matches for industry: {}", maxResults, industry);

        List<Creator> topCreators = creatorRepository.findTopMatchesByIndustry(industry, maxResults);
        List<MatchResult> results = new ArrayList<>();

        for (Creator creator : topCreators) {
            double matchScore = creator.getConversionRate().doubleValue() * 0.5
                    + creator.getAvgEngagementRate().doubleValue() * 0.3;

            // Generate AI rationale for each match
            String rationale = aiMatchService.generateRationale(creator, industry);

            results.add(new MatchResult(
                    creator.getId(),
                    creator.getName(),
                    creator.getNiche(),
                    creator.getConversionRate(),
                    creator.getAvgEngagementRate(),
                    matchScore,
                    rationale
            ));
        }

        log.info("✅ Found {} matches for industry: {}", results.size(), industry);
        return results;
    }
}
