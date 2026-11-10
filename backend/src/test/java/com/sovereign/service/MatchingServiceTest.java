package com.sovereign.service;

import com.sovereign.dto.MatchResult;
import com.sovereign.entity.Creator;
import com.sovereign.repository.CreatorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Phase 13 (Prompt 21) — Unit test for MatchingService.
 * Asserts that the mathematical weighting (conversion_rate * 0.5) + (avg_engagement_rate * 0.3)
 * correctly orders the MatchResult DTOs.
 */
@ExtendWith(MockitoExtension.class)
class MatchingServiceTest {

    @Mock
    private CreatorRepository creatorRepository;

    @Mock
    private AiMatchService aiMatchService;

    @InjectMocks
    private MatchingService matchingService;

    private Creator creatorHighConversion;
    private Creator creatorHighEngagement;
    private Creator creatorBalanced;

    @BeforeEach
    void setUp() {
        // Create test creators with different metric profiles
        creatorHighConversion = createCreator(
            "High Conversion Creator",
            new BigDecimal("0.0500"),  // 5% conversion
            new BigDecimal("0.0100")  // 1% engagement
        );

        creatorHighEngagement = createCreator(
            "High Engagement Creator",
            new BigDecimal("0.0100"),  // 1% conversion
            new BigDecimal("0.0800")   // 8% engagement
        );

        creatorBalanced = createCreator(
            "Balanced Creator",
            new BigDecimal("0.0300"),  // 3% conversion
            new BigDecimal("0.0400")   // 4% engagement
        );
    }

    private Creator createCreator(String name, BigDecimal conversionRate, BigDecimal engagementRate) {
        Creator creator = new Creator();
        creator.setId(UUID.randomUUID());
        creator.setName(name);
        creator.setEmail(name.toLowerCase().replace(" ", "-") + "@test.com");
        creator.setNiche("Fitness");
        creator.setConversionRate(conversionRate);
        creator.setAvgEngagementRate(engagementRate);
        creator.setTopPlatform("Instagram");
        return creator;
    }

    @Test
    void testWeightingFormula_CalculatesCorrectly() {
        // Given: Repository returns creators in arbitrary order
        when(creatorRepository.findTopMatchesByIndustry(anyString(), anyInt()))
            .thenReturn(Arrays.asList(creatorHighEngagement, creatorHighConversion, creatorBalanced));

        when(aiMatchService.generateRationale(org.mockito.ArgumentMatchers.any(Creator.class), anyString()))
            .thenReturn("AI-generated rationale for testing");

        // When: Finding matches
        List<MatchResult> results = matchingService.findMatches("Fitness", 3);

        // Then: Results are sorted by (conversion * 0.5) + (engagement * 0.3)
        // Calculations:
        // creatorHighConversion: (0.05 * 0.5) + (0.01 * 0.3) = 0.025 + 0.003 = 0.028
        // creatorHighEngagement: (0.01 * 0.5) + (0.08 * 0.3) = 0.005 + 0.024 = 0.029
        // creatorBalanced: (0.03 * 0.5) + (0.04 * 0.3) = 0.015 + 0.012 = 0.027

        assertThat(results).hasSize(3);

        // Verify descending order (highest score first)
        // Expected order: creatorHighEngagement (0.029) > creatorHighConversion (0.028) > creatorBalanced (0.027)
        assertThat(results.get(0).getCreatorName()).isEqualTo("High Engagement Creator");
        assertThat(results.get(1).getCreatorName()).isEqualTo("High Conversion Creator");
        assertThat(results.get(2).getCreatorName()).isEqualTo("Balanced Creator");

        // Verify scores are calculated correctly
        assertThat(results.get(0).getMatchScore()).isEqualTo(0.029);
        assertThat(results.get(1).getMatchScore()).isEqualTo(0.028);
        assertThat(results.get(2).getMatchScore()).isEqualTo(0.027);
    }

    @Test
    void testWeightingFormula_EmptyList() {
        // Given: No creators match
        when(creatorRepository.findTopMatchesByIndustry(anyString(), anyInt()))
            .thenReturn(Collections.emptyList());

        // When: Finding matches
        List<MatchResult> results = matchingService.findMatches("UnknownIndustry", 10);

        // Then: Empty list returned
        assertThat(results).isEmpty();
    }

    @Test
    void testWeightingFormula_SingleCreator() {
        // Given: Only one creator
        when(creatorRepository.findTopMatchesByIndustry(anyString(), anyInt()))
            .thenReturn(Collections.singletonList(creatorBalanced));

        when(aiMatchService.generateRationale(org.mockito.ArgumentMatchers.any(Creator.class), anyString()))
            .thenReturn("Single creator rationale");

        // When: Finding matches
        List<MatchResult> results = matchingService.findMatches("Fitness", 10);

        // Then: Single result with correct score
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getCreatorName()).isEqualTo("Balanced Creator");
        assertThat(results.get(0).getMatchScore()).isEqualTo(0.027);
    }
}
