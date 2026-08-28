package com.hrms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.dto.ForgotPasswordRequest;
import com.hrms.backend.dto.ForgotPasswordResponse;
import com.hrms.backend.dto.ResetPasswordRequest;
import com.hrms.backend.services.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String genericMessage = "If an account matches, a reset link has been generated.";

        return passwordResetService.requestReset(request.getUsernameOrEmail())
                .map(token -> ResponseEntity.ok(new ForgotPasswordResponse(genericMessage, token)))
                // Same response shape either way - only the presence of a token differs -
                // so the frontend/network tab can't be used to enumerate valid accounts.
                .orElseGet(() -> ResponseEntity.ok(new ForgotPasswordResponse(genericMessage, null)));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}
