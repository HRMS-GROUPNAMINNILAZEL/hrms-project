package com.hrms.backend.dto;

import com.hrms.backend.entity.User;

// Safe to send back to the frontend - deliberately leaves out passwordHash.
public class LoginResponse {

    private Integer userId;
    private String username;
    private String email;
    private User.Role role;

    public LoginResponse(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
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
}
