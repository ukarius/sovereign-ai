package com.sovereign.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "landing_pages")
public class LandingPage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false, unique = true)
    private Creator creator;

    @Column(name = "variant_a_headline", nullable = false, length = 500)
    private String variantAHeadline = "Welcome to my page";

    @Column(name = "variant_b_headline", nullable = false, length = 500)
    private String variantBHeadline = "Discover my content";

    @Column(name = "variant_a_subtext", length = 1000)
    private String variantASubtext;

    @Column(name = "variant_b_subtext", length = 1000)
    private String variantBSubtext;

    @Column(name = "visits_a", nullable = false)
    private Long visitsA = 0L;

    @Column(name = "visits_b", nullable = false)
    private Long visitsB = 0L;

    @Column(name = "conversions_a", nullable = false)
    private Long conversionsA = 0L;

    @Column(name = "conversions_b", nullable = false)
    private Long conversionsB = 0L;

    @Column(name = "is_test_active", nullable = false)
    private Boolean isTestActive = true;

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

    public String getVariantAHeadline() { return variantAHeadline; }
    public void setVariantAHeadline(String variantAHeadline) { this.variantAHeadline = variantAHeadline; }

    public String getVariantBHeadline() { return variantBHeadline; }
    public void setVariantBHeadline(String variantBHeadline) { this.variantBHeadline = variantBHeadline; }

    public String getVariantASubtext() { return variantASubtext; }
    public void setVariantASubtext(String variantASubtext) { this.variantASubtext = variantASubtext; }

    public String getVariantBSubtext() { return variantBSubtext; }
    public void setVariantBSubtext(String variantBSubtext) { this.variantBSubtext = variantBSubtext; }

    public Long getVisitsA() { return visitsA; }
    public void setVisitsA(Long visitsA) { this.visitsA = visitsA; }

    public Long getVisitsB() { return visitsB; }
    public void setVisitsB(Long visitsB) { this.visitsB = visitsB; }

    public Long getConversionsA() { return conversionsA; }
    public void setConversionsA(Long conversionsA) { this.conversionsA = conversionsA; }

    public Long getConversionsB() { return conversionsB; }
    public void setConversionsB(Long conversionsB) { this.conversionsB = conversionsB; }

    public Boolean getIsTestActive() { return isTestActive; }
    public void setIsTestActive(Boolean isTestActive) { this.isTestActive = isTestActive; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
