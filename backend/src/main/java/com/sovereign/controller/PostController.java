package com.sovereign.controller;

import com.sovereign.entity.Creator;
import com.sovereign.entity.Post;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.repository.PostRepository;
import com.sovereign.service.AiTaggingService;
import com.sovereign.service.PublishingProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostRepository postRepository;
    private final CreatorRepository creatorRepository;
    private final AiTaggingService aiTaggingService;
    private final PublishingProducerService publishingProducerService;

    public PostController(PostRepository postRepository,
                          CreatorRepository creatorRepository,
                          AiTaggingService aiTaggingService,
                          PublishingProducerService publishingProducerService) {
        this.postRepository = postRepository;
        this.creatorRepository = creatorRepository;
        this.aiTaggingService = aiTaggingService;
        this.publishingProducerService = publishingProducerService;
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Map<String, Object> body, Authentication auth) {
        String email = (String) auth.getPrincipal();
        Creator creator = creatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        Post post = new Post();
        post.setCreator(creator);
        post.setTitle((String) body.get("title"));
        post.setBody((String) body.get("body"));

        @SuppressWarnings("unchecked")
        List<String> platforms = (List<String>) body.get("targetPlatforms");
        if (platforms != null) {
            post.setTargetPlatforms(platforms.toArray(new String[0]));
        }

        post = postRepository.save(post);

        // Trigger async AI tagging
        aiTaggingService.tagPost(post.getId());

        return ResponseEntity.ok(post);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getMyPosts(Authentication auth) {
        String email = (String) auth.getPrincipal();
        Creator creator = creatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        return ResponseEntity.ok(postRepository.findByCreatorIdOrderByCreatedAtDesc(creator.getId()));
    }

    @PostMapping("/{postId}/publish")
    public ResponseEntity<Map<String, String>> publishPost(@PathVariable UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        publishingProducerService.publishToAllPlatforms(post);

        post.setStatus("PUBLISHING");
        postRepository.save(post);

        return ResponseEntity.ok(Map.of("status", "Publishing initiated for all target platforms"));
    }
}
