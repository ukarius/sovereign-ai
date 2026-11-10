package com.sovereign.service;

import com.sovereign.config.RabbitConfig;
import com.sovereign.dto.PublishMessage;
import com.sovereign.entity.Post;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Phase 3 — Publishing producer that sends messages to RabbitMQ per target platform.
 */
@Service
public class PublishingProducerService {

    private static final Logger log = LoggerFactory.getLogger(PublishingProducerService.class);

    private final RabbitTemplate rabbitTemplate;

    public PublishingProducerService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Iterate through a Post's target platforms and publish a message for each.
     */
    public void publishToAllPlatforms(Post post) {
        String[] platforms = post.getTargetPlatforms();
        if (platforms == null || platforms.length == 0) {
            log.warn("Post {} has no target platforms, skipping publish", post.getId());
            return;
        }

        for (String platform : platforms) {
            String routingKey = "publish." + platform.toLowerCase().trim();

            PublishMessage message = new PublishMessage(
                    post.getId(),
                    post.getCreator().getId(),
                    platform,
                    post.getTitle(),
                    post.getBody()
            );

            log.info("📤 Sending publish message to exchange={} routingKey={} postId={}",
                    RabbitConfig.PUBLISHING_EXCHANGE, routingKey, post.getId());

            rabbitTemplate.convertAndSend(RabbitConfig.PUBLISHING_EXCHANGE, routingKey, message);
        }
    }
}
