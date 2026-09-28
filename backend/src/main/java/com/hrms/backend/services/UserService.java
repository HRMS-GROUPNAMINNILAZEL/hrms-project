package com.hrms.backend.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hrms.backend.entity.User;
import com.hrms.backend.exception.ResourceNotFoundException;
import com.hrms.backend.repository.UserRepository;

import org.springframework.security.authentication.BadCredentialsException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    // The frontend should send the plain-text password in the "passwordHash" field;
    // it gets hashed here before it ever touches the database.
    public User createUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    public User updateUser(Integer userId, User updatedUser) {
        User existing = getUserById(userId);

        existing.setUsername(updatedUser.getUsername());
        existing.setEmail(updatedUser.getEmail());
        existing.setRole(updatedUser.getRole());
        existing.setIsActive(updatedUser.getIsActive());

        // only re-hash if a new password was actually provided
        if (updatedUser.getPasswordHash() != null && !updatedUser.getPasswordHash().isBlank()) {
            existing.setPasswordHash(passwordEncoder.encode(updatedUser.getPasswordHash()));
        }

        return userRepository.save(existing);
    }

    public void deleteUser(Integer userId) {
        User existing = getUserById(userId);
        userRepository.delete(existing);
    }

    // Checks username + plain-text password against the stored hash.
    // Throws BadCredentialsException if the username doesn't exist or the password is wrong
    // (kept as one generic error so we don't reveal which one was incorrect).
    public User login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadCredentialsException("This account has been deactivated");
        }

        return user;
    }

    // Self-service password change: verifies the old password first, then hashes
    // and stores the new one.  Throws BadCredentialsException if the old password
    // doesn't match so the frontend can show a clear error.
    public void changePassword(Integer userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalStateException("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
