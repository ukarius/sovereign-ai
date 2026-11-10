package com.sovereign.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Phase 6 — Match result returned from the Sponsor Matchmaker engine.
 */
public class MatchResult {

    private UUID creatorId;
    private String creatorName;
    private String niche;
    private BigDecimal conversionRate;
    private BigDecimal engagementRate;
    private double matchScore;
    private String aiRationale;

    public MatchResult() {}

    public MatchResult(UUID creatorId, String creatorName, String niche,
                       BigDecimal conversionRate, BigDecimal engagementRate,
                       double matchScore, String aiRationale) {
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.niche = niche;
        this.conversionRate = conversionRate;
        this.engagementRate = engagementRate;
        this.matchScore = matchScore;
        this.aiRationale = aiRationale;
    }

    // ───── Getters & Setters ─────

    public UUID getCreatorId() { return creatorId; }
    public void setCreatorId(UUID creatorId) { this.creatorId = creatorId; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public String getNiche() { return niche; }
    public void setNiche(String niche) { this.niche = niche; }

    public BigDecimal getConversionRate() { return conversionRate; }
    public void setConversionRate(BigDecimal conversionRate) { this.conversionRate = conversionRate; }

    public BigDecimal getEngagementRate() { return engagementRate; }
    public void setEngagementRate(BigDecimal engagementRate) { this.engagementRate = engagementRate; }

    public double getMatchScore() { return matchScore; }
    public void setMatchScore(double matchScore) { this.matchScore = matchScore; }

    public String getAiRationale() { return aiRationale; }
    public void setAiRationale(String aiRationale) { this.aiRationale = aiRationale; }
}
