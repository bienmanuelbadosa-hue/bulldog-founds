package com.bulldogfounds.service;

import com.bulldogfounds.dto.UserResponse;

/**
 * Service interface for user-related operations.
 *
 * <p>Defines the contract for retrieving and resolving user data.
 * Follows the Interface Segregation Principle (ISP) — this interface
 * exposes only the operations relevant to user profile management,
 * not authentication (which belongs to {@link AuthService}).
 *
 * <p>GRASP: Information Expert — owns knowledge about users and how
 * to resolve them from authentication context.
 */
public interface UserService {

    /**
     * Resolve a user's database ID from their email address.
     * Used by controllers to convert JWT principal (email) to a user ID.
     *
     * @param email the user's email extracted from JWT
     * @return the user's database ID
     */
    Long getUserIdByEmail(String email);

    /**
     * Get a user's full profile by their email address.
     *
     * @param email the user's email
     * @return user response DTO
     */
    UserResponse getUserByEmail(String email);
}
