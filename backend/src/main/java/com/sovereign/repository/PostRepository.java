package com.sovereign.repository;

import com.sovereign.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByCreatorIdOrderByCreatedAtDesc(UUID creatorId);

    List<Post> findByCreatorIdAndStatus(UUID creatorId, String status);

    long countByCreatorIdAndStatus(UUID creatorId, String status);
}
