package com.hrms.backend.config;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.hrms.backend.security.JwtAuthenticationFilter;

import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // No server-side session - each request must carry its own JWT.
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Return JSON (not Spring's default HTML/basic-auth prompt) for auth failures,
            // so the frontend's err.response.data.message handling keeps working.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    writeJsonError(response, HttpStatus.UNAUTHORIZED, "Please log in to continue."))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeJsonError(response, HttpStatus.FORBIDDEN, "You don't have permission to do that."))
            )
            .authorizeHttpRequests(auth -> auth
                // The browser sends a CORS preflight OPTIONS request before the real
                // request whenever it includes an Authorization header - always allow it.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Logging in is the one endpoint that doesn't require a token yet.
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()

                // System user accounts (login credentials) - admin only.
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Departments - any signed-in user can read (dropdowns, dashboards);
                // only admin/hr can add, edit, or remove one.
                .requestMatchers(HttpMethod.GET, "/api/departments/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/departments/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasAnyRole("ADMIN", "HR")

                // Employees - any signed-in user can read (employees look themselves up
                // on their own dashboard); only admin/hr can add, edit, or remove one.
                .requestMatchers(HttpMethod.GET, "/api/employees/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.PUT, "/api/employees/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.DELETE, "/api/employees/**").hasAnyRole("ADMIN", "HR")

                // Attendance - any signed-in user can view/clock themselves in and out;
                // only admin/hr can delete an attendance record.
                .requestMatchers(HttpMethod.GET, "/api/attendance/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/attendance/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/attendance/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/attendance/**").hasAnyRole("ADMIN", "HR")

                // Leave requests - any signed-in user can view/file their own;
                // admin/hr/manager can approve or reject; only admin/hr can edit or delete.
                .requestMatchers(HttpMethod.GET, "/api/leave-requests/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/leave-requests/**").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/leave-requests/*/approve").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/leave-requests/*/reject").hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/leave-requests/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.DELETE, "/api/leave-requests/**").hasAnyRole("ADMIN", "HR")

                // Payroll - any signed-in user can view their own payslips;
                // only admin/hr can create, edit, or delete payroll records.
                .requestMatchers(HttpMethod.GET, "/api/payroll/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/payroll/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.PUT, "/api/payroll/**").hasAnyRole("ADMIN", "HR")
                .requestMatchers(HttpMethod.DELETE, "/api/payroll/**").hasAnyRole("ADMIN", "HR")

                // Anything not covered above still needs a valid token.
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    private void writeJsonError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }

    // Allows the React + Vite dev server to call this API from the browser.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}