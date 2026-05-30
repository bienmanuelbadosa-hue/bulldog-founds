package com.bulldogfounds.repository;

import com.bulldogfounds.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User entity.
 * 
 * Provides database access methods for user-related operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by email address.
     * 
     * @param email the user's email
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user exists with the given email.
     * 
     * @param email the user's email
     * @return true if user exists, false otherwise
     */
    Boolean existsByEmail(String email);
}
