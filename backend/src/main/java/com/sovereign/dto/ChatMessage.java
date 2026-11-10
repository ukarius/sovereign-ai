package com.sovereign.dto;

/**
 * Chat request / response DTOs for the AI sidebar.
 */
public class ChatMessage {

    private String message;
    private String response;

    public ChatMessage() {}

    public ChatMessage(String message, String response) {
        this.message = message;
        this.response = response;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}
