package com.hrms.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hrms.backend.dto.LoginRequest;
import com.hrms.backend.dto.LoginResponse;
import com.hrms.backend.entity.User;
import com.hrms.backend.services.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // No JWT/session yet - just checks the credentials and returns the user's
    // info so the frontend can store it (e.g. in React state or localStorage)
    // and use user.role to decide what to show/hide.
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        User user = userService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(new LoginResponse(user));
    }
}
