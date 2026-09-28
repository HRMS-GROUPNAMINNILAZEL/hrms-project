package com.hrms.backend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.dto.LoginRequest;
import com.hrms.backend.dto.LoginResponse;
import com.hrms.backend.entity.User;
import com.hrms.backend.security.AuthenticatedUser;
import com.hrms.backend.security.JwtUtil;
import com.hrms.backend.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Checks the credentials, then issues a signed token. The frontend attaches
    // it as "Authorization: Bearer <token>" on every request after this; see
    // SecurityConfig for how the token gets validated and mapped to roles.
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getUsername(), request.getPassword());
        String token = jwtUtil.generateToken(user);
        return ResponseEntity.ok(new LoginResponse(user, token));
    }

    // Self-service password change for any authenticated user.
    // Body: { "currentPassword": "...", "newPassword": "..." }
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestBody Map<String, String> body) {
        userService.changePassword(
                principal.userId(),
                body.get("currentPassword"),
                body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}