package com.hrms.backend.dto;

import com.hrms.backend.entity.User;

// Safe to send back to the frontend - deliberately leaves out passwordHash.
public class LoginResponse {

    private Integer userId;
    private String username;
    private String email;
    private User.Role role;
    private String token;

    public LoginResponse(User user, String token) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public User.Role getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}