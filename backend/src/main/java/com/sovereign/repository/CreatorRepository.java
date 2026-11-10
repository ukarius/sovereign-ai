package com.sovereign.repository;

import com.sovereign.entity.Creator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreatorRepository extends JpaRepository<Creator, UUID> {

    Optional<Creator> findByEmail(String email);

    Optional<Creator> findBySlug(String slug);

    boolean existsByEmail(String email);

    /**
     * Phase 6 — DB-native weighted match scoring.
     * Calculates: (conversion_rate * 0.5) + (avg_engagement_rate * 0.3) = match_score
     * Filters by industry (niche), excludes soft-deleted creators, orders by score DESC.
     */
    @Query(value = """
            SELECT c.*,
                   (c.conversion_rate * 0.5 + c.avg_engagement_rate * 0.3) AS match_score
            FROM creators c
            WHERE c.niche = :industry
              AND c.is_deleted = false
            ORDER BY match_score DESC
            LIMIT :maxResults
            """, nativeQuery = true)
    List<Creator> findTopMatchesByIndustry(
            @Param("industry") String industry,
            @Param("maxResults") int maxResults
    );
}
