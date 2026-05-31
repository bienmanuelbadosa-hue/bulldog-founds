package com.bulldogfounds.service;

import com.bulldogfounds.dto.AuthResponse;
import com.bulldogfounds.dto.LoginRequest;
import com.bulldogfounds.dto.RegisterRequest;

/**
 * Service interface for authentication operations.
 *
 * <p>Abstraction layer between the AuthController and the concrete implementation.
 * Controllers depend on this interface (Dependency Inversion Principle),
 * making the system open for extension without modifying existing controller code
 * (Open/Closed Principle).
 *
 * <p>GRASP: Creator — defines the contract for creating authenticated User sessions.
 */
public interface AuthService {

    /**
     * Register a new user and return a JWT authentication response.
     *
     * @param registerRequest registration details
     * @return authentication response with JWT token
     */
    AuthResponse register(RegisterRequest registerRequest);

    /**
     * Authenticate an existing user and return a JWT authentication response.
     *
     * @param loginRequest login credentials
     * @return authentication response with JWT token
     */
    AuthResponse login(LoginRequest loginRequest);
}
