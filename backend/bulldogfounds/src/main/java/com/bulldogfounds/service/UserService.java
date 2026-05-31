package com.bulldogfounds.service;

import com.bulldogfounds.dto.UserResponse;
import com.bulldogfounds.exception.ResourceNotFoundException;
import com.bulldogfounds.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for user-related operations.
 *
 * Responsibilities:
 * - Retrieve user profiles
 * - Resolve user identity from JWT email
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get the user ID associated with a given email address.
     * Used by controllers to resolve the authenticated user's database ID from JWT principal.
     *
     * @param email the user's email (extracted from JWT)
     * @return the user's database ID
     * @throws ResourceNotFoundException if no user exists with the given email
     */
    public Long getUserIdByEmail(String email) {
        log.debug("Resolving user ID for email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Authenticated user not found in DB for email: {}", email);
                    return new ResourceNotFoundException("User not found for email: " + email);
                })
                .getId();
    }

    /**
     * Get a user's profile by their email address.
     *
     * @param email the user's email
     * @return user response DTO
     * @throws ResourceNotFoundException if no user exists with the given email
     */
    public UserResponse getUserByEmail(String email) {
        log.debug("Fetching user profile for email: {}", email);
        return userRepository.findByEmail(email)
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .teamsLink(user.getTeamsLink())
                        .createdAt(user.getCreatedAt())
                        .build())
                .orElseThrow(() -> {
                    log.warn("User not found for email: {}", email);
                    return new ResourceNotFoundException("User not found for email: " + email);
                });
    }
}
