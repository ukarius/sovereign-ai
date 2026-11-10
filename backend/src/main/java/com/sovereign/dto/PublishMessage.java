package com.sovereign.dto;

import java.util.UUID;

/**
 * Message payload sent to RabbitMQ for multi-platform publishing.
 */
public class PublishMessage {

    private UUID postId;
    private UUID creatorId;
    private String platform;
    private String title;
    private String body;

    public PublishMessage() {}

    public PublishMessage(UUID postId, UUID creatorId, String platform, String title, String body) {
        this.postId = postId;
        this.creatorId = creatorId;
        this.platform = platform;
        this.title = title;
        this.body = body;
    }

    // ───── Getters & Setters ─────

    public UUID getPostId() { return postId; }
    public void setPostId(UUID postId) { this.postId = postId; }

    public UUID getCreatorId() { return creatorId; }
    public void setCreatorId(UUID creatorId) { this.creatorId = creatorId; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
}
