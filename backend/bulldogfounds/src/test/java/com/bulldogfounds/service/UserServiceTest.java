package com.bulldogfounds.service;

import com.bulldogfounds.dto.UserResponse;
import com.bulldogfounds.entity.User;
import com.bulldogfounds.enums.UserRole;
import com.bulldogfounds.exception.ResourceNotFoundException;
import com.bulldogfounds.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserService.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Unit Tests")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(42L)
                .firstName("Juan")
                .lastName("Dela Cruz")
                .email("juan@nu-laguna.edu.ph")
                .password("encodedPassword")
                .role(UserRole.STUDENT)
                .teamsLink("https://teams.microsoft.com/juan")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // --- getUserIdByEmail ---

    @Test
    @DisplayName("Should return user ID when email exists")
    void testGetUserIdByEmailSuccess() {
        // Arrange
        when(userRepository.findByEmail("juan@nu-laguna.edu.ph")).thenReturn(Optional.of(testUser));

        // Act
        Long userId = userService.getUserIdByEmail("juan@nu-laguna.edu.ph");

        // Assert
        assertThat(userId).isEqualTo(42L);
        verify(userRepository).findByEmail("juan@nu-laguna.edu.ph");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when email does not exist")
    void testGetUserIdByEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("unknown@nu-laguna.edu.ph")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUserIdByEmail("unknown@nu-laguna.edu.ph"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(userRepository).findByEmail("unknown@nu-laguna.edu.ph");
    }

    // --- getUserByEmail ---

    @Test
    @DisplayName("Should return UserResponse when email exists")
    void testGetUserByEmailSuccess() {
        // Arrange
        when(userRepository.findByEmail("juan@nu-laguna.edu.ph")).thenReturn(Optional.of(testUser));

        // Act
        UserResponse response = userService.getUserByEmail("juan@nu-laguna.edu.ph");

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(42L);
        assertThat(response.getEmail()).isEqualTo("juan@nu-laguna.edu.ph");
        assertThat(response.getFirstName()).isEqualTo("Juan");
        assertThat(response.getLastName()).isEqualTo("Dela Cruz");
        assertThat(response.getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(response.getTeamsLink()).isEqualTo("https://teams.microsoft.com/juan");

        verify(userRepository).findByEmail("juan@nu-laguna.edu.ph");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when email does not exist in getUserByEmail")
    void testGetUserByEmailNotFound() {
        // Arrange
        when(userRepository.findByEmail("nobody@nu-laguna.edu.ph")).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> userService.getUserByEmail("nobody@nu-laguna.edu.ph"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");

        verify(userRepository).findByEmail("nobody@nu-laguna.edu.ph");
    }
}
