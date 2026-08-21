package com.hrms.backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.hrms.backend.entity.User;

/**
 * Minimal signed-token utility (JWT-style: header.payload.signature, signed
 * with HMAC-SHA256). Built entirely on the JDK's javax.crypto so it doesn't
 * require adding a new Maven dependency (e.g. jjwt).
 *
 * Override the defaults in application.properties if you want to:
 *   hrms.jwt.secret=some-long-random-string
 *   hrms.jwt.expiration-ms=28800000
 */
@Component
public class JwtUtil {

    @Value("${hrms.jwt.secret:hrms-dev-secret-change-me-to-something-long-and-random-in-production}")
    private String secret;

    @Value("${hrms.jwt.expiration-ms:28800000}") // 8 hours
    private long expirationMs;

    private static final Base64.Encoder ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder DECODER = Base64.getUrlDecoder();
    private static final String HEADER_SEGMENT =
            ENCODER.encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        long exp = now + expirationMs;

        // Pipe-delimited claims: userId|username|role|issuedAt|expiresAt
        String rawPayload = user.getUserId() + "|" + user.getUsername() + "|" + user.getRole().name() + "|" + now + "|" + exp;
        String payloadSegment = ENCODER.encodeToString(rawPayload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(HEADER_SEGMENT + "." + payloadSegment);

        return HEADER_SEGMENT + "." + payloadSegment + "." + signature;
    }

    /** Returns the token's claims if the signature is valid and it hasn't expired, otherwise null. */
    public Claims validateAndParse(String token) {
        if (token == null) {
            return null;
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null;
        }

        String expectedSignature = sign(parts[0] + "." + parts[1]);
        if (!constantTimeEquals(expectedSignature, parts[2])) {
            return null; // tampered or forged
        }

        try {
            String rawPayload = new String(DECODER.decode(parts[1]), StandardCharsets.UTF_8);
            String[] fields = rawPayload.split("\\|", 5);
            if (fields.length != 5) {
                return null;
            }

            Integer userId = Integer.valueOf(fields[0]);
            String username = fields[1];
            String role = fields[2];
            long exp = Long.parseLong(fields[4]);

            if (exp < System.currentTimeMillis()) {
                return null; // expired
            }

            return new Claims(userId, username, role);
        } catch (Exception e) {
            return null; // malformed token
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return ENCODER.encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Unable to sign authentication token", e);
        }
    }

    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    public record Claims(Integer userId, String username, String role) {}
}