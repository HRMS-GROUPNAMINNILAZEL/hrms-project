package com.hrms.backend.dto;

// In a production deployment this token would be emailed to the user instead
// of being handed back in the API response. This project has no SMTP/mail
// integration configured, so the reset link is returned directly for the
// admin/employee to use - clearly not something you'd ship publicly as-is.
public class ForgotPasswordResponse {
    private String message;
    private String resetToken;

    public ForgotPasswordResponse() {}

    public ForgotPasswordResponse(String message, String resetToken) {
        this.message = message;
        this.resetToken = resetToken;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
}
