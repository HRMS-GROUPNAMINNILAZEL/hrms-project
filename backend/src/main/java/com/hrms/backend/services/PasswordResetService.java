package com.hrms.backend.services;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.PasswordResetToken;
import com.hrms.backend.entity.User;
import com.hrms.backend.repository.PasswordResetTokenRepository;
import com.hrms.backend.repository.UserRepository;

@Service
public class PasswordResetService {

    private static final int TOKEN_VALID_MINUTES = 30;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Looks up the account by username or email and issues a fresh reset token.
     * Always returns normally (never throws for "user not found") so the
     * endpoint can give the same response either way and avoid leaking which
     * usernames/emails exist in the system.
     */
    public Optional<String> requestReset(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return Optional.empty();
        }

        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElse(null);

        if (user == null) {
            return Optional.empty();
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        return Optional.of(token);
    }

    public void resetPassword(String token, String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            throw new IllegalStateException("A new password is required.");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("This reset link is invalid."));

        if (Boolean.TRUE.equals(resetToken.getUsed())) {
            throw new IllegalStateException("This reset link has already been used.");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
