package com.sovereign.repository;

import com.sovereign.entity.LandingPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LandingPageRepository extends JpaRepository<LandingPage, UUID> {

    Optional<LandingPage> findByCreatorId(UUID creatorId);

    Optional<LandingPage> findByCreatorSlug(String slug);

    /**
     * Atomically increment visit count for Variant A.
     */
    @Modifying
    @Query("UPDATE LandingPage lp SET lp.visitsA = lp.visitsA + 1 WHERE lp.id = :id")
    void incrementVisitsA(@Param("id") UUID id);

    /**
     * Atomically increment visit count for Variant B.
     */
    @Modifying
    @Query("UPDATE LandingPage lp SET lp.visitsB = lp.visitsB + 1 WHERE lp.id = :id")
    void incrementVisitsB(@Param("id") UUID id);

    /**
     * Atomically increment conversion count for Variant A.
     */
    @Modifying
    @Query("UPDATE LandingPage lp SET lp.conversionsA = lp.conversionsA + 1 WHERE lp.id = :id")
    void incrementConversionsA(@Param("id") UUID id);

    /**
     * Atomically increment conversion count for Variant B.
     */
    @Modifying
    @Query("UPDATE LandingPage lp SET lp.conversionsB = lp.conversionsB + 1 WHERE lp.id = :id")
    void incrementConversionsB(@Param("id") UUID id);
}
