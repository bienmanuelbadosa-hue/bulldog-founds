package com.bulldogfounds.controller;

import com.bulldogfounds.dto.UserResponse;
import com.bulldogfounds.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for user-related endpoints (such as profiles).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;

    /**
     * Retrieve the profile details of the currently authenticated user.
     *
     * @param authentication security authentication object containing principal details
     * @return response entity containing user response profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        log.info("GET /api/users/profile - Retrieving profile for user: {}", email);
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }
}
