package com.sovereign.adapter;

import com.sovereign.entity.Post;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Mock Instagram adapter — simulates publishing to Instagram.
 */
@Component("instagramAdapter")
public class InstagramAdapter implements PlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(InstagramAdapter.class);

    @Override
    public boolean publish(Post post) {
        log.info("📸 [Instagram Mock] Publishing post: '{}' by creator: {}",
                post.getTitle(), post.getCreator().getName());

        // Simulate API call delay
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        log.info("✅ [Instagram Mock] Successfully published post: {}", post.getId());
        return true;
    }

    @Override
    public void refreshToken(String token) {
        log.info("🔄 [Instagram Mock] Token refreshed");
    }

    @Override
    public long getRateLimitDelay() {
        return 1000; // 1 second between publishes
    }
}
