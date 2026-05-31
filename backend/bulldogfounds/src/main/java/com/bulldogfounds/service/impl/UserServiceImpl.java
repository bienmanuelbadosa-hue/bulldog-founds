package com.bulldogfounds.service.impl;

import com.bulldogfounds.dto.UserResponse;
import com.bulldogfounds.exception.ResourceNotFoundException;
import com.bulldogfounds.repository.UserRepository;
import com.bulldogfounds.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Concrete implementation of {@link UserService}.
 *
 * <p>Handles user profile retrievals and database ID resolution based on authenticated email.
 *
 * <p><b>OOP — Abstraction:</b> Controllers interact solely with the {@link UserService} interface,
 * shielding them from direct repository dependencies.
 *
 * <p><b>SOLID — DIP:</b> Exposes user operations through abstraction, ensuring that higher-level
 * components do not depend on details.
 *
 * <p><b>SOLID — SRP:</b> Focuses purely on reading and exposing user profiles, separate from
 * credentials and authentication logic (which belong to AuthServiceImpl).
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    /**
     * {@inheritDoc}
     *
     * @throws ResourceNotFoundException if no user exists with the given email
     */
    @Override
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
     * {@inheritDoc}
     *
     * @throws ResourceNotFoundException if no user exists with the given email
     */
    @Override
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
