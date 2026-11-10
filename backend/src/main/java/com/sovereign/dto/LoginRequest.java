package com.sovereign.dto;

import java.util.UUID;

public class LoginRequest {

    private String email;
    private String password;

    // ───── Getters & Setters ─────

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
