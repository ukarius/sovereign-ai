package com.sovereign.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private Creator creator;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "target_platforms", columnDefinition = "TEXT[]")
    private String[] targetPlatforms;

    @Column(length = 20)
    private String status = "DRAFT";

    // ───── AI-generated tags ─────

    @Column(name = "ai_niche_tag", length = 100)
    private String aiNicheTag;

    @Column(name = "ai_tone_tag", length = 100)
    private String aiToneTag;

    @Column(name = "ai_target_demographic", length = 100)
    private String aiTargetDemographic;

    @Column(name = "ai_content_pillar", length = 100)
    private String aiContentPillar;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // ───── Getters & Setters ─────

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Creator getCreator() { return creator; }
    public void setCreator(Creator creator) { this.creator = creator; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String[] getTargetPlatforms() { return targetPlatforms; }
    public void setTargetPlatforms(String[] targetPlatforms) { this.targetPlatforms = targetPlatforms; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAiNicheTag() { return aiNicheTag; }
    public void setAiNicheTag(String aiNicheTag) { this.aiNicheTag = aiNicheTag; }

    public String getAiToneTag() { return aiToneTag; }
    public void setAiToneTag(String aiToneTag) { this.aiToneTag = aiToneTag; }

    public String getAiTargetDemographic() { return aiTargetDemographic; }
    public void setAiTargetDemographic(String aiTargetDemographic) { this.aiTargetDemographic = aiTargetDemographic; }

    public String getAiContentPillar() { return aiContentPillar; }
    public void setAiContentPillar(String aiContentPillar) { this.aiContentPillar = aiContentPillar; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
