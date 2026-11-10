package com.sovereign.controller;

import com.sovereign.dto.ChatMessage;
import com.sovereign.repository.CreatorRepository;
import com.sovereign.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai")
public class AiChatController {

    private final AiChatService aiChatService;
    private final CreatorRepository creatorRepository;

    public AiChatController(AiChatService aiChatService, CreatorRepository creatorRepository) {
        this.aiChatService = aiChatService;
        this.creatorRepository = creatorRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatMessage> chat(@RequestBody ChatMessage request, Authentication auth) {
        String email = (String) auth.getPrincipal();
        var creator = creatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Creator not found"));

        String response = aiChatService.chat(creator.getId(), request.getMessage());

        return ResponseEntity.ok(new ChatMessage(request.getMessage(), response));
    }
}
