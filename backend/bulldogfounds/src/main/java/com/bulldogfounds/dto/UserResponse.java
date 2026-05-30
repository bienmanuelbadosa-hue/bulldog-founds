package com.bulldogfounds.dto;

import com.bulldogfounds.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user response (sent to client after authentication or profile fetch).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private String teamsLink;
    private LocalDateTime createdAt;

    /**
     * Get the full name of the user.
     * 
     * @return full name (firstName + lastName)
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
