package com.hrms.backend.security;

/**
 * Lightweight principal set on the SecurityContext by {@link JwtAuthenticationFilter}.
 * Controllers can pull this out with @AuthenticationPrincipal if they need the
 * calling user's id/username/role (e.g. for row-level checks in the future).
 */
public record AuthenticatedUser(Integer userId, String username, String role) {}