package com.hrms.backend.dto;

public class ForgotPasswordRequest {
    private String usernameOrEmail;

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
}
