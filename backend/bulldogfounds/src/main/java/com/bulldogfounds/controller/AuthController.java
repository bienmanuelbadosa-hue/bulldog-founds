package com.bulldogfounds.controller;

import com.bulldogfounds.dto.AuthResponse;
import com.bulldogfounds.dto.LoginRequest;
import com.bulldogfounds.dto.RegisterRequest;
import com.bulldogfounds.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for authentication endpoints.
 * 
 * Handles:
 * - User registration
 * - User login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new user.
     * 
     * @param registerRequest user registration details
     * @return authentication response with JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest registerRequest
    ) {
        log.info("POST /api/auth/register - Registering user: {}", registerRequest.getEmail());
        AuthResponse response = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user.
     * 
     * @param loginRequest user login credentials
     * @return authentication response with JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest loginRequest
    ) {
        log.info("POST /api/auth/login - Login attempt for: {}", loginRequest.getEmail());
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
