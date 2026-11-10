package com.sovereign.adapter;

import com.sovereign.entity.Post;

/**
 * Phase 3 — Platform adapter interface for the distributed publishing engine.
 * Each social platform gets its own implementation.
 */
public interface PlatformAdapter {

    /**
     * Publish a post to this platform.
     * @return true if successful
     */
    boolean publish(Post post);

    /**
     * Refresh the OAuth token for this platform.
     */
    void refreshToken(String token);

    /**
     * Get the rate limit delay in milliseconds before the next publish can occur.
     */
    long getRateLimitDelay();
}
