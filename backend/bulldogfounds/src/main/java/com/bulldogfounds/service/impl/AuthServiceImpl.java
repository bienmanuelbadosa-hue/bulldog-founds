package com.bulldogfounds.service.impl;

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
import com.bulldogfounds.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Concrete implementation of {@link AuthService}.
 *
 * <p>Handles user registration and login, enforcing business rules such as
 * unique email validation and password hashing. Delegates token generation
 * to {@link JwtTokenProvider}.
 *
 * <p><b>OOP — Abstraction:</b> Controllers reference {@link AuthService}
 * (the interface), not this class directly. The implementation detail is
 * fully hidden from callers.
 *
 * <p><b>SOLID — DIP:</b> {@link com.bulldogfounds.controller.AuthController}
 * depends on the {@link AuthService} abstraction, not this concrete class.
 *
 * <p><b>SOLID — SRP:</b> This class is solely responsible for authentication
 * orchestration (register + login). Token mechanics belong to JwtTokenProvider.
 *
 * <p><b>GRASP — Creator:</b> This class is responsible for creating {@link User}
 * entities as part of the registration workflow.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    /**
     * {@inheritDoc}
     *
     * @throws UserAlreadyExistsException if a user with the same email already exists
     */
    @Override
    public AuthResponse register(RegisterRequest registerRequest) {
        log.info("Registering new user with email: {}", registerRequest.getEmail());

        // Check if user already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            log.warn("Registration failed: Email {} already exists", registerRequest.getEmail());
            throw new UserAlreadyExistsException(
                    "User with email " + registerRequest.getEmail() + " already exists"
            );
        }

        // Create new user — GRASP Creator pattern
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
     * {@inheritDoc}
     *
     * @throws InvalidCredentialsException if email is not found or password does not match
     */
    @Override
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
     * Build the authentication response with JWT token and user details.
     *
     * @param token JWT token string
     * @param user  authenticated user entity
     * @return fully populated {@link AuthResponse}
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
