package com.sovereign.repository;

import com.sovereign.entity.ConversionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ConversionEventRepository extends JpaRepository<ConversionEvent, UUID> {

    List<ConversionEvent> findByCreatorIdOrderByCreatedAtDesc(UUID creatorId);

    long countByCreatorIdAndEventType(UUID creatorId, String eventType);

    @org.springframework.data.jpa.repository.Query(
        value = "SELECT EXTRACT(HOUR FROM created_at) as hour_of_day " +
                "FROM conversion_events " +
                "WHERE creator_id = :creatorId AND created_at >= NOW() - INTERVAL '90 days' " +
                "GROUP BY EXTRACT(HOUR FROM created_at) " +
                "ORDER BY COUNT(*) DESC LIMIT 1",
        nativeQuery = true)
    Integer findBestPostingHourNative(@org.springframework.data.repository.query.Param("creatorId") UUID creatorId);
}
