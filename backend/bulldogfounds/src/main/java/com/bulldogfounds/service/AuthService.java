package com.bulldogfounds.service;

import com.bulldogfounds.dto.AuthResponse;
import com.bulldogfounds.dto.LoginRequest;
import com.bulldogfounds.dto.RegisterRequest;
import com.bulldogfounds.dto.UserResponse;
import com.bulldogfounds.entity.User;
import com.bulldogfounds.enums.UserRole;
import com.bulldogfounds.exception.InvalidCredentialsException;
import com.bulldogfounds.exception.UserAlreadyExistsException;
import com.bulldogfounds.repository.UserRepository;
import com.bulldogfounds.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication service handling user registration and login.
 * 
 * Responsibilities:
 * - Register new users
 * - Authenticate users and issue JWT tokens
 * - User credential validation
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    /**
     * Register a new user.
     * 
     * @param registerRequest registration details
     * @return authentication response with JWT token
     * @throws UserAlreadyExistsException if email already exists
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("Registration failed: Email {} already exists", registerRequest.getEmail());
            throw new UserAlreadyExistsException(
                    "User with email " + registerRequest.getEmail() + " already exists"
            );
        }

        // Create new user
        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole() != null ? registerRequest.getRole() : UserRole.STUDENT)
                .teamsLink(registerRequest.getTeamsLink())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with email: {}", savedUser.getEmail());

        // Generate JWT token
        String token = tokenProvider.generateToken(savedUser.getEmail());

        return buildAuthResponse(token, savedUser);
    }

    /**
     * Authenticate user and issue JWT token.
     * 
     * @param loginRequest login credentials
     * @return authentication response with JWT token
     * @throws InvalidCredentialsException if credentials are invalid
     */
    public AuthResponse login(LoginRequest loginRequest) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        // Find user by email
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found with email {}", loginRequest.getEmail());
                    return new InvalidCredentialsException("Invalid email or password");
                });

        // Validate password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Login failed: Invalid password for email {}", loginRequest.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getEmail());

        // Generate JWT token
        String token = tokenProvider.generateToken(user.getEmail());

        return buildAuthResponse(token, user);
    }

    /**
     * Build authentication response with JWT token and user details.
     * 
     * @param token JWT token
     * @param user user entity
     * @return authentication response
     */
    private AuthResponse buildAuthResponse(String token, User user) {
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .teamsLink(user.getTeamsLink())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getJwtExpirationMs() / 1000) // Convert to seconds
                .user(userResponse)
                .build();
    }
}
