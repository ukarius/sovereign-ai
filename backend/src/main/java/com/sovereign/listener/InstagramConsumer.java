package com.sovereign.listener;

import com.sovereign.adapter.PlatformAdapter;
import com.sovereign.config.RabbitConfig;
import com.sovereign.dto.PublishMessage;
import com.sovereign.entity.Post;
import com.sovereign.repository.PostRepository;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Phase 3 — Instagram consumer with Bucket4j rate limiting.
 * Rejects messages to DLQ when rate limit is hit.
 */
@Component
public class InstagramConsumer {

    private static final Logger log = LoggerFactory.getLogger(InstagramConsumer.class);

    private final PlatformAdapter instagramAdapter;
    private final PostRepository postRepository;
    private final Bucket rateLimiter;

    public InstagramConsumer(
            @Qualifier("instagramAdapter") PlatformAdapter instagramAdapter,
            PostRepository postRepository) {
        this.instagramAdapter = instagramAdapter;
        this.postRepository = postRepository;

        // Rate limiter: 10 publishes per minute
        this.rateLimiter = Bucket.builder()
                .addLimit(Bandwidth.simple(10, Duration.ofMinutes(1)))
                .build();
    }

    @RabbitListener(queues = RabbitConfig.INSTAGRAM_QUEUE)
    public void consume(PublishMessage message) {
        log.info("📥 Received Instagram publish message for post: {}", message.getPostId());

        // Check rate limit
        if (!rateLimiter.tryConsume(1)) {
            log.warn("⚠️ Rate limit hit for Instagram. Rejecting message to DLQ for retry.");
            throw new AmqpRejectAndDontRequeueException("Rate limit exceeded — retry via DLQ");
        }

        // Fetch post and delegate to adapter
        Post post = postRepository.findById(message.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found: " + message.getPostId()));

        boolean success = instagramAdapter.publish(post);

        if (success) {
            post.setStatus("PUBLISHED");
            postRepository.save(post);
            log.info("✅ Instagram publish complete for post: {}", message.getPostId());
        } else {
            log.error("❌ Instagram publish failed for post: {}", message.getPostId());
            throw new AmqpRejectAndDontRequeueException("Publish failed — retry via DLQ");
        }
    }
}
